import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploadZone } from './FileUploadZone';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
    useDropzone: jest.fn((options) => {
        const mockGetRootProps = () => ({
            onClick: () => {
                // Simulate file selection
                if (options.onDrop) {
                    const mockFiles = [
                        new File(['content'], 'test.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(mockFiles, []);
                }
            },
        });

        const mockGetInputProps = () => ({
            type: 'file',
            multiple: options.multiple,
            accept: options.accept,
        });

        return {
            getRootProps: mockGetRootProps,
            getInputProps: mockGetInputProps,
            isDragActive: false,
        };
    }),
}));

describe('FileUploadZone Component', () => {
    const mockOnFilesSelected = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the upload zone with default text', () => {
        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        expect(screen.getByText(/Drag & drop files here, or click to select/i)).toBeInTheDocument();
        expect(screen.getByText(/Upload up to 600 files/i)).toBeInTheDocument();
    });

    it('should display custom maxFiles limit', () => {
        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} maxFiles={100} />);

        expect(screen.getByText(/Upload up to 100 files/i)).toBeInTheDocument();
    });

    it('should format file size correctly', () => {
        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} maxFileSize={50 * 1024 * 1024} />);

        expect(screen.getByText(/max 50 MB each/i)).toBeInTheDocument();
    });

    it('should show selected files count and total size', async () => {
        const { useDropzone } = require('react-dropzone');

        // Mock with actual file selection
        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    const mockFiles = [
                        new File(['a'.repeat(1024)], 'file1.txt', { type: 'text/plain' }),
                        new File(['b'.repeat(2048)], 'file2.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(mockFiles, []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText(/Selected Files: 2 \/ 600/i)).toBeInTheDocument();
        });
    });

    it('should allow removing individual files', async () => {
        const { useDropzone } = require('react-dropzone');

        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    const mockFiles = [
                        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
                        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(mockFiles, []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
            expect(screen.getByText('file2.txt')).toBeInTheDocument();
        });

        // Remove first file
        const removeButtons = screen.getAllByLabelText(/Remove/i);
        fireEvent.click(removeButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
            expect(screen.getByText('file2.txt')).toBeInTheDocument();
            expect(screen.getByText(/Selected Files: 1 \/ 600/i)).toBeInTheDocument();
        });
    });

    it('should clear all files when Clear All is clicked', async () => {
        const { useDropzone } = require('react-dropzone');

        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    const mockFiles = [
                        new File(['content'], 'file1.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(mockFiles, []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
        });

        const clearButton = screen.getByText('Clear All');
        fireEvent.click(clearButton);

        await waitFor(() => {
            expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
            expect(screen.queryByText(/Selected Files/i)).not.toBeInTheDocument();
        });
    });

    it('should call onFilesSelected when Upload button is clicked', async () => {
        const { useDropzone } = require('react-dropzone');

        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    options.onDrop([mockFile], []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
        });

        const uploadButton = screen.getByText(/Upload 1 File/i);
        fireEvent.click(uploadButton);

        expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
        expect(mockOnFilesSelected).toHaveBeenCalledWith([mockFile]);
    });

    it('should show error when trying to upload more than maxFiles', async () => {
        const { useDropzone } = require('react-dropzone');

        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    // First add 2 files
                    const firstBatch = [
                        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
                        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(firstBatch, []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} maxFiles={2} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
        });

        // Try to add more files
        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    const moreBatch = [
                        new File(['content3'], 'file3.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(moreBatch, []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText(/Cannot upload more than 2 files at once/i)).toBeInTheDocument();
        });
    });

    it('should disable upload when disabled prop is true', () => {
        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} disabled={true} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div')?.parentElement;
        expect(dropzone).toHaveClass('opacity-50');
        expect(dropzone).toHaveClass('cursor-not-allowed');
    });

    it('should show correct file count in upload button text', async () => {
        const { useDropzone } = require('react-dropzone');

        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    const mockFiles = [
                        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
                        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
                        new File(['content3'], 'file3.txt', { type: 'text/plain' }),
                    ];
                    options.onDrop(mockFiles, []);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText(/Upload 3 Files/i)).toBeInTheDocument();
        });
    });

    it('should handle rejected files and show error', async () => {
        const { useDropzone } = require('react-dropzone');

        useDropzone.mockImplementation((options: any) => ({
            getRootProps: () => ({
                onClick: () => {
                    const rejectedFiles = [
                        {
                            file: new File(['content'], 'large.txt', { type: 'text/plain' }),
                            errors: [{ message: 'File is too large' }],
                        },
                    ];
                    options.onDrop([], rejectedFiles);
                },
            }),
            getInputProps: () => ({}),
            isDragActive: false,
        }));

        render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);

        const dropzone = screen.getByText(/Drag & drop files here/i).closest('div');
        fireEvent.click(dropzone!);

        await waitFor(() => {
            expect(screen.getByText(/File is too large/i)).toBeInTheDocument();
        });
    });
});
