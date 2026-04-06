/**
 * Smart File Manager - Excel Export Service
 * 
 * This service provides functionality to export file links and metadata to Excel format.
 * Uses ExcelJS library for generating Excel files.
 * 
 * Requirements: 12.1, 12.2, 12.3
 */

import ExcelJS from 'exceljs';
import { ExportFileData } from './file-upload.model';

/**
 * ExcelExportService
 * 
 * Provides methods for exporting file data to Excel format with metadata.
 */
export class ExcelExportService {
    /**
     * Exports file links and metadata to an Excel file and triggers download.
     * 
     * @param files - Array of file data to export
     * @param filename - Optional custom filename for the Excel file (default: 'file-links-export.xlsx')
     * 
     * **Validates: Requirements 12.1, 12.2, 12.3**
     */
    async exportLinks(files: ExportFileData[], filename: string = 'file-links-export.xlsx'): Promise<void> {
        if (files.length === 0) {
            throw new Error('No files to export');
        }

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('File Links');

        // Define columns
        worksheet.columns = [
            { header: 'File Name', key: 'fileName', width: 40 },
            { header: 'File Type', key: 'fileType', width: 15 },
            { header: 'Upload Date', key: 'uploadDate', width: 20 },
            { header: 'File Size', key: 'fileSize', width: 15 },
            { header: 'File URL', key: 'fileUrl', width: 60 },
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Add data rows
        files.forEach((file) => {
            worksheet.addRow({
                fileName: file.fileName,
                fileType: this.capitalizeFileType(file.fileType),
                uploadDate: this.formatDate(file.uploadDate),
                fileSize: this.formatFileSize(file.fileSize),
                fileUrl: file.fileUrl,
            });
        });

        // Apply styling to data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                // Alternate row colors
                if (rowNumber % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' },
                    };
                }

                // Make URLs clickable
                const urlCell = row.getCell('fileUrl');
                urlCell.value = {
                    text: urlCell.value as string,
                    hyperlink: urlCell.value as string,
                };
                urlCell.font = { color: { argb: 'FF0563C1' }, underline: true };
            }

            // Add borders to all cells
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        // Auto-fit columns (approximate)
        worksheet.columns.forEach((column) => {
            if (column.header) {
                column.width = Math.max(column.width || 10, column.header.length + 5);
            }
        });

        // Generate Excel file buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Trigger download
        this.downloadFile(buffer, filename);
    }

    /**
     * Formats a date string to a readable format.
     * 
     * @param dateString - ISO date string
     * @returns Formatted date string (e.g., "Jan 15, 2024 10:30 AM")
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    /**
     * Formats file size in bytes to human-readable format.
     * 
     * @param bytes - File size in bytes
     * @returns Formatted file size string (e.g., "1.5 MB")
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Capitalizes the first letter of a file type.
     * 
     * @param fileType - File type string
     * @returns Capitalized file type
     */
    private capitalizeFileType(fileType: string): string {
        return fileType.charAt(0).toUpperCase() + fileType.slice(1);
    }

    /**
     * Triggers a file download in the browser.
     * 
     * @param buffer - File buffer to download
     * @param filename - Name of the file to download
     */
    private downloadFile(buffer: ArrayBuffer, filename: string): void {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

/**
 * Singleton instance of ExcelExportService
 */
export const excelExportService = new ExcelExportService();
