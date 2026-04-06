'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, X } from 'lucide-react';

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxFileSize?: number;
    accept?: Record<string, string[]>;
    disabled?: boolean;
}

interface SelectedFileInfo {
    file: File;
    id: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    onFilesSelected,
    maxFiles = 600,
    maxFileSize = 100 * 1024 * 1024, // 100MB default
    accept,
    disabled = false,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<SelectedFileInfo[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            // Check if adding these files would exceed the max limit
            const totalFiles = selectedFiles.length + acceptedFiles.length;
            if (totalFiles > maxFiles) {
                setError(`Cannot upload more than ${maxFiles} files at once`);
                return;
            }

            // Handle rejected files
            if (rejectedFiles.length > 0) {
                const errors = rejectedFiles.map((rejected) => {
                    const errorMessages = rejected.errors.map((e: any) => e.message).join(', ');
                    return `${rejected.file.name}: ${errorMessages}`;
                });
                setError(errors.join('; '));
            }

            // Add accepted files to the list
            if (acceptedFiles.length > 0) {
                const newFiles = acceptedFiles.map((file) => ({
                    file,
                    id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
                }));
                setSelectedFiles((prev) => [...prev, ...newFiles]);
            }
        },
        [selectedFiles, maxFiles]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize: maxFileSize,
        accept,
        disabled,
        multiple: true,
    });

    const removeFile = (id: string) => {
        setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
        setError(null);
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file');
            return;
        }
        onFilesSelected(selectedFiles.map((f) => f.file));
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setError(null);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getTotalSize = (): number => {
        return selectedFiles.reduce((total, { file }) => total + file.size, 0);
    };

    return (
        <div className="w-full space-y-4">
            {/* Dropzone Area */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isDragActive
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-3">
                    <Upload
                        className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'
                            }`}
                    />
                    {isDragActive ? (
                        <p className="text-lg font-medium text-blue-600">
                            Drop files here...
                        </p>
                    ) : (
                        <>
                            <p className="text-lg font-medium text-gray-700">
                                Drag & drop files here, or click to select
                            </p>
                            <p className="text-sm text-gray-500">
                                Upload up to {maxFiles} files (max {formatFileSize(maxFileSize)} each)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Selected Files Summary */}
            {selectedFiles.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Selected Files: {selectedFiles.length} / {maxFiles}
                            </p>
                            <p className="text-xs text-gray-500">
                                Total Size: {formatFileSize(getTotalSize())}
                            </p>
                        </div>
                        <button
                            onClick={clearAll}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* File List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedFiles.map(({ file, id }) => (
                            <div
                                key={id}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded p-2"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(id)}
                                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={disabled}
                        className={`
                            mt-4 w-full py-2 px-4 rounded-lg font-medium
                            transition-colors duration-200
                            ${disabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }
                        `}
                    >
                        Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                    </button>
                </div>
            )}
        </div>
    );
};
