# FileUploadZone Component

A React component for drag-and-drop file uploads with visual feedback and file management capabilities.

## Features

- ✅ Drag-and-drop file upload
- ✅ Click to select files
- ✅ Multiple file selection (up to 600 files by default)
- ✅ Visual feedback for drag-over state
- ✅ File count and total size display
- ✅ Individual file removal
- ✅ Clear all files functionality
- ✅ File size formatting
- ✅ Error handling and validation
- ✅ Customizable file limits and accepted types
- ✅ Disabled state support

## Installation

The component uses `react-dropzone` which should already be installed:

```bash
npm install react-dropzone
```

## Usage

### Basic Example

```tsx
import { FileUploadZone } from '@/components/FileUploadZone';

function MyComponent() {
    const handleFilesSelected = (files: File[]) => {
        console.log('Selected files:', files);
        // Process the files (upload, etc.)
    };

    return (
        <FileUploadZone onFilesSelected={handleFilesSelected} />
    );
}
```

### With Custom Configuration

```tsx
import { FileUploadZone } from '@/components/FileUploadZone';

function MyComponent() {
    const handleFilesSelected = (files: File[]) => {
        // Upload files to server
        uploadFiles(files);
    };

    return (
        <FileUploadZone
            onFilesSelected={handleFilesSelected}
            maxFiles={100}
            maxFileSize={50 * 1024 * 1024} // 50MB
            accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                'application/pdf': ['.pdf'],
            }}
            disabled={false}
        />
    );
}
```

### With Upload Queue Manager

```tsx
import { FileUploadZone } from '@/components/FileUploadZone';
import { UploadQueueManager } from '@/app/lib/upload-queue-manager.service';

function FileUploadPage() {
    const queueManager = new UploadQueueManager();

    const handleFilesSelected = (files: File[]) => {
        queueManager.addToQueue(files);
    };

    return (
        <div>
            <h1>Upload Files</h1>
            <FileUploadZone onFilesSelected={handleFilesSelected} />
        </div>
    );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesSelected` | `(files: File[]) => void` | **Required** | Callback function called when files are ready to upload |
| `maxFiles` | `number` | `600` | Maximum number of files that can be selected at once |
| `maxFileSize` | `number` | `104857600` (100MB) | Maximum file size in bytes |
| `accept` | `Record<string, string[]>` | `undefined` | Accepted file types (MIME types and extensions) |
| `disabled` | `boolean` | `false` | Whether the upload zone is disabled |

## Accept Prop Format

The `accept` prop follows the HTML5 input accept attribute format:

```tsx
// Accept only images
accept={{
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
}}

// Accept images and PDFs
accept={{
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf']
}}

// Accept specific file types
accept={{
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt']
}}
```

## Features in Detail

### Drag and Drop

Users can drag files from their file system and drop them onto the upload zone. The zone provides visual feedback when files are being dragged over it.

### File Selection

Clicking on the upload zone opens the native file selection dialog, allowing users to browse and select files.

### File Management

- **Individual Removal**: Each selected file has a remove button (X icon)
- **Clear All**: A "Clear All" button removes all selected files at once
- **File Information**: Each file displays its name and size

### Visual Feedback

- **Drag Over State**: The upload zone changes appearance when files are dragged over it
- **File Count**: Shows the number of selected files vs. the maximum allowed
- **Total Size**: Displays the total size of all selected files
- **Error Messages**: Shows validation errors in a red alert box

### Error Handling

The component handles various error scenarios:
- Exceeding maximum file count
- File size too large
- Invalid file types
- Other validation errors from react-dropzone

## Styling

The component uses Tailwind CSS for styling. The main classes used are:

- Border and layout: `border-2 border-dashed rounded-lg p-8`
- Hover states: `hover:border-gray-400 hover:bg-gray-50`
- Active drag state: `border-blue-500 bg-blue-50 scale-[1.02]`
- Disabled state: `opacity-50 cursor-not-allowed`

You can customize the styling by modifying the component or wrapping it in a container with custom styles.

## Accessibility

- The component uses semantic HTML elements
- Remove buttons have `aria-label` attributes for screen readers
- The file input is properly associated with the dropzone
- Keyboard navigation is supported through native browser functionality

## Browser Support

The component works in all modern browsers that support:
- HTML5 File API
- Drag and Drop API
- React 18+

## Requirements Validation

This component validates the following requirements from the Smart File Manager specification:

- **Requirement 9.1**: Drag-and-drop interface with visual feedback
- **Requirement 9.2**: File selection dialog with multiple file support
- **Requirement 9.3**: Click-to-select functionality
- **Requirement 1.1**: Support for up to 600 files in a single operation

## Testing

The component includes comprehensive unit tests covering:
- Rendering with default and custom props
- File selection and drag-and-drop
- File removal (individual and all)
- Error handling
- Disabled state
- File count and size display

Run tests with:

```bash
npm test -- FileUploadZone
```

## License

Part of the Madarek Smart File Manager system.
