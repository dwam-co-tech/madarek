'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Download, Copy, ExternalLink, Calendar, FileText, Image, Video, Music, File as FileIcon, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back.mdarek.net/api';

interface ArchivedFile {
    id: number;
    file_name: string;
    original_name: string;
    file_type: 'image' | 'video' | 'audio' | 'document' | 'unclassified';
    mime_type: string;
    file_size: number;
    file_url: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface SearchFilters {
    search: string;
    fileType: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
};

export default function FileArchiveWithSearch() {
    const [files, setFiles] = useState<ArchivedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: 0,
        to: 0,
    });

    const [filters, setFilters] = useState<SearchFilters>({
        search: '',
        fileType: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
    });

    const [showFilters, setShowFilters] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const fetchFiles = async (page: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const params: any = {
                page,
                per_page: pagination.per_page,
                sort_by: filters.sortBy,
                sort_order: filters.sortOrder,
            };

            if (filters.search) params.search = filters.search;
            if (filters.fileType) params.file_type = filters.fileType;
            if (filters.status) params.status = filters.status;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;

            const response = await axios.get(`${API_BASE_URL}/files/archive`, {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const responseData = response.data.data;
                setFiles(responseData.files || responseData.data || []);

                const paginationData = responseData.pagination || {
                    current_page: responseData.current_page || 1,
                    last_page: responseData.last_page || 1,
                    per_page: responseData.per_page || 20,
                    total: responseData.total || 0,
                    from: responseData.from || 0,
                    to: responseData.to || 0,
                };

                setPagination(paginationData);
            } else {
                throw new Error(response.data.error?.message || 'Failed to fetch files');
            }
        } catch (err: any) {
            console.error('Error fetching files:', err);
            setError(err.response?.data?.error?.message || err.message || 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(1);
    }, [filters.sortBy, filters.sortOrder]);

    const handleSearch = () => {
        fetchFiles(1);
    };

    const handleCopyLink = async (fileId: number, url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(fileId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleExportExcel = () => {
        if (files.length === 0) {
            alert('No files to export');
            return;
        }

        const exportData = files.map(file => ({
            'File Name': file.original_name,
            'Type': file.file_type,
            'Size': formatFileSize(file.file_size),
            'Status': file.status,
            'Upload Date': new Date(file.created_at).toLocaleString('ar-EG'),
            'URL': file.file_url,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Files');

        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // File Name
            { wch: 15 }, // Type
            { wch: 12 }, // Size
            { wch: 12 }, // Status
            { wch: 20 }, // Upload Date
            { wch: 50 }, // URL
        ];

        XLSX.writeFile(wb, `file-archive-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image': return <Image className="w-5 h-5 text-blue-500" />;
            case 'video': return <Video className="w-5 h-5 text-purple-500" />;
            case 'audio': return <Music className="w-5 h-5 text-green-500" />;
            case 'document': return <FileText className="w-5 h-5 text-orange-500" />;
            default: return <FileIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            completed: 'bg-green-100 text-green-800',
            uploading: 'bg-blue-100 text-blue-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };

        const labels = {
            completed: 'مكتمل',
            uploading: 'جاري الرفع',
            pending: 'قيد الانتظار',
            failed: 'فشل',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    return (
        <div className="w-full space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">أرشيف الملفات</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {pagination.total} ملف • الصفحة {pagination.current_page} من {pagination.last_page}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchFiles(pagination.current_page)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        تحديث
                    </button>
                    <button
                        onClick={handleExportExcel}
                        disabled={files.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        تصدير Excel
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن ملف..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        بحث
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        فلترة
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الملف</label>
                            <select
                                value={filters.fileType}
                                onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">الكل</option>
                                <option value="image">صور</option>
                                <option value="video">فيديو</option>
                                <option value="audio">صوت</option>
                                <option value="document">مستندات</option>
                                <option value="unclassified">غير مصنف</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">الكل</option>
                                <option value="completed">مكتمل</option>
                                <option value="uploading">جاري الرفع</option>
                                <option value="pending">قيد الانتظار</option>
                                <option value="failed">فشل</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب حسب</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="created_at">تاريخ الرفع</option>
                                <option value="file_name">اسم الملف</option>
                                <option value="file_size">حجم الملف</option>
                                <option value="file_type">نوع الملف</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاتجاه</label>
                            <select
                                value={filters.sortOrder}
                                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="desc">تنازلي</option>
                                <option value="asc">تصاعدي</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Files List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => fetchFiles(pagination.current_page)}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : files.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">لا توجد ملفات</p>
                    <p className="text-gray-500 text-sm mt-2">قم برفع ملفات لتظهر هنا</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الملف
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        النوع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحجم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        تاريخ الرفع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {files.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(file.file_type)}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                                                        {file.original_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {file.mime_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 capitalize">{file.file_type}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{formatFileSize(file.file_size)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(file.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(file.created_at).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopyLink(file.id, file.file_url)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="نسخ الرابط"
                                                >
                                                    {copiedId === file.id ? (
                                                        <span className="text-xs font-medium">تم النسخ!</span>
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <a
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="فتح الملف"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {pagination.from} إلى {pagination.to} من {pagination.total} ملف
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchFiles(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.last_page <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.current_page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.current_page >= pagination.last_page - 2) {
                                            pageNum = pagination.last_page - 4 + i;
                                        } else {
                                            pageNum = pagination.current_page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => fetchFiles(pageNum)}
                                                className={`px-3 py-1 rounded-lg transition-colors ${pagination.current_page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => fetchFiles(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
