/**
 * Smart File Manager - Upload Queue Manager Service
 * 
 * This service manages the upload queue, handles concurrent upload limiting,
 * implements retry logic with exponential backoff, and provides upload control
 * methods (pause, resume, cancel).
 * 
 * Requirements: 7.1, 7.2, 7.3, 10.2
 */

import { EventEmitter } from 'events';
import {
    QueuedFile,
    UploadStatus,
    FileType,
    InitiateUploadRequest,
    InitiateUploadResponse,
    ChunkResponse,
    FinalizeResponse,
} from './file-upload.model';
import { chunkProcessorService } from './chunk-processor.service';
import { fileClassifierService } from './file-classifier.service';
import axios from 'axios';
import { buildApiUrl } from './api';

/**
 * Configuration for the upload queue manager
 */
interface QueueConfig {
    maxConcurrentUploads: number;
    maxRetryAttempts: number;
    initialRetryDelay: number; // milliseconds
    maxRetryDelay: number; // milliseconds
    backoffMultiplier: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: QueueConfig = {
    maxConcurrentUploads: 3,
    maxRetryAttempts: 5,
    initialRetryDelay: 1000, // 1 second
    maxRetryDelay: 16000, // 16 seconds
    backoffMultiplier: 2,
};

/**
 * Progress event data
 */
export interface ProgressEvent {
    fileId: string;
    fileName: string;
    progress: number;
    status: UploadStatus;
    uploadedBytes?: number;
    totalBytes?: number;
    error?: string;
    url?: string;
}

/**
 * UploadQueueManager
 * 
 * Manages the upload queue with concurrent upload limiting, retry logic,
 * and upload control capabilities.
 */
export class UploadQueueManager extends EventEmitter {
    private queue: QueuedFile[] = [];
    private activeUploads: Map<string, QueuedFile> = new Map();
    private pausedUploads: Set<string> = new Set();
    private config: QueueConfig;

    constructor(config: Partial<QueueConfig> = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Adds files to the upload queue.
     * 
     * @param files - Array of File objects to add to the queue
     * 
     * **Validates: Requirements 7.1, 9.2**
     */
    addToQueue(files: File[]): void {
        const queuedFiles: QueuedFile[] = files.map((file) => {
            const fileType = fileClassifierService.classifyFile(file);
            const totalChunks = chunkProcessorService.shouldChunk(file)
                ? chunkProcessorService.createChunks(file).length
                : 1;

            const queuedFile: QueuedFile = {
                id: this.generateFileId(),
                file,
                fileType,
                status: UploadStatus.PENDING,
                progress: 0,
                retryCount: 0,
                uploadedChunks: 0,
                totalChunks,
            };

            return queuedFile;
        });

        this.queue.push(...queuedFiles);

        // Emit events for each added file
        queuedFiles.forEach((queuedFile) => {
            this.emitProgress(queuedFile);
        });

        // Start processing the queue
        this.processQueue();
    }

    /**
     * Processes the upload queue with concurrent upload limiting.
     * Ensures no more than maxConcurrentUploads files are uploading simultaneously.
     * 
     * **Validates: Requirements 7.2, 10.2**
     */
    async processQueue(): Promise<void> {
        // Check if we can start more uploads
        while (
            this.activeUploads.size < this.config.maxConcurrentUploads &&
            this.queue.length > 0
        ) {
            const queuedFile = this.queue.shift();
            if (!queuedFile) break;

            // Skip paused files
            if (this.pausedUploads.has(queuedFile.id)) {
                this.queue.push(queuedFile);
                continue;
            }

            // Start upload
            this.activeUploads.set(queuedFile.id, queuedFile);
            this.uploadFile(queuedFile);
        }
    }

    /**
     * Uploads a single file with retry logic and exponential backoff.
     * 
     * @param queuedFile - The queued file to upload
     * 
     * **Validates: Requirements 7.3**
     */
    private async uploadFile(queuedFile: QueuedFile): Promise<void> {
        try {
            // Update status to uploading
            queuedFile.status = UploadStatus.UPLOADING;
            this.emitProgress(queuedFile);

            // Step 1: Initiate upload
            const initiateResponse = await this.initiateUpload(queuedFile);
            const fileId = initiateResponse.data.fileId;

            // Step 2: Upload file (chunked or direct)
            if (chunkProcessorService.shouldChunk(queuedFile.file)) {
                await this.uploadChunked(queuedFile, fileId);
            } else {
                await this.uploadDirect(queuedFile, fileId);
            }

            // Step 3: Finalize upload
            const finalizeResponse = await chunkProcessorService.finalizeUpload(fileId);

            // Update status to completed
            queuedFile.status = UploadStatus.COMPLETED;
            queuedFile.progress = 100;
            queuedFile.url = finalizeResponse.data.url;
            this.emitProgress(queuedFile);

            // Remove from active uploads
            this.activeUploads.delete(queuedFile.id);

            // Process next file in queue
            this.processQueue();
        } catch (error) {
            await this.handleUploadError(queuedFile, error);
        }
    }

    /**
     * Initiates an upload by sending file metadata to the server.
     * 
     * @param queuedFile - The queued file to initiate
     * @returns Promise resolving to InitiateUploadResponse
     */
    private async initiateUpload(queuedFile: QueuedFile): Promise<InitiateUploadResponse> {
        const request: InitiateUploadRequest = {
            fileName: queuedFile.file.name,
            fileSize: queuedFile.file.size,
            fileType: queuedFile.fileType,
            mimeType: queuedFile.file.type,
            totalChunks: queuedFile.totalChunks,
        };

        const response = await axios.post<InitiateUploadResponse>(
            buildApiUrl('/api/files/upload/initiate'),
            request
        );

        return response.data;
    }

    /**
     * Uploads a file using chunked upload.
     * 
     * @param queuedFile - The queued file to upload
     * @param fileId - The server-assigned file ID
     */
    private async uploadChunked(queuedFile: QueuedFile, fileId: string): Promise<void> {
        const chunks = chunkProcessorService.createChunks(queuedFile.file);

        // Set progress callback
        chunkProcessorService.setProgressCallback(fileId, (progress, uploadedBytes, totalBytes) => {
            queuedFile.progress = Math.min(progress, 99); // Cap at 99% until finalized
            this.emitProgress(queuedFile, uploadedBytes, totalBytes);
        });

        // Upload chunks sequentially
        for (const chunk of chunks) {
            // Check if upload is paused
            if (this.pausedUploads.has(queuedFile.id)) {
                throw new Error('Upload paused');
            }

            const response: ChunkResponse = await chunkProcessorService.uploadChunk(chunk, fileId);
            queuedFile.uploadedChunks = response.data.uploadedChunks;
        }
    }

    /**
     * Uploads a file directly (without chunking).
     * 
     * @param queuedFile - The queued file to upload
     * @param fileId - The server-assigned file ID
     */
    private async uploadDirect(queuedFile: QueuedFile, fileId: string): Promise<void> {
        const formData = new FormData();
        formData.append('fileId', fileId);
        formData.append('chunkIndex', '0');
        formData.append('totalChunks', '1');
        formData.append('chunk', queuedFile.file);

        await axios.post(
            buildApiUrl('/api/files/upload/chunk'),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        queuedFile.progress = Math.min(
                            (progressEvent.loaded / progressEvent.total) * 99,
                            99
                        );
                        this.emitProgress(
                            queuedFile,
                            progressEvent.loaded,
                            progressEvent.total
                        );
                    }
                },
            }
        );

        queuedFile.uploadedChunks = 1;
    }

    /**
     * Handles upload errors with retry logic and exponential backoff.
     * 
     * @param queuedFile - The queued file that failed
     * @param error - The error that occurred
     * 
     * **Validates: Requirements 7.3, 7.4, 7.6**
     */
    private async handleUploadError(queuedFile: QueuedFile, error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Check if upload was paused (not an error)
        if (errorMessage === 'Upload paused') {
            return;
        }

        // Increment retry count
        queuedFile.retryCount++;

        // Check if we should retry
        if (queuedFile.retryCount <= this.config.maxRetryAttempts) {
            // Calculate delay with exponential backoff
            const delay = Math.min(
                this.config.initialRetryDelay * Math.pow(this.config.backoffMultiplier, queuedFile.retryCount - 1),
                this.config.maxRetryDelay
            );

            // Update status and emit progress
            queuedFile.status = UploadStatus.PENDING;
            queuedFile.error = `Retrying... (Attempt ${queuedFile.retryCount}/${this.config.maxRetryAttempts})`;
            this.emitProgress(queuedFile);

            // Wait for delay
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Remove from active uploads and add back to queue
            this.activeUploads.delete(queuedFile.id);
            this.queue.unshift(queuedFile); // Add to front of queue

            // Process queue
            this.processQueue();
        } else {
            // Max retries exceeded - mark as failed
            queuedFile.status = UploadStatus.FAILED;
            queuedFile.error = errorMessage;
            this.emitProgress(queuedFile);

            // Remove from active uploads
            this.activeUploads.delete(queuedFile.id);

            // Process next file in queue
            this.processQueue();
        }
    }

    /**
     * Pauses an upload.
     * 
     * @param fileId - The ID of the file to pause
     */
    pauseUpload(fileId: string): void {
        this.pausedUploads.add(fileId);

        // Update status if file is in active uploads
        const queuedFile = this.activeUploads.get(fileId);
        if (queuedFile) {
            queuedFile.status = UploadStatus.PENDING;
            queuedFile.error = 'Upload paused';
            this.emitProgress(queuedFile);
        }
    }

    /**
     * Resumes a paused upload.
     * 
     * @param fileId - The ID of the file to resume
     */
    resumeUpload(fileId: string): void {
        this.pausedUploads.delete(fileId);

        // Find file in queue or active uploads
        const queuedFile = this.activeUploads.get(fileId) || this.queue.find((f) => f.id === fileId);
        if (queuedFile) {
            queuedFile.status = UploadStatus.PENDING;
            queuedFile.error = undefined;
            this.emitProgress(queuedFile);

            // Process queue to resume upload
            this.processQueue();
        }
    }

    /**
     * Cancels an upload.
     * 
     * @param fileId - The ID of the file to cancel
     */
    async cancelUpload(fileId: string): Promise<void> {
        // Remove from paused uploads
        this.pausedUploads.delete(fileId);

        // Find file in active uploads or queue
        const activeFile = this.activeUploads.get(fileId);
        const queuedFile = activeFile || this.queue.find((f) => f.id === fileId);

        if (queuedFile) {
            // Update status
            queuedFile.status = UploadStatus.CANCELLED;
            queuedFile.error = 'Upload cancelled';
            this.emitProgress(queuedFile);

            // Remove from active uploads
            if (activeFile) {
                this.activeUploads.delete(fileId);
            }

            // Remove from queue
            this.queue = this.queue.filter((f) => f.id !== fileId);

            // Notify server to cancel upload (if it was initiated)
            try {
                await axios.delete(buildApiUrl(`/api/files/upload/cancel/${fileId}`));
            } catch (error) {
                // Ignore errors from server cancellation
                console.error('Failed to cancel upload on server:', error);
            }

            // Process next file in queue
            this.processQueue();
        }
    }

    /**
     * Emits a progress event for UI updates.
     * 
     * @param queuedFile - The queued file to emit progress for
     * @param uploadedBytes - Optional uploaded bytes
     * @param totalBytes - Optional total bytes
     */
    private emitProgress(
        queuedFile: QueuedFile,
        uploadedBytes?: number,
        totalBytes?: number
    ): void {
        const progressEvent: ProgressEvent = {
            fileId: queuedFile.id,
            fileName: queuedFile.file.name,
            progress: queuedFile.progress,
            status: queuedFile.status,
            uploadedBytes,
            totalBytes,
            error: queuedFile.error,
            url: queuedFile.url,
        };

        this.emit('progress', progressEvent);
    }

    /**
     * Generates a unique file ID.
     * 
     * @returns A unique file ID
     */
    private generateFileId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Gets the current queue state.
     * 
     * @returns Object containing queue statistics
     */
    getQueueState() {
        const allFiles = [...this.activeUploads.values(), ...this.queue];
        return {
            totalFiles: allFiles.length,
            activeUploads: this.activeUploads.size,
            queuedFiles: this.queue.length,
            completedFiles: allFiles.filter((f) => f.status === UploadStatus.COMPLETED).length,
            failedFiles: allFiles.filter((f) => f.status === UploadStatus.FAILED).length,
        };
    }

    /**
     * Gets all files in the queue and active uploads.
     * 
     * @returns Array of all queued files
     */
    getAllFiles(): QueuedFile[] {
        return [...this.activeUploads.values(), ...this.queue];
    }

    /**
     * Clears completed and failed files from the queue.
     */
    clearCompleted(): void {
        // Remove completed and failed files from active uploads
        for (const [fileId, file] of this.activeUploads.entries()) {
            if (file.status === UploadStatus.COMPLETED || file.status === UploadStatus.FAILED) {
                this.activeUploads.delete(fileId);
            }
        }

        // Remove completed and failed files from queue
        this.queue = this.queue.filter(
            (f) => f.status !== UploadStatus.COMPLETED && f.status !== UploadStatus.FAILED
        );
    }
}

/**
 * Singleton instance of UploadQueueManager
 */
export const uploadQueueManager = new UploadQueueManager();
