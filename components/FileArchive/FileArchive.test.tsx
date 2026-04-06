import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileArchive } from './FileArchive';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FileArchive Component', () => {
    const mockFiles = [
        {
            id: '1',
            fileName: 'test.pdf',
            originalName: 'test.pdf',
            fileType: 'document',
            mimeType: 'application/pdf',
            fileSize: 1024000,
            fileUrl: 'https://example.com/test.pdf',
            status: 'completed',
            totalChunks: 1,
            uploadedChunks: 1,
            createdAt: '2024-01-01T12:00:00Z',
            updatedAt: '2024-01-01T12:00:00Z'
        }
    ];

    const mockPagination = {
        current_page: 1,
        per_page: 50,
        total: 1,
        last_page: 1,
        from: 1,
        to: 1
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display loading state initially', () => {
        mockedAxios.get.mockImplementation(() => new Promise(() => { }));
        const { container } = render(<FileArchive />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('should display files after loading', async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                success: true,
                data: {
                    files: mockFiles,
                    pagination: mockPagination
                }
            }
        });

        render(<FileArchive />);

        await waitFor(() => {
            expect(screen.getByText('test.pdf')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        mockedAxios.get.mockRejectedValue({
            response: {
                data: {
                    error: {
                        message: 'Failed to load files'
                    }
                }
            }
        });

        render(<FileArchive />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load files')).toBeInTheDocument();
        });
    });

    it('should display empty state when no files', async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                success: true,
                data: {
                    files: [],
                    pagination: { ...mockPagination, total: 0 }
                }
            }
        });

        render(<FileArchive />);

        await waitFor(() => {
            expect(screen.getByText('No files found in archive')).toBeInTheDocument();
        });
    });

    it('should copy URL to clipboard when copy button clicked', async () => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined)
            }
        });

        mockedAxios.get.mockResolvedValue({
            data: {
                success: true,
                data: {
                    files: mockFiles,
                    pagination: mockPagination
                }
            }
        });

        render(<FileArchive />);

        await waitFor(() => {
            expect(screen.getByText('test.pdf')).toBeInTheDocument();
        });

        const copyButton = screen.getByTitle('Copy URL');
        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/test.pdf');
            expect(screen.getByText('Copied')).toBeInTheDocument();
        });
    });

    it('should handle pagination', async () => {
        const multiPagePagination = {
            current_page: 1,
            per_page: 50,
            total: 100,
            last_page: 2,
            from: 1,
            to: 50
        };

        mockedAxios.get.mockResolvedValue({
            data: {
                success: true,
                data: {
                    files: mockFiles,
                    pagination: multiPagePagination
                }
            }
        });

        render(<FileArchive />);

        await waitFor(() => {
            expect(screen.getByText('Showing 1 to 50 of 100 files')).toBeInTheDocument();
        });

        // Click on page 2 button
        const page2Button = screen.getByText('2');
        fireEvent.click(page2Button);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/files/archive?page=2');
        });
    });
});
