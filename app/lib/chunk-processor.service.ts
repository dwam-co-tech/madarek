/**
 * Smart File Manager - Chunk Processor Service
 * 
 * This service handles chunking of large files for upload, manages chunk
 * transmission, and coordinates the finalization of chunked uploads.
 * 
 * Requirements: 6.1, 6.2
 */

import axios, { AxiosProgressEvent } from 'axios';
import {
    ChunkProcessor,
    Chunk,
    ChunkResponse,
    FinalizeResponse,
} from './file-upload.model';
import { buildApiUrl } from './api';

/**
 * Configuration constants for chunk processing
 */
const CHUNK_THRESHOLD = 5 * 1024 * 1024; // 5MB - files larger than this will be chunked
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB - size of each chunk

/**
 * Progress callback type for upload progress tracking
 */
export type ProgressCallback = (progress: number, uploadedBytes: number, totalBytes: number) => void;

/**
 * ChunkProcessorService
 * 
 * Provides methods for determining if a file should be chunked, creating chunks,
 * uploading chunks with progress tracking, and finalizing chunked uploads.
 */
export class ChunkProcessorService implements ChunkProcessor {
    private progressCallbacks: Map<string, ProgressCallback> = new Map();

    /**
     * Determines if a file should be chunked based on its size.
     * Files larger than 5MB will be chunked.
     * 
     * @param file - The File object to check
     * @returns true if the file should be chunked, false otherwise
     * 
     * **Validates: Requirements 6.1**
     */
    shouldChunk(file: File): boolean {
        return file.size > CHUNK_THRESHOLD;
    }

    /**
     * Creates chunks from a file for chunked upload.
     * Each chunk is 2MB in size, except the last chunk which contains the remainder.
     * 
     * @param file - The File object to chunk
     * @returns Array of Chunk objects
     * 
     * **Validates: Requirements 6.1**
     */
    createChunks(file: File): Chunk[] {
        const chunks: Chunk[] = [];
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunkBlob = file.slice(start, end);

            chunks.push({
                data: chunkBlob,
                index: i,
                total: totalChunks,
                size: chunkBlob.size,
            });
        }

        return chunks;
    }

    /**
     * Uploads a single chunk to the server with progress tracking.
     * 
     * @param chunk - The Chunk object to upload
     * @param fileId - The unique identifier for the file
     * @returns Promise resolving to ChunkResponse
     * 
     * **Validates: Requirements 6.2**
     */
    async uploadChunk(chunk: Chunk, fileId: string): Promise<ChunkResponse> {
        const formData = new FormData();
        formData.append('fileId', fileId);
        formData.append('chunkIndex', chunk.index.toString());
        formData.append('totalChunks', chunk.total.toString());
        formData.append('chunk', chunk.data);

        const progressCallback = this.progressCallbacks.get(fileId);

        try {
            const response = await axios.post<ChunkResponse>(
                buildApiUrl('/api/files/upload/chunk'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (progressCallback && progressEvent.total) {
                            // Calculate progress for this chunk
                            const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100;

                            // Calculate overall progress based on completed chunks + current chunk progress
                            const completedChunks = chunk.index;
                            const totalChunks = chunk.total;
                            const overallProgress =
                                ((completedChunks + (chunkProgress / 100)) / totalChunks) * 100;

                            // Calculate total uploaded bytes
                            const uploadedBytes = (completedChunks * CHUNK_SIZE) + progressEvent.loaded;
                            const totalBytes = totalChunks * CHUNK_SIZE;

                            progressCallback(overallProgress, uploadedBytes, totalBytes);
                        }
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    `Chunk upload failed: ${error.response?.data?.error?.message || error.message}`
                );
            }
            throw error;
        }
    }

    /**
     * Finalizes the upload after all chunks have been uploaded.
     * This triggers the server to reassemble the chunks into the final file.
     * 
     * @param fileId - The unique identifier for the file
     * @returns Promise resolving to FinalizeResponse with file URL and metadata
     * 
     * **Validates: Requirements 6.3**
     */
    async finalizeUpload(fileId: string): Promise<FinalizeResponse> {
        try {
            const response = await axios.post<FinalizeResponse>(
                buildApiUrl('/api/files/upload/finalize'),
                { fileId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Clean up progress callback after finalization
            this.progressCallbacks.delete(fileId);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    `Upload finalization failed: ${error.response?.data?.error?.message || error.message}`
                );
            }
            throw error;
        }
    }

    /**
     * Registers a progress callback for a specific file upload.
     * The callback will be invoked during chunk uploads to report progress.
     * 
     * @param fileId - The unique identifier for the file
     * @param callback - The callback function to invoke with progress updates
     */
    setProgressCallback(fileId: string, callback: ProgressCallback): void {
        this.progressCallbacks.set(fileId, callback);
    }

    /**
     * Removes the progress callback for a specific file upload.
     * 
     * @param fileId - The unique identifier for the file
     */
    removeProgressCallback(fileId: string): void {
        this.progressCallbacks.delete(fileId);
    }

    /**
     * Gets the chunk size used by this service.
     * 
     * @returns The chunk size in bytes
     */
    getChunkSize(): number {
        return CHUNK_SIZE;
    }

    /**
     * Gets the chunk threshold used by this service.
     * 
     * @returns The chunk threshold in bytes
     */
    getChunkThreshold(): number {
        return CHUNK_THRESHOLD;
    }
}

/**
 * Singleton instance of ChunkProcessorService
 */
export const chunkProcessorService = new ChunkProcessorService();
