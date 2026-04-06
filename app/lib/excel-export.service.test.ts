/**
 * Property-Based Tests for Excel Export Service
 * 
 * **Feature: smart-file-manager, Property 7: Batch Export Completeness**
 * **Validates: Requirements 2.4, 12.1, 12.2**
 */

import fc from 'fast-check';
import ExcelJS from 'exceljs';
import { ExcelExportService } from './excel-export.service';
import { ExportFileData, FileType } from './file-upload.model';

// Polyfill Blob.arrayBuffer for jsdom
if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as ArrayBuffer);
            };
            reader.readAsArrayBuffer(this);
        });
    };
}

// Mock URL methods globally
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('Feature: smart-file-manager, Property 7: Batch Export Completeness', () => {
    let service: ExcelExportService;
    let mockCreateElement: jest.SpyInstance;
    let mockAppendChild: jest.SpyInstance;
    let mockRemoveChild: jest.SpyInstance;
    let mockClick: jest.Mock;

    beforeEach(() => {
        service = new ExcelExportService();

        // Reset URL mocks
        (global.URL.createObjectURL as jest.Mock).mockClear();
        (global.URL.revokeObjectURL as jest.Mock).mockClear();

        // Mock DOM methods for file download
        mockClick = jest.fn();
        mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue({
            click: mockClick,
            href: '',
            download: '',
        } as any);

        mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
        mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    });

    afterEach(() => {
        mockCreateElement.mockRestore();
        mockAppendChild.mockRestore();
        mockRemoveChild.mockRestore();
    });

    /**
     * **Property 7: Batch Export Completeness**
     * **Validates: Requirements 2.4, 12.1, 12.2**
     * 
     * For any set of completed file uploads, the "Export All Links" functionality 
     * should generate an Excel file containing all completed file URLs with their 
     * metadata (filename, file type, upload date, URL).
     */
    it('should export all files with complete metadata', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        fileName: fc.string({ minLength: 5, maxLength: 50 }).map(s => s.trim()).filter(s => s.length >= 5),
                        fileType: fc.constantFrom(...Object.values(FileType)),
                        fileUrl: fc.webUrl({ validSchemes: ['https'] }),
                        uploadDate: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
                        fileSize: fc.integer({ min: 100, max: 100000000 }),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
                async (files) => {
                    // Clear mocks before each run
                    (global.URL.createObjectURL as jest.Mock).mockClear();
                    mockClick.mockClear();

                    // Export files
                    await service.exportLinks(files);

                    // Verify download was triggered
                    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
                    expect(mockCreateElement).toHaveBeenCalledWith('a');
                    expect(mockClick).toHaveBeenCalledTimes(1);

                    // Get the blob that was created
                    const blobArg = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
                    expect(blobArg).toBeInstanceOf(Blob);
                    expect(blobArg.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

                    // Read the Excel file to verify contents
                    const workbook = new ExcelJS.Workbook();
                    const buffer = await blobArg.arrayBuffer();
                    await workbook.xlsx.load(buffer);

                    const worksheet = workbook.getWorksheet('File Links');
                    expect(worksheet).toBeDefined();

                    // Count data rows with actual content (excluding header and empty rows)
                    let dataRowCount = 0;
                    worksheet?.eachRow((row, rowNumber) => {
                        if (rowNumber > 1 && row.getCell(1).value) {
                            dataRowCount++;
                        }
                    });

                    // Verify all files are exported
                    expect(dataRowCount).toBe(files.length);

                    // Verify that each row with data has all required columns filled
                    worksheet?.eachRow((row, rowNumber) => {
                        if (rowNumber > 1 && row.getCell(1).value) { // Skip header and empty rows
                            // Check that all cells have values
                            expect(row.getCell(1).value).toBeTruthy(); // File Name
                            expect(row.getCell(2).value).toBeTruthy(); // File Type
                            expect(row.getCell(3).value).toBeTruthy(); // Upload Date
                            expect(row.getCell(4).value).toBeTruthy(); // File Size
                            expect(row.getCell(5).value).toBeTruthy(); // File URL
                        }
                    });
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should include all required columns in export', async () => {
        const testFile: ExportFileData = {
            fileName: 'test.pdf',
            fileType: FileType.DOCUMENT,
            fileUrl: 'https://example.com/test.pdf',
            uploadDate: new Date().toISOString(),
            fileSize: 1024000,
        };

        await service.exportLinks([testFile]);

        const blobArg = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await blobArg.arrayBuffer());

        const worksheet = workbook.getWorksheet('File Links');
        expect(worksheet).toBeDefined();

        // Verify column headers
        const headerRow = worksheet?.getRow(1);
        expect(headerRow?.getCell(1).value).toBe('File Name');
        expect(headerRow?.getCell(2).value).toBe('File Type');
        expect(headerRow?.getCell(3).value).toBe('Upload Date');
        expect(headerRow?.getCell(4).value).toBe('File Size');
        expect(headerRow?.getCell(5).value).toBe('File URL');
    });

    it('should format file sizes correctly', async () => {
        const testCases = [
            { size: 0, expected: '0 Bytes' },
            { size: 1024, expected: '1 KB' },
            { size: 1048576, expected: '1 MB' },
            { size: 1536000, expected: '1.46 MB' },
        ];

        for (const testCase of testCases) {
            const testFile: ExportFileData = {
                fileName: 'test.pdf',
                fileType: FileType.DOCUMENT,
                fileUrl: 'https://example.com/test.pdf',
                uploadDate: new Date().toISOString(),
                fileSize: testCase.size,
            };

            await service.exportLinks([testFile]);

            const callIndex = (global.URL.createObjectURL as jest.Mock).mock.calls.length - 1;
            const blobArg = (global.URL.createObjectURL as jest.Mock).mock.calls[callIndex][0];
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await blobArg.arrayBuffer());

            const worksheet = workbook.getWorksheet('File Links');
            const dataRow = worksheet?.getRow(2);
            const fileSizeCell = dataRow?.getCell(4);

            expect(fileSizeCell?.value).toBe(testCase.expected);
        }
    });

    it('should throw error when exporting empty file list', async () => {
        await expect(service.exportLinks([])).rejects.toThrow('No files to export');
    });

    it('should use custom filename when provided', async () => {
        const testFile: ExportFileData = {
            fileName: 'test.pdf',
            fileType: FileType.DOCUMENT,
            fileUrl: 'https://example.com/test.pdf',
            uploadDate: new Date().toISOString(),
            fileSize: 1024,
        };

        const customFilename = 'my-custom-export.xlsx';
        await service.exportLinks([testFile], customFilename);

        const linkElement = mockCreateElement.mock.results[0].value;
        expect(linkElement.download).toBe(customFilename);
    });

    it('should use default filename when not provided', async () => {
        const testFile: ExportFileData = {
            fileName: 'test.pdf',
            fileType: FileType.DOCUMENT,
            fileUrl: 'https://example.com/test.pdf',
            uploadDate: new Date().toISOString(),
            fileSize: 1024,
        };

        await service.exportLinks([testFile]);

        const linkElement = mockCreateElement.mock.results[0].value;
        expect(linkElement.download).toBe('file-links-export.xlsx');
    });

    it('should handle various file types correctly', async () => {
        const fileTypes = Object.values(FileType);

        for (const fileType of fileTypes) {
            const testFile: ExportFileData = {
                fileName: `test.${fileType}`,
                fileType,
                fileUrl: `https://example.com/test.${fileType}`,
                uploadDate: new Date().toISOString(),
                fileSize: 1024,
            };

            await service.exportLinks([testFile]);

            const callIndex = (global.URL.createObjectURL as jest.Mock).mock.calls.length - 1;
            const blobArg = (global.URL.createObjectURL as jest.Mock).mock.calls[callIndex][0];
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await blobArg.arrayBuffer());

            const worksheet = workbook.getWorksheet('File Links');
            const dataRow = worksheet?.getRow(2);
            const fileTypeCell = dataRow?.getCell(2);

            const expectedFileType = fileType.charAt(0).toUpperCase() + fileType.slice(1);
            expect(fileTypeCell?.value).toBe(expectedFileType);
        }
    });
});
