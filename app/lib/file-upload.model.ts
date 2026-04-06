/**
 * Smart File Manager - TypeScript Type Definitions
 * 
 * This file contains all TypeScript interfaces, types, and enums for the
 * Smart File Manager system, supporting file upload, progress tracking,
 * and archive management functionality.
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * File type classification categories
 * Used for automatic file categorization based on MIME type and extension
 */
export enum FileType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    UNCLASSIFIED = 'unclassified'
}

/**
 * Upload status for tracking file upload lifecycle
 */
export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Represents a file in the upload system with all metadata
 */
export interface FileUpload {
    id: string;
    fileName: string;
    originalName: string;
    fileType: FileType;
    mimeType: string;
    fileSize: number;
    filePath?: string;
    fileUrl?: string;
    status: UploadStatus;
    uploadSessionId?: string;
    totalChunks: number;
    uploadedChunks: number;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * Progress tracking information for a file being uploaded
 */
export interface FileProgress {
    fileId: string;
    fileName: string;
    fileType: FileType;
    progress: number; // 0-100 percentage
    status: UploadStatus;
    url?: string;
    error?: string;
    uploadedBytes?: number;
    totalBytes?: number;
}

/**
 * Represents a chunk of a large file for chunked upload
 */
export interface Chunk {
    data: Blob;
    index: number;
    total: number;
    size: number;
}

/**
 * Result of file validation
 */
export interface ValidationResult {
    valid: boolean;
    file: File;
    errors?: string[];
    fileType?: FileType;
}

/**
 * Upload session for tracking batch uploads
 */
export interface UploadSession {
    id: string;
    sessionId: string;
    userId: number;
    status: 'active' | 'completed' | 'expired' | 'cancelled';
    totalFiles: number;
    completedFiles: number;
    failedFiles: number;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request to initiate a file upload
 */
export interface InitiateUploadRequest {
    fileName: string;
    fileSize: number;
    fileType: FileType;
    mimeType: string;
    totalChunks: number;
}

/**
 * Response from upload initiation
 */
export interface InitiateUploadResponse {
    success: boolean;
    data: {
        fileId: string;
        uploadUrl: string;
        expiresAt: string;
    };
}

/**
 * Request to upload a file chunk
 */
export interface ChunkUploadRequest {
    fileId: string;
    chunkIndex: number;
    totalChunks: number;
    chunk: Blob;
}

/**
 * Response from chunk upload
 */
export interface ChunkResponse {
    success: boolean;
    data: {
        fileId: string;
        chunkIndex: number;
        uploadedChunks: number;
        totalChunks: number;
    };
}

/**
 * Response from finalizing upload
 */
export interface FinalizeResponse {
    success: boolean;
    data: {
        fileId: string;
        url: string;
        fileName: string;
        fileSize: number;
        fileType: FileType;
        uploadedAt: string;
    };
}

/**
 * Request to search/filter archived files
 */
export interface ArchiveSearchRequest {
    searchTerm?: string;
    fileType?: FileType;
    status?: UploadStatus;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'name' | 'date' | 'size' | 'type';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
}

/**
 * Response from archive query
 */
export interface ArchiveResponse {
    success: boolean;
    data: {
        files: FileUpload[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalRecords: number;
            perPage: number;
        };
    };
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Generic API response wrapper
 */
export type ApiResponse<T> =
    | { success: true; data: T }
    | ApiErrorResponse;

// ============================================================================
// Component Props and State Types
// ============================================================================

/**
 * Configuration for file upload component
 */
export interface FileUploadConfig {
    maxFileSize: number; // in bytes
    maxFiles: number;
    allowedTypes: string[]; // MIME types
    chunkSize: number; // in bytes
    maxConcurrentUploads: number;
    autoStart: boolean;
}

/**
 * File with additional metadata for upload queue
 */
export interface QueuedFile {
    id: string;
    file: File;
    fileType: FileType;
    status: UploadStatus;
    progress: number;
    error?: string;
    retryCount: number;
    uploadedChunks: number;
    totalChunks: number;
    url?: string;
}

/**
 * Upload queue state
 */
export interface UploadQueueState {
    files: QueuedFile[];
    activeUploads: number;
    totalFiles: number;
    completedFiles: number;
    failedFiles: number;
}

// ============================================================================
// Service/Manager Interfaces
// ============================================================================

/**
 * File upload manager interface
 */
export interface FileUploadManager {
    selectFiles(files: File[]): Promise<ValidationResult[]>;
    startUpload(files: File[]): Promise<void>;
    getUploadProgress(fileId: string): FileProgress | undefined;
    pauseUpload(fileId: string): void;
    resumeUpload(fileId: string): void;
    cancelUpload(fileId: string): void;
    retryUpload(fileId: string): void;
}

/**
 * File classifier interface
 */
export interface FileClassifier {
    classifyFile(file: File): FileType;
    getMimeType(file: File): string;
    generateThumbnail(file: File): Promise<string | null>;
}

/**
 * Chunk processor interface
 */
export interface ChunkProcessor {
    shouldChunk(file: File): boolean;
    createChunks(file: File): Chunk[];
    uploadChunk(chunk: Chunk, fileId: string): Promise<ChunkResponse>;
    finalizeUpload(fileId: string): Promise<FinalizeResponse>;
}

/**
 * Progress tracker interface
 */
export interface ProgressTracker {
    updateProgress(fileId: string, progress: number): void;
    setStatus(fileId: string, status: UploadStatus): void;
    getFileProgress(fileId: string): FileProgress | undefined;
    getAllProgress(): FileProgress[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * File metadata extracted from File object
 */
export interface FileMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

/**
 * Thumbnail data for preview
 */
export interface ThumbnailData {
    fileId: string;
    dataUrl: string;
    width: number;
    height: number;
}

/**
 * Export data for Excel generation
 */
export interface ExportFileData {
    fileName: string;
    fileType: FileType;
    fileUrl: string;
    uploadDate: string;
    fileSize: number;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
    maxAttempts: number;
    initialDelay: number; // milliseconds
    maxDelay: number; // milliseconds
    backoffMultiplier: number;
}

/**
 * Upload statistics
 */
export interface UploadStatistics {
    totalUploads: number;
    successfulUploads: number;
    failedUploads: number;
    totalBytes: number;
    averageUploadTime: number; // milliseconds
}
