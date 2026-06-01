'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { ProgressTracker } from '@/components/ProgressTracker';
import FileArchiveWithSearch from '@/components/FileArchive/FileArchiveWithSearch';
import FileExplorer from '@/components/FileExplorer/FileExplorer';
import { FileProgress, UploadStatus, FileType } from '@/app/lib/file-upload.model';
import { Upload, Archive, FolderOpen } from 'lucide-react';
import axios from 'axios';
import styles from './files.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://madarek-backend.test/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
};

export default function FilesPage() {
    const [activeTab, setActiveTab] = useState<'upload' | 'archive' | 'explorer'>('upload');
    const [uploadingFiles, setUploadingFiles] = useState<FileProgress[]>([]);

    const classifyFile = (file: File): FileType => {
        const mimeType = file.type.toLowerCase();

        if (mimeType.startsWith('image/')) return FileType.IMAGE;
        if (mimeType.startsWith('video/')) return FileType.VIDEO;
        if (mimeType.startsWith('audio/')) return FileType.AUDIO;
        if (mimeType.includes('pdf') || mimeType.includes('document') ||
            mimeType.includes('text') || mimeType.includes('sheet')) {
            return FileType.DOCUMENT;
        }
        return FileType.UNCLASSIFIED;
    };

    const uploadFile = async (file: File) => {
        const fileId = `${file.name}-${Date.now()}`;
        const fileType = classifyFile(file);

        // Add file to progress tracker
        const fileProgress: FileProgress = {
            fileId,
            fileName: file.name,
            fileType,
            progress: 0,
            status: UploadStatus.PENDING,
            totalBytes: file.size,
            uploadedBytes: 0,
        };

        setUploadingFiles(prev => [...prev, fileProgress]);

        try {
            // Get auth token
            const token = getAuthToken();
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            // Step 1: Initiate upload
            const initiateResponse = await axios.post(`${API_BASE_URL}/files/upload/initiate`, {
                fileName: file.name,
                fileSize: file.size,
                fileType,
                mimeType: file.type,
                totalChunks: 1, // For simplicity, we're not chunking in this basic version
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!initiateResponse.data.success) {
                throw new Error(initiateResponse.data.error?.message || 'Failed to initiate upload');
            }

            const { fileId: serverFileId } = initiateResponse.data.data;

            // Update status to uploading
            setUploadingFiles(prev =>
                prev.map(f => f.fileId === fileId ? { ...f, status: UploadStatus.UPLOADING } : f)
            );

            // Step 2: Upload file as chunk
            const formData = new FormData();
            formData.append('fileId', serverFileId);
            formData.append('chunkIndex', '0');
            formData.append('totalChunks', '1');
            formData.append('chunk', file);

            const uploadResponse = await axios.post(`${API_BASE_URL}/files/upload/chunk`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadingFiles(prev =>
                            prev.map(f =>
                                f.fileId === fileId
                                    ? { ...f, progress, uploadedBytes: progressEvent.loaded, totalBytes: progressEvent.total }
                                    : f
                            )
                        );
                    }
                },
            });

            if (!uploadResponse.data.success) {
                throw new Error(uploadResponse.data.error?.message || 'Failed to upload chunk');
            }

            // Step 3: Finalize upload
            const finalizeResponse = await axios.post(`${API_BASE_URL}/files/upload/finalize`, {
                fileId: serverFileId,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!finalizeResponse.data.success) {
                throw new Error(finalizeResponse.data.error?.message || 'Failed to finalize upload');
            }

            const { url } = finalizeResponse.data.data;

            // Update status to completed
            setUploadingFiles(prev =>
                prev.map(f =>
                    f.fileId === fileId
                        ? { ...f, status: UploadStatus.COMPLETED, progress: 100, url }
                        : f
                )
            );

        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMessage = error.response?.data?.error?.message || error.message || 'Upload failed';

            setUploadingFiles(prev =>
                prev.map(f =>
                    f.fileId === fileId
                        ? { ...f, status: UploadStatus.FAILED, error: errorMessage }
                        : f
                )
            );
        }
    };

    const handleFilesSelected = async (files: File[]) => {
        console.log('Files selected:', files);

        // Upload files sequentially (you can make this parallel if needed)
        for (const file of files) {
            await uploadFile(file);
        }
    };

    const handleCopyLink = (fileId: string, url: string) => {
        console.log('Link copied:', fileId, url);
    };

    const handleExportAll = () => {
        console.log('Export all links');
        // TODO: Implement Excel export logic
        const completedFiles = uploadingFiles.filter(f => f.status === UploadStatus.COMPLETED);

        if (completedFiles.length === 0) {
            alert('No completed files to export');
            return;
        }

        // Create a simple text export for now
        const exportData = completedFiles.map(f => `${f.fileName}: ${f.url}`).join('\n');
        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'file-links.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>إدارة الملفات</h1>
                <p className={styles.subtitle}>رفع وإدارة ملفات المجلة</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'upload' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('upload')}
                >
                    <Upload className="w-5 h-5 inline-block ml-2" />
                    رفع الملفات
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'archive' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('archive')}
                >
                    <Archive className="w-5 h-5 inline-block ml-2" />
                    أرشيف الملفات
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'explorer' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('explorer')}
                >
                    <FolderOpen className="w-5 h-5 inline-block ml-2" />
                    مستكشف الملفات
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'upload' ? (
                    <div className={styles.uploadSection}>
                        <FileUploadZone onFilesSelected={handleFilesSelected} />
                        <ProgressTracker
                            files={uploadingFiles}
                            onCopyLink={handleCopyLink}
                            onExportAll={handleExportAll}
                        />
                    </div>
                ) : activeTab === 'archive' ? (
                    <div className={styles.archiveSection}>
                        <FileArchiveWithSearch />
                    </div>
                ) : (
                    <div className={styles.explorerSection}>
                        <FileExplorer />
                    </div>
                )}
            </div>
        </div>
    );
}
