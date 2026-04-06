# FileArchive Component

Archive and search interface for the Smart File Manager system.

## Components

### FileArchive
Basic file archive display with pagination.

```tsx
import { FileArchive } from '@/components/FileArchive';

<FileArchive 
  apiUrl="/api/files/archive"
  onError={(error) => console.error(error)}
/>
```

### FileArchiveWithSearch
File archive with integrated search and filter capabilities.

```tsx
import { FileArchiveWithSearch } from '@/components/FileArchive';

<FileArchiveWithSearch 
  apiUrl="/api/files/archive"
  searchApiUrl="/api/files/archive/search"
  enableSearch={true}
  onError={(error) => console.error(error)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| apiUrl | string | '/api/files/archive' | API endpoint for fetching files |
| searchApiUrl | string | '/api/files/archive/search' | API endpoint for searching files |
| enableSearch | boolean | true | Enable/disable search functionality |
| onError | (error: string) => void | undefined | Error callback |

## Features

- Paginated file list (50 files per page)
- File information display (name, type, size, status, date, URL)
- Copy file URL to clipboard
- Search by filename
- Filter by file type, status, date range
- Sort by name, date, size, or type
- Responsive design
- Loading and error states

## API Requirements

### GET /api/files/archive
Returns paginated list of files.

Response:
```json
{
  "success": true,
  "data": {
    "files": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total": 100,
      "last_page": 2,
      "from": 1,
      "to": 50
    }
  }
}
```

### POST /api/files/archive/search
Search and filter files.

Request:
```json
{
  "filename": "test",
  "file_type": "document",
  "status": "completed",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31",
  "sort_by": "date",
  "sort_order": "desc",
  "page": 1,
  "per_page": 50
}
```
