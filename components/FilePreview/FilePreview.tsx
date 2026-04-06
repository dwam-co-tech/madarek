'use client';

import React from 'react';
import { X, FileIcon, Image, Video, Music, FileText } from 'lucide-react';
import { FileType } from '@/app/lib/file-upload.model';

interface FilePreviewProps {
    fileName: string;
    fileType: FileType;
    fileSize: number;
    thumbnail?: string | null;
    onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
    fileName,
    fileType,
    fileSize,
    thumbnail,
    onRemove,
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileTypeIcon = () => {
        switch (fileType) {
            case FileType.IMAGE:
                return <Image className="w-6 h-6 text-blue-500" />;
            case FileType.VIDEO:
                return <Video className="w-6 h-6 text-purple-500" />;
            case FileType.AUDIO:
                return <Music className="w-6 h-6 text-green-500" />;
            case FileType.DOCUMENT:
                return <FileText className="w-6 h-6 text-orange-500" />;
            default:
                return <FileIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const getFileTypeColor = () => {
        switch (fileType) {
            case FileType.IMAGE:
                return 'border-blue-200 bg-blue-50';
            case FileType.VIDEO:
                return 'border-purple-200 bg-purple-50';
            case FileType.AUDIO:
                return 'border-green-200 bg-green-50';
            case FileType.DOCUMENT:
                return 'border-orange-200 bg-orange-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className={`relative flex items-center gap-3 p-3 border rounded-lg ${getFileTypeColor()} transition-all hover:shadow-md`}>
            {/* Thumbnail or Icon */}
            <div className="flex-shrink-0">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={fileName}
                        className="w-16 h-16 object-cover rounded border border-gray-300"
                    />
                ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-white rounded border border-gray-300">
                        {getFileTypeIcon()}
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                    {fileName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600 capitalize">
                        {fileType}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                        {formatFileSize(fileSize)}
                    </span>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={onRemove}
                className="flex-shrink-0 p-1.5 hover:bg-red-100 rounded-full transition-colors group"
                aria-label={`Remove ${fileName}`}
            >
                <X className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
            </button>
        </div>
    );
};
