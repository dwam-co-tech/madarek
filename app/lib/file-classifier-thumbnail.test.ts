/**
 * Property-Based Tests for File Classifier Service - Thumbnail Generation
 * 
 * **Feature: smart-file-manager, Property 31: Thumbnail Generation for Media**
 * **Validates: Requirements 9.4**
 * 
 * Tests that image and video files have thumbnails generated correctly.
 */

import fc from 'fast-check';
import { FileClassifierService } from './file-classifier.service';
import { FileType } from './file-upload.model';

// Mock canvas and image operations for jsdom
beforeAll(() => {
    // Mock HTMLCanvasElement
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        fillStyle: '',
    })) as any;

    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');

    // Mock FileReader
    const mockFileReader = {
        readAsDataURL: jest.fn(function (this: any) {
            setTimeout(() => {
                if (this.onload) {
                    this.onload({ target: { result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' } });
                }
            }, 0);
        }),
        onerror: null,
        onload: null,
    };

    global.FileReader = jest.fn(() => mockFileReader) as any;

    // Mock Image
    global.Image = jest.fn(function (this: any) {
        this.width = 100;
        this.height = 100;
        this.onload = null;
        this.onerror = null;

        Object.defineProperty(this, 'src', {
            set: function (value: string) {
                setTimeout(() => {
                    if (this.onload) {
                        this.onload();
                    }
                }, 0);
            }
        });

        return this;
    }) as any;

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
});

describe('Feature: smart-file-manager, Property 31: Thumbnail Generation for Media', () => {
    let service: FileClassifierService;

    beforeEach(() => {
        service = new FileClassifierService();
    });

    /**
     * Helper function to create a mock file
     */
    const createMockFile = (name: string, mimeType: string): File => {
        const blob = new Blob(['mock content'], { type: mimeType });
        return new File([blob], name, { type: mimeType });
    };

    it('should generate thumbnails for image files', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s.trim() || 'file'}.jpg`),
                    mimeType: fc.constantFrom(
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/webp'
                    )
                }),
                async (fileData) => {
                    const file = createMockFile(fileData.name, fileData.mimeType);
                    const fileType = service.classifyFile(file);

                    // Verify file is classified as image
                    expect(fileType).toBe(FileType.IMAGE);

                    // Generate thumbnail
                    const thumbnail = await service.generateThumbnail(file);

                    // Verify thumbnail was generated
                    expect(thumbnail).not.toBeNull();
                    expect(typeof thumbnail).toBe('string');

                    // Verify thumbnail is a data URL
                    if (thumbnail) {
                        expect(thumbnail).toMatch(/^data:image\/(jpeg|png);base64,/);
                    }
                }
            ),
            { numRuns: 15 } // Using 15 iterations as per user preference (10-20)
        );
    });

    it('should return null for non-media files', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s.trim() || 'file'}.pdf`),
                    mimeType: fc.constantFrom(
                        'application/pdf',
                        'text/plain',
                        'application/json',
                        'application/msword'
                    )
                }),
                async (fileData) => {
                    const file = createMockFile(fileData.name, fileData.mimeType);

                    const fileType = service.classifyFile(file);

                    // Verify file is not classified as image or video
                    expect(fileType).not.toBe(FileType.IMAGE);
                    expect(fileType).not.toBe(FileType.VIDEO);

                    // Generate thumbnail
                    const thumbnail = await service.generateThumbnail(file);

                    // Verify no thumbnail was generated
                    expect(thumbnail).toBeNull();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should handle various image formats correctly', async () => {
        const imageFormats = [
            { ext: 'jpg', mime: 'image/jpeg' },
            { ext: 'png', mime: 'image/png' },
            { ext: 'gif', mime: 'image/gif' },
            { ext: 'webp', mime: 'image/webp' },
        ];

        for (const format of imageFormats) {
            const file = createMockFile(`test.${format.ext}`, format.mime);
            const thumbnail = await service.generateThumbnail(file);

            expect(thumbnail).not.toBeNull();
            expect(typeof thumbnail).toBe('string');
            if (thumbnail) {
                expect(thumbnail).toMatch(/^data:image\//);
            }
        }
    });

    it('should return null for audio files', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s.trim() || 'file'}.mp3`),
                    mimeType: fc.constantFrom(
                        'audio/mpeg',
                        'audio/wav',
                        'audio/ogg'
                    )
                }),
                async (fileData) => {
                    const file = createMockFile(fileData.name, fileData.mimeType);

                    const fileType = service.classifyFile(file);
                    expect(fileType).toBe(FileType.AUDIO);

                    const thumbnail = await service.generateThumbnail(file);
                    expect(thumbnail).toBeNull();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should return null for unclassified files', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s.trim() || 'file'}.xyz`),
                    mimeType: fc.constant('application/octet-stream')
                }),
                async (fileData) => {
                    const file = createMockFile(fileData.name, fileData.mimeType);

                    const fileType = service.classifyFile(file);
                    expect(fileType).toBe(FileType.UNCLASSIFIED);

                    const thumbnail = await service.generateThumbnail(file);
                    expect(thumbnail).toBeNull();
                }
            ),
            { numRuns: 15 }
        );
    });
});
