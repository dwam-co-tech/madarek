'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Copy, Download, ExternalLink } from 'lucide-react';
import { FileProgress, UploadStatus } from '../../app/lib/file-upload.model';

interface ProgressTrackerProps {
    files: FileProgress[];
    onCopyLink?: (fileId: string, url: string) => void;
    onExportAll?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
    files,
    onCopyLink,
    onExportAll,
}) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const getStatusIcon = (status: UploadStatus) => {
        switch (status) {
            case UploadStatus.UPLOADING:
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case UploadStatus.COMPLETED:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case UploadStatus.FAILED:
                return <XCircle className="w-5 h-5 text-red-500" />;
            case UploadStatus.CANCELLED:
                return <XCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <Loader2 className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: UploadStatus) => {
        switch (status) {
            case UploadStatus.PENDING:
                return 'Pending';
            case UploadStatus.UPLOADING:
                return 'Uploading';
            case UploadStatus.COMPLETED:
                return 'Completed';
            case UploadStatus.FAILED:
                return 'Failed';
            case UploadStatus.CANCELLED:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status: UploadStatus) => {
        switch (status) {
            case UploadStatus.UPLOADING:
                return 'text-blue-600';
            case UploadStatus.COMPLETED:
                return 'text-green-600';
            case UploadStatus.FAILED:
                return 'text-red-600';
            case UploadStatus.CANCELLED:
                return 'text-gray-600';
            default:
                return 'text-gray-500';
        }
    };

    const handleCopyLink = async (fileId: string, url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(fileId);
            setTimeout(() => setCopiedId(null), 2000);
            onCopyLink?.(fileId, url);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const completedFiles = files.filter(f => f.status === UploadStatus.COMPLETED);
    const hasCompletedFiles = completedFiles.length > 0;

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Upload Progress ({files.length} {files.length === 1 ? 'file' : 'files'})
                </h3>
                {hasCompletedFiles && onExportAll && (
                    <button
                        onClick={onExportAll}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export All Links
                    </button>
                )}
            </div>

            {/* File List */}
            <div className="space-y-3">
                {files.map((file) => (
                    <div
                        key={file.fileId}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                        {/* File Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                {getStatusIcon(file.status)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={file.fileName}>
                                        {file.fileName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-medium ${getStatusColor(file.status)}`}>
                                            {getStatusText(file.status)}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-600 capitalize">
                                            {file.fileType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Copy Link Button */}
                            {file.status === UploadStatus.COMPLETED && file.url && (
                                <button
                                    onClick={() => handleCopyLink(file.fileId, file.url!)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex-shrink-0 ml-2"
                                >
                                    {copiedId === file.fileId ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {file.status === UploadStatus.UPLOADING && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">
                                        {file.progress}% complete
                                    </span>
                                    {file.uploadedBytes !== undefined && file.totalBytes !== undefined && (
                                        <span className="text-xs text-gray-500">
                                            {formatBytes(file.uploadedBytes)} / {formatBytes(file.totalBytes)}
                                        </span>
                                    )}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${file.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {file.status === UploadStatus.FAILED && file.error && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-xs text-red-600">{file.error}</p>
                            </div>
                        )}

                        {/* File URL */}
                        {file.status === UploadStatus.COMPLETED && file.url && (
                            <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-700 truncate"
                                    title={file.url}
                                >
                                    {file.url}
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Helper function to format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
