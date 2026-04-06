'use client';

import React, { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';

/**
 * Example usage of the FileUploadZone component
 * This demonstrates how to integrate the component with file upload functionality
 */
export default function FileUploadZoneExample() {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFilesSelected = async (files: File[]) => {
        console.log('Files selected for upload:', files);
        setIsUploading(true);

        try {
            // Simulate upload process
            // In a real application, you would:
            // 1. Use the UploadQueueManager to add files to the queue
            // 2. Process uploads with the ChunkProcessorService
            // 3. Track progress with the ProgressTracker

            await new Promise(resolve => setTimeout(resolve, 2000));

            setUploadedFiles(files);
            alert(`Successfully uploaded ${files.length} file(s)!`);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    File Upload Example
                </h1>
                <p className="text-gray-600">
                    Drag and drop files or click to select files for upload
                </p>
            </div>

            {/* Basic Example */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Basic Upload</h2>
                <FileUploadZone
                    onFilesSelected={handleFilesSelected}
                    disabled={isUploading}
                />
            </div>

            {/* Example with Custom Limits */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Upload with Custom Limits (Max 10 files, 10MB each)
                </h2>
                <FileUploadZone
                    onFilesSelected={handleFilesSelected}
                    maxFiles={10}
                    maxFileSize={10 * 1024 * 1024}
                    disabled={isUploading}
                />
            </div>

            {/* Example with File Type Restrictions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Upload Images Only
                </h2>
                <FileUploadZone
                    onFilesSelected={handleFilesSelected}
                    accept={{
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                    }}
                    disabled={isUploading}
                />
            </div>

            {/* Example with Documents Only */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Upload Documents Only (PDF, Word, Excel)
                </h2>
                <FileUploadZone
                    onFilesSelected={handleFilesSelected}
                    accept={{
                        'application/pdf': ['.pdf'],
                        'application/msword': ['.doc'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'application/vnd.ms-excel': ['.xls'],
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    }}
                    disabled={isUploading}
                />
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-green-800 mb-4">
                        Recently Uploaded Files
                    </h2>
                    <ul className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <li key={index} className="text-green-700">
                                ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Loading State */}
            {isUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-700 font-medium">Uploading files...</p>
                </div>
            )}
        </div>
    );
}
