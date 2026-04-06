'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Folder,
    File as FileIcon,
    Image,
    Video,
    Music,
    FileText,
    Home,
    ChevronRight,
    RefreshCw,
    FolderPlus,
    Download,
    Copy,
    Edit2,
    Trash2,
    MoreVertical,
    Grid,
    List,
    ArrowLeft,
    Upload,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back.mdarek.net/api';

interface FileItem {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    mime_type?: string;
    url?: string;
    modified_at?: number;
}

interface BrowseData {
    current_path: string;
    parent_path: string | null;
    directories: FileItem[];
    files: FileItem[];
    total_items: number;
}

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
};

export default function FileExplorer() {
    const [currentPath, setCurrentPath] = useState('');
    const [directories, setDirectories] = useState<FileItem[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem } | null>(null);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [copiedLink, setCopiedLink] = useState(false);
    const [emptySpaceMenu, setEmptySpaceMenu] = useState<{ x: number; y: number } | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        browse(currentPath);
    }, [currentPath]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Close context menus when clicking outside
            const target = e.target as HTMLElement;
            const isContextMenu = target.closest('[data-context-menu]');

            if (!isContextMenu) {
                setContextMenu(null);
                setEmptySpaceMenu(null);
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const browse = async (path: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication required');

            const response = await axios.get(`${API_BASE_URL}/files/explorer/browse`, {
                params: { path },
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.data.success) {
                const data: BrowseData = response.data.data;
                setDirectories(data.directories);
                setFiles(data.files);
            } else {
                throw new Error(response.data.error?.message || 'Failed to browse');
            }
        } catch (err: any) {
            console.error('Browse error:', err);
            setError(err.response?.data?.error?.message || err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
    };

    const handleBack = () => {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    const handleRename = async () => {
        if (!selectedItem || !newName.trim()) return;

        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/files/explorer/rename`,
                { path: selectedItem.path, new_name: newName },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setShowRenameModal(false);
                setNewName('');
                browse(currentPath);
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'فشل في إعادة التسمية');
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;

        try {
            const token = getAuthToken();
            const response = await axios.delete(`${API_BASE_URL}/files/explorer/delete`, {
                data: { path: selectedItem.path },
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.data.success) {
                setShowDeleteModal(false);
                browse(currentPath);
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'فشل في الحذف');
        }
    };

    const handleCreateFolder = async () => {
        if (!newName.trim()) return;

        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/files/explorer/create-folder`,
                { path: currentPath, name: newName },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setShowCreateFolderModal(false);
                setNewName('');
                browse(currentPath);
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'فشل في إنشاء المجلد');
        }
    };

    const handleCopyLink = (item: FileItem) => {
        // Generate URL from path if not available
        const fileUrl = item.url || `${API_BASE_URL.replace('/api', '')}/storage/${item.path}`;
        navigator.clipboard.writeText(fileUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleDownload = async (item: FileItem) => {
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication required');

            const response = await axios.get(`${API_BASE_URL}/files/explorer/download`, {
                params: { path: item.path },
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob', // Important for file download
            });

            // Create a blob URL and trigger download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = item.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Download error:', err);
            alert(err.response?.data?.error?.message || err.message || 'فشل في تحميل الملف');
        }
    };

    const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setEmptySpaceMenu({ x: e.clientX, y: e.clientY });
        setContextMenu(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setShowUploadModal(true);
        }
    };

    const handleUploadFile = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication required');

            // Determine file type
            const mimeType = selectedFile.type.toLowerCase();
            let fileType = 'unclassified';
            if (mimeType.startsWith('image/')) fileType = 'image';
            else if (mimeType.startsWith('video/')) fileType = 'video';
            else if (mimeType.startsWith('audio/')) fileType = 'audio';
            else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('sheet')) {
                fileType = 'document';
            }

            // Step 1: Initiate upload
            const initiateResponse = await axios.post(`${API_BASE_URL}/files/upload/initiate`, {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType,
                mimeType: selectedFile.type,
                totalChunks: 1,
                targetPath: currentPath, // Upload to current directory
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!initiateResponse.data.success) {
                throw new Error(initiateResponse.data.error?.message || 'Failed to initiate upload');
            }

            const { fileId } = initiateResponse.data.data;

            // Step 2: Upload file as chunk
            const formData = new FormData();
            formData.append('fileId', fileId);
            formData.append('chunkIndex', '0');
            formData.append('totalChunks', '1');
            formData.append('chunk', selectedFile);

            const uploadResponse = await axios.post(`${API_BASE_URL}/files/upload/chunk`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!uploadResponse.data.success) {
                throw new Error(uploadResponse.data.error?.message || 'Failed to upload chunk');
            }

            // Step 3: Finalize upload
            const finalizeResponse = await axios.post(`${API_BASE_URL}/files/upload/finalize`, {
                fileId,
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!finalizeResponse.data.success) {
                throw new Error(finalizeResponse.data.error?.message || 'Failed to finalize upload');
            }

            // Success - refresh the current directory
            setShowUploadModal(false);
            setSelectedFile(null);
            browse(currentPath);

            alert('تم رفع الملف بنجاح! ✓');
        } catch (err: any) {
            console.error('Upload error:', err);
            alert(err.response?.data?.error?.message || err.message || 'فشل في رفع الملف');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (item: FileItem) => {
        if (item.type === 'directory') {
            return (
                <div className="relative">
                    <Folder className="w-12 h-12 text-[#c6a270] drop-shadow-md" fill="#e6ccab" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#806141]/20 to-transparent rounded-lg"></div>
                </div>
            );
        }

        const mime = item.mime_type || '';
        if (mime.startsWith('image/')) {
            return (
                <div className="relative">
                    <Image className="w-12 h-12 text-[#4b8bff] drop-shadow-md" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4b8bff] rounded-full border-2 border-white"></div>
                </div>
            );
        }
        if (mime.startsWith('video/')) {
            return (
                <div className="relative">
                    <Video className="w-12 h-12 text-[#9333ea] drop-shadow-md" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9333ea] rounded-full border-2 border-white"></div>
                </div>
            );
        }
        if (mime.startsWith('audio/')) {
            return (
                <div className="relative">
                    <Music className="w-12 h-12 text-[#10b981] drop-shadow-md" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full border-2 border-white"></div>
                </div>
            );
        }
        if (mime.includes('pdf') || mime.includes('document')) {
            return (
                <div className="relative">
                    <FileText className="w-12 h-12 text-[#ef4444] drop-shadow-md" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ef4444] rounded-full border-2 border-white"></div>
                </div>
            );
        }
        return (
            <div className="relative">
                <FileIcon className="w-12 h-12 text-[#6b7280] drop-shadow-md" />
            </div>
        );
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '-';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSort = (column: 'name' | 'date' | 'size' | 'type') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortedItems = () => {
        const allItems = [...directories, ...files];

        return allItems.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name, 'ar');
                    break;
                case 'date':
                    comparison = (a.modified_at || 0) - (b.modified_at || 0);
                    break;
                case 'size':
                    comparison = (a.size || 0) - (b.size || 0);
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

    return (
        <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#f0e6d2] to-[#e6ccab] rounded-2xl shadow-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-[#d7b98d]/30">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPath('')}
                        className="p-2.5 hover:bg-[#806141]/10 rounded-xl transition-all duration-200 hover:scale-105 group"
                        title="الصفحة الرئيسية"
                    >
                        <Home className="w-5 h-5 text-[#5a3a2f] group-hover:text-[#806141]" />
                    </button>
                    <div className="w-px h-6 bg-[#d7b98d]/50"></div>
                    <button
                        onClick={handleBack}
                        disabled={!currentPath}
                        className="p-2.5 hover:bg-[#806141]/10 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                        title="رجوع"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#5a3a2f] group-hover:text-[#806141]" />
                    </button>
                    <button
                        onClick={() => browse(currentPath)}
                        className="p-2.5 hover:bg-[#806141]/10 rounded-xl transition-all duration-200 hover:scale-105 hover:rotate-180 group"
                        title="تحديث"
                    >
                        <RefreshCw className="w-5 h-5 text-[#5a3a2f] group-hover:text-[#806141] transition-transform duration-200" />
                    </button>
                    <div className="w-px h-6 bg-[#d7b98d]/50"></div>
                    <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#806141] to-[#6b4f3a] text-white rounded-xl hover:from-[#6b4f3a] hover:to-[#5a3a2f] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                    >
                        <FolderPlus className="w-4 h-4" />
                        <span>مجلد جديد</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-[#f0e6d2]/50 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                            ? 'bg-white text-[#806141] shadow-md scale-105'
                            : 'text-[#5a3a2f] hover:bg-white/50'
                            }`}
                        title="عرض شبكي"
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list'
                            ? 'bg-white text-[#806141] shadow-md scale-105'
                            : 'text-[#5a3a2f] hover:bg-white/50'
                            }`}
                        title="عرض قائمة"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/60 backdrop-blur-sm border-b border-[#d7b98d]/30 overflow-x-auto">
                <button
                    onClick={() => setCurrentPath('')}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#806141]/10 rounded-lg transition-all duration-200 whitespace-nowrap group"
                >
                    <Home className="w-4 h-4 text-[#806141] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-[#5a3a2f]">التخزين الرئيسي</span>
                </button>
                {breadcrumbs.map((part, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight className="w-4 h-4 text-[#9a7b50]" />
                        <button
                            onClick={() => setCurrentPath(breadcrumbs.slice(0, index + 1).join('/'))}
                            className="px-3 py-1.5 hover:bg-[#806141]/10 rounded-lg transition-all duration-200 whitespace-nowrap text-sm font-medium text-[#5a3a2f] hover:text-[#806141]"
                        >
                            {part}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* Content */}
            <div
                className="flex-1 overflow-auto p-6 bg-gradient-to-br from-white/40 to-[#f0e6d2]/40 backdrop-blur-sm"
                onContextMenu={handleEmptySpaceContextMenu}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d7b98d]"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#806141] absolute top-0 left-0"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileIcon className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-red-600 mb-4 font-medium">{error}</p>
                            <button
                                onClick={() => browse(currentPath)}
                                className="px-6 py-3 bg-gradient-to-r from-[#806141] to-[#6b4f3a] text-white rounded-xl hover:from-[#6b4f3a] hover:to-[#5a3a2f] transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                ) : directories.length === 0 && files.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#e6ccab] to-[#d7b98d] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Folder className="w-12 h-12 text-[#806141]" />
                            </div>
                            <p className="text-[#5a3a2f] text-lg font-medium">المجلد فارغ</p>
                            <p className="text-[#9a7b50] text-sm mt-2">لا توجد ملفات أو مجلدات هنا</p>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...directories, ...files].map((item) => (
                            <div
                                key={item.path}
                                className="group flex flex-col items-center p-5 bg-white/80 backdrop-blur-sm border-2 border-[#d7b98d]/30 rounded-2xl hover:bg-white hover:border-[#806141]/50 hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 relative"
                                onClick={() => item.type === 'directory' && handleNavigate(item.path)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setContextMenu({ x: e.clientX, y: e.clientY, item });
                                    setSelectedItem(item);
                                    setEmptySpaceMenu(null);
                                }}
                            >
                                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                                    {getFileIcon(item)}
                                </div>
                                <p className="text-sm text-center truncate w-full font-medium text-[#5a3a2f] group-hover:text-[#806141]" title={item.name}>
                                    {item.name}
                                </p>
                                {item.size && (
                                    <p className="text-xs text-[#9a7b50] mt-1">{formatSize(item.size)}</p>
                                )}
                                <button
                                    data-context-menu
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContextMenu({ x: e.clientX, y: e.clientY, item });
                                        setSelectedItem(item);
                                    }}
                                    className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#806141] hover:text-white border border-[#d7b98d]/30"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-[#d7b98d]/30">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#806141] to-[#6b4f3a] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-2 text-sm font-semibold hover:text-[#f0e6d2] transition-colors"
                                        >
                                            <span>الاسم</span>
                                            {sortBy === 'name' && (
                                                sortOrder === 'asc' ?
                                                    <ArrowUp className="w-4 h-4" /> :
                                                    <ArrowDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSort('size')}
                                            className="flex items-center gap-2 text-sm font-semibold hover:text-[#f0e6d2] transition-colors"
                                        >
                                            <span>الحجم</span>
                                            {sortBy === 'size' && (
                                                sortOrder === 'asc' ?
                                                    <ArrowUp className="w-4 h-4" /> :
                                                    <ArrowDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSort('type')}
                                            className="flex items-center gap-2 text-sm font-semibold hover:text-[#f0e6d2] transition-colors"
                                        >
                                            <span>النوع</span>
                                            {sortBy === 'type' && (
                                                sortOrder === 'asc' ?
                                                    <ArrowUp className="w-4 h-4" /> :
                                                    <ArrowDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSort('date')}
                                            className="flex items-center gap-2 text-sm font-semibold hover:text-[#f0e6d2] transition-colors"
                                        >
                                            <span>التاريخ</span>
                                            {sortBy === 'date' && (
                                                sortOrder === 'asc' ?
                                                    <ArrowUp className="w-4 h-4" /> :
                                                    <ArrowDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getSortedItems().map((item, index) => (
                                    <tr
                                        key={item.path}
                                        className={`border-b border-[#d7b98d]/20 hover:bg-[#f0e6d2]/50 cursor-pointer transition-all duration-200 ${index % 2 === 0 ? 'bg-white/50' : 'bg-[#f0e6d2]/20'
                                            }`}
                                        onClick={() => item.type === 'directory' && handleNavigate(item.path)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setContextMenu({ x: e.clientX, y: e.clientY, item });
                                            setSelectedItem(item);
                                            setEmptySpaceMenu(null);
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="transform hover:scale-110 transition-transform">
                                                    {getFileIcon(item)}
                                                </div>
                                                <span className="text-sm font-medium text-[#5a3a2f]">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#9a7b50]">{formatSize(item.size)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.type === 'directory'
                                                ? 'bg-[#e6ccab] text-[#5a3a2f]'
                                                : 'bg-[#d7b98d] text-[#3a2411]'
                                                }`}>
                                                {item.type === 'directory' ? 'مجلد' : 'ملف'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#9a7b50]">{formatDate(item.modified_at)}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                data-context-menu
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setContextMenu({ x: e.clientX, y: e.clientY, item });
                                                    setSelectedItem(item);
                                                }}
                                                className="p-2 hover:bg-[#806141]/10 rounded-xl transition-all duration-200 hover:scale-110"
                                            >
                                                <MoreVertical className="w-5 h-5 text-[#806141]" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    data-context-menu
                    className="fixed bg-white/95 backdrop-blur-md border-2 border-[#d7b98d]/50 rounded-2xl shadow-2xl py-2 z-50 min-w-[200px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.item.type === 'file' && (
                        <button
                            onClick={() => {
                                handleCopyLink(contextMenu.item);
                                setContextMenu(null);
                            }}
                            className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-[#806141]/10 hover:to-[#6b4f3a]/10 flex items-center gap-3 transition-all duration-200 group"
                        >
                            <div className="p-2 bg-[#4b8bff]/10 rounded-xl group-hover:bg-[#4b8bff]/20 transition-colors">
                                <Copy className="w-4 h-4 text-[#4b8bff]" />
                            </div>
                            <span className="font-medium text-[#5a3a2f]">{copiedLink ? 'تم النسخ! ✓' : 'نسخ الرابط'}</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setShowRenameModal(true);
                            setNewName(contextMenu.item.name);
                            setContextMenu(null);
                        }}
                        className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-[#806141]/10 hover:to-[#6b4f3a]/10 flex items-center gap-3 transition-all duration-200 group"
                    >
                        <div className="p-2 bg-[#806141]/10 rounded-xl group-hover:bg-[#806141]/20 transition-colors">
                            <Edit2 className="w-4 h-4 text-[#806141]" />
                        </div>
                        <span className="font-medium text-[#5a3a2f]">إعادة تسمية</span>
                    </button>
                    {contextMenu.item.type === 'file' && (
                        <button
                            onClick={() => {
                                handleDownload(contextMenu.item);
                                setContextMenu(null);
                            }}
                            className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-[#806141]/10 hover:to-[#6b4f3a]/10 flex items-center gap-3 transition-all duration-200 group"
                        >
                            <div className="p-2 bg-[#10b981]/10 rounded-xl group-hover:bg-[#10b981]/20 transition-colors">
                                <Download className="w-4 h-4 text-[#10b981]" />
                            </div>
                            <span className="font-medium text-[#5a3a2f]">تحميل</span>
                        </button>
                    )}
                    <div className="my-2 mx-3 h-px bg-gradient-to-r from-transparent via-[#d7b98d] to-transparent"></div>
                    <button
                        onClick={() => {
                            setShowDeleteModal(true);
                            setContextMenu(null);
                        }}
                        className="w-full px-5 py-3 text-right hover:bg-red-50 flex items-center gap-3 transition-all duration-200 group rounded-xl mx-1"
                    >
                        <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium text-red-600">حذف</span>
                    </button>
                </div>
            )}

            {/* Empty Space Context Menu */}
            {emptySpaceMenu && (
                <div
                    data-context-menu
                    className="fixed bg-white/95 backdrop-blur-md border-2 border-[#d7b98d]/50 rounded-2xl shadow-2xl py-2 z-50 min-w-[200px]"
                    style={{ top: emptySpaceMenu.y, left: emptySpaceMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            browse(currentPath);
                            setEmptySpaceMenu(null);
                        }}
                        className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-[#806141]/10 hover:to-[#6b4f3a]/10 flex items-center gap-3 transition-all duration-200 group"
                    >
                        <div className="p-2 bg-[#10b981]/10 rounded-xl group-hover:bg-[#10b981]/20 transition-colors">
                            <RefreshCw className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <span className="font-medium text-[#5a3a2f]">تحديث</span>
                    </button>
                    <button
                        onClick={() => {
                            fileInputRef.current?.click();
                            setEmptySpaceMenu(null);
                        }}
                        className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-[#806141]/10 hover:to-[#6b4f3a]/10 flex items-center gap-3 transition-all duration-200 group"
                    >
                        <div className="p-2 bg-[#4b8bff]/10 rounded-xl group-hover:bg-[#4b8bff]/20 transition-colors">
                            <Upload className="w-4 h-4 text-[#4b8bff]" />
                        </div>
                        <span className="font-medium text-[#5a3a2f]">رفع ملف</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowCreateFolderModal(true);
                            setEmptySpaceMenu(null);
                        }}
                        className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-[#806141]/10 hover:to-[#6b4f3a]/10 flex items-center gap-3 transition-all duration-200 group"
                    >
                        <div className="p-2 bg-[#806141]/10 rounded-xl group-hover:bg-[#806141]/20 transition-colors">
                            <FolderPlus className="w-4 h-4 text-[#806141]" />
                        </div>
                        <span className="font-medium text-[#5a3a2f]">مجلد جديد</span>
                    </button>
                </div>
            )}

            {/* Rename Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-white to-[#f0e6d2] rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-[#d7b98d]/50 transform animate-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-[#806141] to-[#6b4f3a] rounded-2xl">
                                <Edit2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#5a3a2f]">إعادة تسمية</h3>
                        </div>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-[#d7b98d] rounded-xl mb-6 focus:outline-none focus:border-[#806141] focus:ring-4 focus:ring-[#806141]/20 transition-all duration-200 bg-white/80 backdrop-blur-sm text-[#5a3a2f] font-medium"
                            placeholder="الاسم الجديد"
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="px-6 py-3 border-2 border-[#d7b98d] rounded-xl hover:bg-[#f0e6d2] transition-all duration-200 font-medium text-[#5a3a2f]"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleRename}
                                className="px-6 py-3 bg-gradient-to-r from-[#806141] to-[#6b4f3a] text-white rounded-xl hover:from-[#6b4f3a] hover:to-[#5a3a2f] transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            >
                                حفظ
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Delete Modal */}
            {
                showDeleteModal && selectedItem && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-red-200 transform animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
                                    <Trash2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-red-900">تأكيد الحذف</h3>
                            </div>
                            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-xl mb-6">
                                <p className="text-red-900 font-medium">
                                    هل أنت متأكد من حذف <strong className="text-red-700">"{selectedItem.name}"</strong>؟
                                </p>
                                <p className="text-red-700 text-sm mt-2">لا يمكن التراجع عن هذا الإجراء</p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                                >
                                    حذف نهائياً
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Folder Modal */}
            {
                showCreateFolderModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-white to-[#f0e6d2] rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-[#d7b98d]/50 transform animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-[#806141] to-[#6b4f3a] rounded-2xl">
                                    <FolderPlus className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#5a3a2f]">مجلد جديد</h3>
                            </div>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-[#d7b98d] rounded-xl mb-6 focus:outline-none focus:border-[#806141] focus:ring-4 focus:ring-[#806141]/20 transition-all duration-200 bg-white/80 backdrop-blur-sm text-[#5a3a2f] font-medium"
                                placeholder="اسم المجلد"
                                autoFocus
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowCreateFolderModal(false);
                                        setNewName('');
                                    }}
                                    className="px-6 py-3 border-2 border-[#d7b98d] rounded-xl hover:bg-[#f0e6d2] transition-all duration-200 font-medium text-[#5a3a2f]"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    className="px-6 py-3 bg-gradient-to-r from-[#806141] to-[#6b4f3a] text-white rounded-xl hover:from-[#6b4f3a] hover:to-[#5a3a2f] transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                                >
                                    إنشاء
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Upload Modal */}
            {
                showUploadModal && selectedFile && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-white to-[#f0e6d2] rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-[#d7b98d]/50 transform animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-[#4b8bff] to-[#3b7bef] rounded-2xl">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#5a3a2f]">رفع ملف</h3>
                            </div>

                            <div className="bg-[#f0e6d2]/50 border-2 border-[#d7b98d] rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileIcon className="w-8 h-8 text-[#806141]" />
                                    <div className="flex-1">
                                        <p className="font-medium text-[#5a3a2f] truncate">{selectedFile.name}</p>
                                        <p className="text-sm text-[#9a7b50]">{formatSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#d7b98d]/50">
                                    <p className="text-sm text-[#6b4f3a]">
                                        <span className="font-medium">المجلد الحالي:</span> {currentPath || 'التخزين الرئيسي'}
                                    </p>
                                </div>
                            </div>

                            {uploading && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-center gap-3 text-[#806141]">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#d7b98d] border-t-[#806141]"></div>
                                        <span className="font-medium">جاري الرفع...</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFile(null);
                                    }}
                                    disabled={uploading}
                                    className="px-6 py-3 border-2 border-[#d7b98d] rounded-xl hover:bg-[#f0e6d2] transition-all duration-200 font-medium text-[#5a3a2f] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleUploadFile}
                                    disabled={uploading}
                                    className="px-6 py-3 bg-gradient-to-r from-[#4b8bff] to-[#3b7bef] text-white rounded-xl hover:from-[#3b7bef] hover:to-[#2b6bdf] transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'جاري الرفع...' : 'رفع الملف'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
