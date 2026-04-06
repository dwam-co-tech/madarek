/**
 * Smart File Manager - File Classifier Property-Based Tests
 * 
 * Property-Based Test for file classification accuracy using fast-check.
 * This test validates that files are correctly classified based on MIME type.
 * 
 * **Feature: smart-file-manager, Property 2: File Classification Accuracy**
 * **Validates: Requirements 1.2**
 */

import fc from 'fast-check';
import { FileClassifierService } from './file-classifier.service';
import { FileType } from './file-upload.model';

describe('Feature: smart-file-manager, Property 2: File Classification Accuracy', () => {
    const classifier = new FileClassifierService();

    /**
     * Property Test: File Classification Accuracy
     * 
     * For any file with a valid MIME type or extension, the File_Classifier 
     * should correctly categorize it into one of the five categories 
     * (image, video, audio, document, unclassified) based on its type.
     */
    it('should correctly classify any file based on MIME type', () => {
        // Define arbitraries for different file types
        const imageMimeTypes = fc.constantFrom(
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/bmp',
            'image/tiff',
            'image/x-icon'
        );

        const videoMimeTypes = fc.constantFrom(
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-flv',
            'video/webm',
            'video/x-matroska',
            'video/3gpp'
        );

        const audioMimeTypes = fc.constantFrom(
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/webm',
            'audio/aac',
            'audio/flac',
            'audio/x-m4a'
        );

        const documentMimeTypes = fc.constantFrom(
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'text/html',
            'text/xml',
            'application/json',
            'application/rtf'
        );

        const unclassifiedMimeTypes = fc.constantFrom(
            'application/octet-stream',
            'application/zip',
            'application/x-rar-compressed',
            'text/javascript',
            'application/x-executable'
        );

        // Create arbitrary for file data with expected classification
        const fileDataArbitrary = fc.oneof(
            fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                type: imageMimeTypes,
                size: fc.integer({ min: 1, max: 10000000 }),
                expectedType: fc.constant(FileType.IMAGE)
            }),
            fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                type: videoMimeTypes,
                size: fc.integer({ min: 1, max: 10000000 }),
                expectedType: fc.constant(FileType.VIDEO)
            }),
            fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                type: audioMimeTypes,
                size: fc.integer({ min: 1, max: 10000000 }),
                expectedType: fc.constant(FileType.AUDIO)
            }),
            fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                type: documentMimeTypes,
                size: fc.integer({ min: 1, max: 10000000 }),
                expectedType: fc.constant(FileType.DOCUMENT)
            }),
            fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                type: unclassifiedMimeTypes,
                size: fc.integer({ min: 1, max: 10000000 }),
                expectedType: fc.constant(FileType.UNCLASSIFIED)
            })
        );

        // Run property test
        fc.assert(
            fc.property(fileDataArbitrary, (fileData) => {
                // Create a mock File object
                const file = new File(['test content'], fileData.name, {
                    type: fileData.type
                });

                // Classify the file
                const classification = classifier.classifyFile(file);

                // Verify the classification matches the expected type
                expect(classification).toBe(fileData.expectedType);
            }),
            { numRuns: 20 } // Run 20 iterations as per user preference
        );
    });

    /**
     * Property Test: Extension-Based Classification Fallback
     * 
     * When MIME type is not available, the classifier should fall back
     * to extension-based classification.
     */
    it('should correctly classify files by extension when MIME type is missing', () => {
        const extensionTestCases = fc.oneof(
            fc.record({
                name: fc.constantFrom('test.jpg', 'test.jpeg', 'test.png', 'test.gif', 'test.webp'),
                expectedType: fc.constant(FileType.IMAGE)
            }),
            fc.record({
                name: fc.constantFrom('test.mp4', 'test.mpeg', 'test.mov', 'test.avi', 'test.webm'),
                expectedType: fc.constant(FileType.VIDEO)
            }),
            fc.record({
                name: fc.constantFrom('test.mp3', 'test.wav', 'test.ogg', 'test.aac', 'test.flac'),
                expectedType: fc.constant(FileType.AUDIO)
            }),
            fc.record({
                name: fc.constantFrom('test.pdf', 'test.doc', 'test.docx', 'test.xls', 'test.xlsx', 'test.txt'),
                expectedType: fc.constant(FileType.DOCUMENT)
            }),
            fc.record({
                name: fc.constantFrom('test.exe', 'test.bin', 'test.dat', 'test.unknown'),
                expectedType: fc.constant(FileType.UNCLASSIFIED)
            })
        );

        fc.assert(
            fc.property(extensionTestCases, (testCase) => {
                // Create a File object with empty MIME type to force extension-based classification
                const file = new File(['test content'], testCase.name, {
                    type: ''
                });

                const classification = classifier.classifyFile(file);

                expect(classification).toBe(testCase.expectedType);
            }),
            { numRuns: 20 } // Run 20 iterations as per user preference
        );
    });

    /**
     * Property Test: MIME Type Priority
     * 
     * When both MIME type and extension are available, MIME type should
     * take priority in classification.
     */
    it('should prioritize MIME type over file extension', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('image/jpeg', 'video/mp4', 'audio/mp3', 'application/pdf'),
                fc.constantFrom('.txt', '.doc', '.xyz', '.unknown'),
                (mimeType, wrongExtension) => {
                    const fileName = `test${wrongExtension}`;
                    const file = new File(['test content'], fileName, { type: mimeType });

                    const classification = classifier.classifyFile(file);

                    // Verify classification is based on MIME type, not extension
                    if (mimeType.startsWith('image/')) {
                        expect(classification).toBe(FileType.IMAGE);
                    } else if (mimeType.startsWith('video/')) {
                        expect(classification).toBe(FileType.VIDEO);
                    } else if (mimeType.startsWith('audio/')) {
                        expect(classification).toBe(FileType.AUDIO);
                    } else if (mimeType === 'application/pdf') {
                        expect(classification).toBe(FileType.DOCUMENT);
                    }
                }
            ),
            { numRuns: 20 } // Run 20 iterations as per user preference
        );
    });

    /**
     * Property Test: Unclassified Files
     * 
     * Files with unknown MIME types and extensions should be classified
     * as UNCLASSIFIED.
     */
    it('should classify unknown file types as UNCLASSIFIED', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.constantFrom('.xyz', '.unknown', '.abc123', '.test'),
                (baseName, extension) => {
                    const fileName = `${baseName}${extension}`;
                    const file = new File(['test content'], fileName, {
                        type: 'application/x-unknown-type'
                    });

                    const classification = classifier.classifyFile(file);

                    expect(classification).toBe(FileType.UNCLASSIFIED);
                }
            ),
            { numRuns: 20 } // Run 20 iterations as per user preference
        );
    });

    /**
     * Unit Test: getMimeType method
     * 
     * Verify that getMimeType correctly extracts the MIME type from a File object.
     */
    it('should correctly extract MIME type from file', () => {
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const mimeType = classifier.getMimeType(file);
        expect(mimeType).toBe('application/pdf');
    });

    /**
     * Unit Test: Empty MIME type handling
     * 
     * Verify that files with empty MIME types return an empty string.
     */
    it('should return empty string for files with no MIME type', () => {
        const file = new File(['content'], 'test.txt', { type: '' });
        const mimeType = classifier.getMimeType(file);
        expect(mimeType).toBe('');
    });
});
