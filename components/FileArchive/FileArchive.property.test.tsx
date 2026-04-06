/**
 * Feature: smart-file-manager, Property 9: Complete Archive Information Display
 * 
 * Property: For any archived file, the Archive_System should display all required 
 * information: filename, file type, file URL with copy button, upload date/time, 
 * file size, and current status.
 * 
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { FileArchive } from './FileArchive';
import axios from 'axios';
import { FileType, UploadStatus } from '../../app/lib/file-upload.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Feature: smart-file-manager, Property 9: Complete Archive Information Display', () => {
  it('should display all required file information for any archived file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          fileName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fileType: fc.constantFrom(
            FileType.IMAGE,
            FileType.VIDEO,
            FileType.AUDIO,
            FileType.DOCUMENT,
            FileType.UNCLASSIFIED
          ),
          fileSize: fc.integer({ min: 1, max: 100000000 }),
          fileUrl: fc.webUrl(),
          status: fc.constantFrom(
            UploadStatus.COMPLETED,
            UploadStatus.UPLOADING,
            UploadStatus.FAILED,
            UploadStatus.PENDING,
            UploadStatus.CANCELLED
          ),
          createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString())
        }),
        async (fileData) => {
          const mockFile = {
            ...fileData,
            originalName: fileData.fileName,
            mimeType: 'application/octet-stream',
            totalChunks: 1,
            uploadedChunks: 1,
            updatedAt: fileData.createdAt
          };

          const mockPagination = {
            current_page: 1,
            per_page: 50,
            total: 1,
            last_page: 1,
            from: 1,
            to: 1
          };

          mockedAxios.get.mockResolvedValue({
            data: {
              success: true,
              data: {
                files: [mockFile],
                pagination: mockPagination
              }
            }
          });

          render(<FileArchive />);

          await waitFor(() => {
            expect(screen.getByText(fileData.fileName)).toBeInTheDocument();
          }, { timeout: 2000 });

          // Requirement 3.2: Display filename
          expect(screen.getByText(fileData.fileName)).toBeInTheDocument();

          // Requirement 3.3: Display file type
          expect(screen.getByText(fileData.fileType)).toBeInTheDocument();

          // Requirement 3.4: Display file URL with copy button
          if (fileData.fileUrl) {
            const copyButton = screen.getByTitle('Copy URL');
            expect(copyButton).toBeInTheDocument();
          }

          // Requirement 3.5: Display upload date/time (check for month names)
          const monthPattern = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/;
          expect(screen.getByText(monthPattern)).toBeInTheDocument();

          // Requirement 3.6: Display file size
          const sizePattern = /\d+(\.\d+)?\s*(Bytes|KB|MB|GB)/;
          expect(screen.getByText(sizePattern)).toBeInTheDocument();

          // Requirement 3.7: Display current status
          expect(screen.getByText(fileData.status)).toBeInTheDocument();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('should format file sizes correctly for any size', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 1000000000 }),
        async (fileSize) => {
          const mockFile = {
            id: '1',
            fileName: 'test.pdf',
            originalName: 'test.pdf',
            fileType: FileType.DOCUMENT,
            mimeType: 'application/pdf',
            fileSize: fileSize,
            fileUrl: 'https://example.com/test.pdf',
            status: UploadStatus.COMPLETED,
            totalChunks: 1,
            uploadedChunks: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          mockedAxios.get.mockResolvedValue({
            data: {
              success: true,
              data: {
                files: [mockFile],
                pagination: {
                  current_page: 1,
                  per_page: 50,
                  total: 1,
                  last_page: 1,
                  from: 1,
                  to: 1
                }
              }
            }
          });

          render(<FileArchive />);

          await waitFor(() => {
            expect(screen.getByText('test.pdf')).toBeInTheDocument();
          }, { timeout: 2000 });

          // Verify size is formatted with appropriate unit
          const sizePattern = /\d+(\.\d+)?\s*(Bytes|KB|MB|GB)/;
          expect(screen.getByText(sizePattern)).toBeInTheDocument();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('should display appropriate status colors for any status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          UploadStatus.COMPLETED,
          UploadStatus.UPLOADING,
          UploadStatus.FAILED,
          UploadStatus.PENDING,
          UploadStatus.CANCELLED
        ),
        async (status) => {
          const mockFile = {
            id: '1',
            fileName: 'test.pdf',
            originalName: 'test.pdf',
            fileType: FileType.DOCUMENT,
            mimeType: 'application/pdf',
            fileSize: 1024,
            fileUrl: 'https://example.com/test.pdf',
            status: status,
            totalChunks: 1,
            uploadedChunks: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          mockedAxios.get.mockResolvedValue({
            data: {
              success: true,
              data: {
                files: [mockFile],
                pagination: {
                  current_page: 1,
                  per_page: 50,
                  total: 1,
                  last_page: 1,
                  from: 1,
                  to: 1
                }
              }
            }
          });

          render(<FileArchive />);

          await waitFor(() => {
                        }
                    });

                    render(<FileArchive />);

                    await waitFor(() => {
                        expect(screen.queryByRole('generic', { hidden: false })).not.toHaveClass('animate-spin');
                    });

                    const statusElement = screen.getByText(status);
                    expect(statusElement).toBeInTheDocument();
                    expect(statusElement).toHaveClass('rounded-full');
                }
            ),
            { numRuns: 15 }
        );
    });
});
