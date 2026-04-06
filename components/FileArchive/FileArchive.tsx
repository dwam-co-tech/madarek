'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileUpload, FileType, UploadStatus } from '../../app/lib/file-upload.model';
import { Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface FileArchiveProps {
    apiUrl?: string;
    onError?: (error: string) => void;
}

interface PaginationData {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
}

export const FileArchive: React.FC<FileArchiveProps> = ({
    apiUrl = '/api/files/archive',
    onError
}) => {
    const [files, setFiles] = useState<FileUpload[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchFiles(currentPage);
    }, [currentPage]);

    const fetchFiles = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${apiUrl}?page=${page}`);

            if (response.data.success) {
                setFiles(response.data.data.files);
                setPagination(response.data.data.pagination);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to load files';
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (fileId: string, url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(fileId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: UploadStatus): string => {
        switch (status) {
            case UploadStatus.COMPLETED: return 'text-green-600 bg-green-50';
            case UploadStatus.UPLOADING: return 'text-blue-600 bg-blue-50';
            case UploadStatus.FAILED: return 'text-red-600 bg-red-50';
            case UploadStatus.PENDING: return 'text-yellow-600 bg-yellow-50';
            case UploadStatus.CANCELLED: return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getFileTypeColor = (type: FileType): string => {
        switch (type) {
            case FileType.IMAGE: return 'text-purple-600 bg-purple-50';
            case FileType.VIDEO: return 'text-pink-600 bg-pink-50';
            case FileType.AUDIO: return 'text-indigo-600 bg-indigo-50';
            case FileType.DOCUMENT: return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading && files.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No files found in archive
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Filename
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Upload Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                URL
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {files.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {file.fileName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.fileType)}`}>
                                        {file.fileType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatFileSize(file.fileSize)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                                        {file.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(file.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {file.fileUrl ? (
                                        <button
                                            onClick={() => copyToClipboard(file.id, file.fileUrl!)}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            title="Copy URL"
                                        >
                                            {copiedId === file.id ? (
                                                <>
                                                    <Check size={14} />
                                                    <span>Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-700">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} files
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                            let pageNum;
                            if (pagination.last_page <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= pagination.last_page - 2) {
                                pageNum = pagination.last_page - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 border rounded ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                            disabled={currentPage === pagination.last_page}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
