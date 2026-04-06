/**
 * Property-Based Tests for ProgressTracker Component
 * 
 * **Feature: smart-file-manager**
 * Tests for Properties 4, 5, and 6
 */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { ProgressTracker } from './ProgressTracker';
import { FileProgress, UploadStatus, FileType } from '../../app/lib/file-upload.model';

// Clean up after each test
afterEach(() => {
    cleanup();
});

describe('Feature: smart-file-manager, Property 4: Progress Calculation Accuracy', () => {
    /**
     * **Property 4: Progress Calculation Accuracy**
     * **Validates: Requirements 1.5, 6.5**
     * 
     * For any file being uploaded, the Progress_Tracker should display a progress 
     * percentage that accurately reflects the ratio of uploaded bytes to total file size.
     */
    it('should display accurate progress percentage based on uploaded/total bytes ratio', () => {
        fc.assert(
            fc.property(
                fc.record({
                    fileId: fc.uuid(),
                    fileName: fc.string({ minLength: 2, maxLength: 50 }).map(s => s.trim()).filter(s => s.length > 1),
                    fileType: fc.constantFrom(...Object.values(FileType)),
                    uploadedBytes: fc.integer({ min: 0, max: 10000000 }),
                    totalBytes: fc.integer({ min: 1, max: 10000000 }),
                }),
                (fileData) => {
                    // Calculate expected progress
                    const expectedProgress = Math.round((fileData.uploadedBytes / fileData.totalBytes) * 100);

                    const file: FileProgress = {
                        fileId: fileData.fileId,
                        fileName: fileData.fileName,
                        fileType: fileData.fileType,
                        progress: expectedProgress,
                        status: UploadStatus.UPLOADING,
                        uploadedBytes: fileData.uploadedBytes,
                        totalBytes: fileData.totalBytes,
                    };

                    const { container, unmount } = render(<ProgressTracker files={[file]} />);

                    // Verify progress percentage is displayed
                    const progressText = screen.getByText(`${expectedProgress}% complete`);
                    expect(progressText).toBeInTheDocument();

                    // Verify progress bar width matches percentage
                    const progressBar = container.querySelector('.bg-blue-600');
                    expect(progressBar).toHaveStyle({ width: `${expectedProgress}%` });

                    unmount();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should handle edge cases for progress calculation', () => {
        const testCases = [
            { uploadedBytes: 0, totalBytes: 1000, expectedProgress: 0 },
            { uploadedBytes: 1000, totalBytes: 1000, expectedProgress: 100 },
            { uploadedBytes: 500, totalBytes: 1000, expectedProgress: 50 },
            { uploadedBytes: 333, totalBytes: 1000, expectedProgress: 33 },
            { uploadedBytes: 1, totalBytes: 3, expectedProgress: 33 },
        ];

        testCases.forEach(({ uploadedBytes, totalBytes, expectedProgress }, index) => {
            const file: FileProgress = {
                fileId: `test-id-${index}`,
                fileName: `test-${index}.txt`,
                fileType: FileType.DOCUMENT,
                progress: expectedProgress,
                status: UploadStatus.UPLOADING,
                uploadedBytes,
                totalBytes,
            };

            const { container, unmount } = render(<ProgressTracker files={[file]} />);

            const progressText = screen.getByText(`${expectedProgress}% complete`);
            expect(progressText).toBeInTheDocument();

            const progressBar = container.querySelector('.bg-blue-600');
            expect(progressBar).toHaveStyle({ width: `${expectedProgress}%` });

            unmount();
        });
    });
});

describe('Feature: smart-file-manager, Property 5: Complete File Status Display', () => {
    /**
     * **Property 5: Complete File Status Display**
     * **Validates: Requirements 2.1, 2.2, 2.5**
     * 
     * For any file in the system, the Progress_Tracker should display its current status 
     * (pending, uploading, completed, failed, cancelled) along with an accurate progress bar if uploading.
     */
    it('should display correct status for any file state', () => {
        fc.assert(
            fc.property(
                fc.record({
                    fileId: fc.uuid(),
                    fileName: fc.string({ minLength: 2, maxLength: 50 }).map(s => s.trim()).filter(s => s.length > 1),
                    fileType: fc.constantFrom(...Object.values(FileType)),
                    status: fc.constantFrom(...Object.values(UploadStatus)),
                    progress: fc.integer({ min: 0, max: 100 }),
                }),
                (fileData) => {
                    const file: FileProgress = {
                        fileId: fileData.fileId,
                        fileName: fileData.fileName,
                        fileType: fileData.fileType,
                        progress: fileData.progress,
                        status: fileData.status,
                    };

                    const { unmount } = render(<ProgressTracker files={[file]} />);

                    // Verify file name is displayed
                    expect(screen.getByText(fileData.fileName)).toBeInTheDocument();

                    // Verify status is displayed
                    const statusMap: Record<UploadStatus, string> = {
                        [UploadStatus.PENDING]: 'Pending',
                        [UploadStatus.UPLOADING]: 'Uploading',
                        [UploadStatus.COMPLETED]: 'Completed',
                        [UploadStatus.FAILED]: 'Failed',
                        [UploadStatus.CANCELLED]: 'Cancelled',
                    };

                    const expectedStatusText = statusMap[fileData.status];
                    expect(screen.getByText(expectedStatusText)).toBeInTheDocument();

                    // Verify file type is displayed
                    expect(screen.getByText(fileData.fileType)).toBeInTheDocument();

                    unmount();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should show progress bar only for uploading files', () => {
        const statuses = Object.values(UploadStatus);

        statuses.forEach((status, index) => {
            const file: FileProgress = {
                fileId: `test-id-${index}`,
                fileName: `test-${index}.txt`,
                fileType: FileType.DOCUMENT,
                progress: 50,
                status,
            };

            const { container, unmount } = render(<ProgressTracker files={[file]} />);

            const progressBar = container.querySelector('.bg-blue-600');

            if (status === UploadStatus.UPLOADING) {
                // Progress bar should be present for uploading files
                expect(progressBar).toBeInTheDocument();
            } else {
                // Progress bar should not be present for other statuses
                expect(progressBar).not.toBeInTheDocument();
            }

            unmount();
        });
    });

    it('should display error message for failed files', () => {
        const file: FileProgress = {
            fileId: 'test-id',
            fileName: 'test.txt',
            fileType: FileType.DOCUMENT,
            progress: 0,
            status: UploadStatus.FAILED,
            error: 'Upload failed due to network error',
        };

        render(<ProgressTracker files={[file]} />);

        expect(screen.getByText('Upload failed due to network error')).toBeInTheDocument();
    });
});

describe('Feature: smart-file-manager, Property 6: Copy Link Availability', () => {
    /**
     * **Property 6: Copy Link Availability**
     * **Validates: Requirements 2.3**
     * 
     * For any file that has completed uploading successfully, the Progress_Tracker 
     * should enable a "Copy Link" button that allows copying the file URL.
     */
    it('should enable copy link button only for completed files with URLs', () => {
        fc.assert(
            fc.property(
                fc.record({
                    fileId: fc.uuid(),
                    fileName: fc.string({ minLength: 2, maxLength: 50 }).map(s => s.trim()).filter(s => s.length > 1),
                    fileType: fc.constantFrom(...Object.values(FileType)),
                    status: fc.constantFrom(...Object.values(UploadStatus)),
                    url: fc.webUrl(),
                }),
                (fileData) => {
                    const file: FileProgress = {
                        fileId: fileData.fileId,
                        fileName: fileData.fileName,
                        fileType: fileData.fileType,
                        progress: 100,
                        status: fileData.status,
                        url: fileData.status === UploadStatus.COMPLETED ? fileData.url : undefined,
                    };

                    const { unmount } = render(<ProgressTracker files={[file]} />);

                    const copyButton = screen.queryByRole('button', { name: /copy link/i });

                    if (fileData.status === UploadStatus.COMPLETED) {
                        // Copy button should be present for completed files
                        expect(copyButton).toBeInTheDocument();
                    } else {
                        // Copy button should not be present for other statuses
                        expect(copyButton).not.toBeInTheDocument();
                    }

                    unmount();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should call onCopyLink callback when copy button is clicked', async () => {
        const mockOnCopyLink = jest.fn();
        const testUrl = 'https://example.com/file.txt';

        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined),
            },
        });

        const file: FileProgress = {
            fileId: 'test-id',
            fileName: 'test.txt',
            fileType: FileType.DOCUMENT,
            progress: 100,
            status: UploadStatus.COMPLETED,
            url: testUrl,
        };

        render(<ProgressTracker files={[file]} onCopyLink={mockOnCopyLink} />);

        const copyButton = screen.getByRole('button', { name: /copy link/i });
        fireEvent.click(copyButton);

        // Wait for async clipboard operation
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testUrl);
        expect(mockOnCopyLink).toHaveBeenCalledWith('test-id', testUrl);
    });

    it('should show "Copied!" feedback after copying', async () => {
        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined),
            },
        });

        const file: FileProgress = {
            fileId: 'test-id',
            fileName: 'test.txt',
            fileType: FileType.DOCUMENT,
            progress: 100,
            status: UploadStatus.COMPLETED,
            url: 'https://example.com/file.txt',
        };

        render(<ProgressTracker files={[file]} />);

        const copyButton = screen.getByRole('button', { name: /copy link/i });
        fireEvent.click(copyButton);

        // Wait for async clipboard operation
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('should not show copy button for completed files without URL', () => {
        const file: FileProgress = {
            fileId: 'test-id',
            fileName: 'test.txt',
            fileType: FileType.DOCUMENT,
            progress: 100,
            status: UploadStatus.COMPLETED,
            // No URL provided
        };

        render(<ProgressTracker files={[file]} />);

        const copyButton = screen.queryByRole('button', { name: /copy link/i });
        expect(copyButton).not.toBeInTheDocument();
    });
});
