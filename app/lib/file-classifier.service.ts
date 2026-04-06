/**
 * Smart File Manager - File Classifier Service
 * 
 * This service provides intelligent file type detection and classification
 * based on MIME types and file extensions. It also generates thumbnails
 * for image and video files.
 * 
 * Requirements: 1.2, 9.4
 */

import { FileType, FileClassifier } from './file-upload.model';

/**
 * MIME type to FileType category mapping
 */
const MIME_TYPE_MAP: Record<string, FileType> = {
    // Images
    'image/jpeg': FileType.IMAGE,
    'image/jpg': FileType.IMAGE,
    'image/png': FileType.IMAGE,
    'image/gif': FileType.IMAGE,
    'image/webp': FileType.IMAGE,
    'image/svg+xml': FileType.IMAGE,
    'image/bmp': FileType.IMAGE,
    'image/tiff': FileType.IMAGE,
    'image/x-icon': FileType.IMAGE,

    // Videos
    'video/mp4': FileType.VIDEO,
    'video/mpeg': FileType.VIDEO,
    'video/quicktime': FileType.VIDEO,
    'video/x-msvideo': FileType.VIDEO,
    'video/x-flv': FileType.VIDEO,
    'video/webm': FileType.VIDEO,
    'video/x-matroska': FileType.VIDEO,
    'video/3gpp': FileType.VIDEO,

    // Audio
    'audio/mpeg': FileType.AUDIO,
    'audio/mp3': FileType.AUDIO,
    'audio/wav': FileType.AUDIO,
    'audio/ogg': FileType.AUDIO,
    'audio/webm': FileType.AUDIO,
    'audio/aac': FileType.AUDIO,
    'audio/flac': FileType.AUDIO,
    'audio/x-m4a': FileType.AUDIO,

    // Documents
    'application/pdf': FileType.DOCUMENT,
    'application/msword': FileType.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType.DOCUMENT,
    'application/vnd.ms-excel': FileType.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileType.DOCUMENT,
    'application/vnd.ms-powerpoint': FileType.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileType.DOCUMENT,
    'text/plain': FileType.DOCUMENT,
    'text/csv': FileType.DOCUMENT,
    'text/html': FileType.DOCUMENT,
    'text/xml': FileType.DOCUMENT,
    'application/json': FileType.DOCUMENT,
    'application/rtf': FileType.DOCUMENT,
};

/**
 * File extension to FileType category mapping (fallback)
 */
const EXTENSION_MAP: Record<string, FileType> = {
    // Images
    'jpg': FileType.IMAGE,
    'jpeg': FileType.IMAGE,
    'png': FileType.IMAGE,
    'gif': FileType.IMAGE,
    'webp': FileType.IMAGE,
    'svg': FileType.IMAGE,
    'bmp': FileType.IMAGE,
    'tiff': FileType.IMAGE,
    'ico': FileType.IMAGE,

    // Videos
    'mp4': FileType.VIDEO,
    'mpeg': FileType.VIDEO,
    'mpg': FileType.VIDEO,
    'mov': FileType.VIDEO,
    'avi': FileType.VIDEO,
    'flv': FileType.VIDEO,
    'webm': FileType.VIDEO,
    'mkv': FileType.VIDEO,
    '3gp': FileType.VIDEO,

    // Audio
    'mp3': FileType.AUDIO,
    'wav': FileType.AUDIO,
    'ogg': FileType.AUDIO,
    'aac': FileType.AUDIO,
    'flac': FileType.AUDIO,
    'm4a': FileType.AUDIO,

    // Documents
    'pdf': FileType.DOCUMENT,
    'doc': FileType.DOCUMENT,
    'docx': FileType.DOCUMENT,
    'xls': FileType.DOCUMENT,
    'xlsx': FileType.DOCUMENT,
    'ppt': FileType.DOCUMENT,
    'pptx': FileType.DOCUMENT,
    'txt': FileType.DOCUMENT,
    'csv': FileType.DOCUMENT,
    'html': FileType.DOCUMENT,
    'xml': FileType.DOCUMENT,
    'json': FileType.DOCUMENT,
    'rtf': FileType.DOCUMENT,
};

/**
 * FileClassifierService
 * 
 * Provides methods for classifying files by type, detecting MIME types,
 * and generating thumbnails for media files.
 */
export class FileClassifierService implements FileClassifier {
    /**
     * Classifies a file into one of the predefined FileType categories
     * based on its MIME type and file extension.
     * 
     * @param file - The File object to classify
     * @returns The classified FileType category
     * 
     * **Validates: Requirements 1.2**
     */
    classifyFile(file: File): FileType {
        // First, try to classify by MIME type
        const mimeType = this.getMimeType(file);
        if (mimeType && MIME_TYPE_MAP[mimeType]) {
            return MIME_TYPE_MAP[mimeType];
        }

        // Fallback to extension-based classification
        const extension = this.getFileExtension(file.name);
        if (extension && EXTENSION_MAP[extension]) {
            return EXTENSION_MAP[extension];
        }

        // If no match found, return unclassified
        return FileType.UNCLASSIFIED;
    }

    /**
     * Gets the MIME type of a file.
     * 
     * @param file - The File object
     * @returns The MIME type string
     */
    getMimeType(file: File): string {
        return file.type || '';
    }

    /**
     * Generates a thumbnail preview for image and video files.
     * Returns a data URL that can be used as an image source.
     * 
     * @param file - The File object to generate a thumbnail for
     * @returns Promise resolving to a data URL string, or null if thumbnail cannot be generated
     * 
     * **Validates: Requirements 9.4**
     */
    async generateThumbnail(file: File): Promise<string | null> {
        const fileType = this.classifyFile(file);

        if (fileType === FileType.IMAGE) {
            return this.generateImageThumbnail(file);
        } else if (fileType === FileType.VIDEO) {
            return this.generateVideoThumbnail(file);
        }

        // No thumbnail for other file types
        return null;
    }

    /**
     * Generates a thumbnail for an image file.
     * 
     * @param file - The image File object
     * @returns Promise resolving to a data URL string
     */
    private async generateImageThumbnail(file: File): Promise<string | null> {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        resolve(null);
                        return;
                    }

                    // Set thumbnail dimensions (max 200x200, maintain aspect ratio)
                    const maxSize = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw the image on canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to data URL
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };

                img.onerror = () => {
                    resolve(null);
                };

                img.src = e.target?.result as string;
            };

            reader.onerror = () => {
                resolve(null);
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Generates a thumbnail for a video file by capturing the first frame.
     * 
     * @param file - The video File object
     * @returns Promise resolving to a data URL string
     */
    private async generateVideoThumbnail(file: File): Promise<string | null> {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(null);
                return;
            }

            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;

            video.onloadedmetadata = () => {
                // Seek to 1 second or 10% of video duration, whichever is smaller
                const seekTime = Math.min(1, video.duration * 0.1);
                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                // Set thumbnail dimensions (max 200x200, maintain aspect ratio)
                const maxSize = 200;
                let width = video.videoWidth;
                let height = video.videoHeight;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw the video frame on canvas
                ctx.drawImage(video, 0, 0, width, height);

                // Convert to data URL
                resolve(canvas.toDataURL('image/jpeg', 0.8));

                // Clean up
                URL.revokeObjectURL(video.src);
            };

            video.onerror = () => {
                resolve(null);
                URL.revokeObjectURL(video.src);
            };

            // Create object URL and load video
            video.src = URL.createObjectURL(file);
        });
    }

    /**
     * Extracts the file extension from a filename.
     * 
     * @param fileName - The name of the file
     * @returns The lowercase file extension without the dot, or empty string if no extension
     */
    private getFileExtension(fileName: string): string {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
            return '';
        }
        return fileName.substring(lastDotIndex + 1).toLowerCase();
    }
}

/**
 * Singleton instance of FileClassifierService
 */
export const fileClassifierService = new FileClassifierService();
