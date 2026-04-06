'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileType, UploadStatus } from '../../app/lib/file-upload.model';
import { Search, X } from 'lucide-react';

export interface SearchFilters {
  filename?: string;
  fileType?: FileType;
  status?: UploadStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'date' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
}

// Legacy types for backward compatibility
export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: Array<{ label: string; value: string }>;
}

export interface SearchQuery {
  text?: string;
  fields?: string[];
  [key: string]: any;
}

interface SearchFilterProps {
  // New file-based props
  onFilterChange?: (filters: SearchFilters) => void;
  debounceMs?: number;

  // Legacy props for backward compatibility
  fields?: FieldDef[];
  onChange?: (query: SearchQuery) => void;
  totalCount?: number;
  filteredCount?: number;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onFilterChange,
  debounceMs = 300,
  fields,
  onChange,
  totalCount,
  filteredCount
}) => {
  // Legacy mode: if fields and onChange are provided
  const isLegacyMode = fields && onChange;

  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState<FileType | ''>('');
  const [status, setStatus] = useState<UploadStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Legacy state
  const [searchText, setSearchText] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [legacyFilters, setLegacyFilters] = useState<Record<string, any>>({});

  // Debounced search for new mode
  useEffect(() => {
    if (isLegacyMode || !onFilterChange) return;

    const timer = setTimeout(() => {
      const filters: SearchFilters = {
        sortBy,
        sortOrder
      };

      if (filename.trim()) filters.filename = filename.trim();
      if (fileType) filters.fileType = fileType as FileType;
      if (status) filters.status = status as UploadStatus;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      onFilterChange(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filename, fileType, status, dateFrom, dateTo, sortBy, sortOrder, debounceMs, onFilterChange, isLegacyMode]);

  // Legacy mode effect
  useEffect(() => {
    if (!isLegacyMode || !onChange) return;

    const timer = setTimeout(() => {
      const query: SearchQuery = {
        text: searchText,
        fields: selectedFields.length > 0 ? selectedFields : undefined,
        ...legacyFilters
      };
      onChange(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchText, selectedFields, legacyFilters, debounceMs, onChange, isLegacyMode]);

  const clearFilters = useCallback(() => {
    if (isLegacyMode) {
      setSearchText('');
      setSelectedFields([]);
      setLegacyFilters({});
    } else {
      setFilename('');
      setFileType('');
      setStatus('');
      setDateFrom('');
      setDateTo('');
      setSortBy('date');
      setSortOrder('desc');
    }
  }, [isLegacyMode]);

  const hasActiveFilters = isLegacyMode
    ? searchText || selectedFields.length > 0 || Object.keys(legacyFilters).length > 0
    : filename || fileType || status || dateFrom || dateTo;

  // Legacy mode rendering
  if (isLegacyMode && fields) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">بحث وتصفية</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X size={16} />
              مسح الكل
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Text */}
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="search-text" className="block text-sm font-medium text-gray-700 mb-1">
              بحث
            </label>
            <div className="relative">
              <input
                id="search-text"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ابحث..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Dynamic fields */}
          {fields.map((field) => {
            if (field.type === 'select' && field.options) {
              return (
                <div key={field.key}>
                  <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <select
                    id={field.key}
                    value={legacyFilters[field.key] || ''}
                    onChange={(e) => setLegacyFilters({ ...legacyFilters, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">الكل</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })}
        </div>

        {totalCount !== undefined && filteredCount !== undefined && (
          <div className="text-sm text-gray-600">
            عرض {filteredCount} من {totalCount} نتيجة
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filename Search */}
        <div>
          <label htmlFor="filename-search" className="block text-sm font-medium text-gray-700 mb-1">
            Filename
          </label>
          <div className="relative">
            <input
              id="filename-search"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Search by filename..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* File Type Filter */}
        <div>
          <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <select
            id="file-type"
            value={fileType}
            onChange={(e) => setFileType(e.target.value as FileType | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value={FileType.IMAGE}>Image</option>
            <option value={FileType.VIDEO}>Video</option>
            <option value={FileType.AUDIO}>Audio</option>
            <option value={FileType.DOCUMENT}>Document</option>
            <option value={FileType.UNCLASSIFIED}>Unclassified</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as UploadStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value={UploadStatus.COMPLETED}>Completed</option>
            <option value={UploadStatus.UPLOADING}>Uploading</option>
            <option value={UploadStatus.FAILED}>Failed</option>
            <option value={UploadStatus.PENDING}>Pending</option>
            <option value={UploadStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">↑ Asc</option>
              <option value="desc">↓ Desc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
