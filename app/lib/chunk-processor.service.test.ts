/**
 * Smart File Manager - Chunk Processor Property-Based Tests
 * 
 * Property-Based Test for file chunking correctness using fast-check.
 * This test validates that large files are split into correct chunk sizes.
 * 
 * **Feature: smart-file-manager, Property 19: File Chunking Correctness**
 * **Validates: Requirements 6.1**
 */

import fc from 'fast-check';
import { ChunkProcessorService } from './chunk-processor.service';

describe('Feature: smart-file-manager, Property 19: File Chunking Correctness', () => {
    const chunkProcessor = new ChunkProcessorService();
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
    const CHUNK_THRESHOLD = 5 * 1024 * 1024; // 5MB

    /**
     * Property Test: File Chunking Correctness
     * 
     * For any file larger than the chunk threshold (5MB), the Batch_Processor 
     * should split it into chunks of the configured size (2MB), with the last 
     * chunk containing the remainder.
     */
    it('should split large files into correct chunk sizes with last chunk containing remainder', () => {
        // Generate arbitrary file sizes larger than the threshold
        const largeFileSizeArbitrary = fc.integer({
            min: CHUNK_THRESHOLD + 1,
            max: 50 * 1024 * 1024 // Up to 50MB for reasonable test execution time
        });

        fc.assert(
            fc.property(
                largeFileSizeArbitrary,
                fc.string({ minLength: 1, maxLength: 50 }),
                (fileSize, fileName) => {
                    // Create a mock File object with the specified size
                    const fileContent = new Uint8Array(fileSize);
                    const file = new File([fileContent], fileName, { type: 'application/octet-stream' });

                    // Verify the file should be chunked
                    expect(chunkProcessor.shouldChunk(file)).toBe(true);

                    // Create chunks
                    const chunks = chunkProcessor.createChunks(file);

                    // Calculate expected number of chunks
                    const expectedChunkCount = Math.ceil(fileSize / CHUNK_SIZE);

                    // Property 1: Correct number of chunks
                    expect(chunks.length).toBe(expectedChunkCount);

                    // Property 2: All chunks except the last should be exactly CHUNK_SIZE
                    for (let i = 0; i < chunks.length - 1; i++) {
                        expect(chunks[i].size).toBe(CHUNK_SIZE);
                    }

                    // Property 3: Last chunk should contain the remainder
                    const lastChunk = chunks[chunks.length - 1];
                    const expectedLastChunkSize = fileSize - (CHUNK_SIZE * (chunks.length - 1));
                    expect(lastChunk.size).toBe(expectedLastChunkSize);
                    expect(lastChunk.size).toBeLessThanOrEqual(CHUNK_SIZE);
                    expect(lastChunk.size).toBeGreaterThan(0);

                    // Property 4: Chunks should have correct indices
                    chunks.forEach((chunk, index) => {
                        expect(chunk.index).toBe(index);
                        expect(chunk.total).toBe(expectedChunkCount);
                    });

                    // Property 5: Total size of all chunks should equal original file size
                    const totalChunkSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
                    expect(totalChunkSize).toBe(fileSize);

                    // Property 6: Each chunk should have valid data
                    chunks.forEach(chunk => {
                        expect(chunk.data).toBeInstanceOf(Blob);
                        expect(chunk.data.size).toBe(chunk.size);
                    });
                }
            ),
            { numRuns: 15 } // Run 15 iterations (within 10-20 range as per user preference)
        );
    });

    /**
     * Property Test: Small Files Should Not Be Chunked
     * 
     * Files smaller than or equal to the chunk threshold should not be chunked.
     */
    it('should not chunk files smaller than or equal to threshold', () => {
        const smallFileSizeArbitrary = fc.integer({
            min: 1,
            max: CHUNK_THRESHOLD
        });

        fc.assert(
            fc.property(
                smallFileSizeArbitrary,
                fc.string({ minLength: 1, maxLength: 50 }),
                (fileSize, fileName) => {
                    const fileContent = new Uint8Array(fileSize);
                    const file = new File([fileContent], fileName, { type: 'application/octet-stream' });

                    // Verify the file should NOT be chunked
                    expect(chunkProcessor.shouldChunk(file)).toBe(false);
                }
            ),
            { numRuns: 15 }
        );
    });

    /**
     * Property Test: Chunk Boundary Cases
     * 
     * Test files that are exact multiples of chunk size to ensure
     * proper handling of boundary conditions.
     */
    it('should correctly handle files that are exact multiples of chunk size', () => {
        const chunkMultiplierArbitrary = fc.integer({ min: 3, max: 10 });

        fc.assert(
            fc.property(
                chunkMultiplierArbitrary,
                fc.string({ minLength: 1, maxLength: 50 }),
                (multiplier, fileName) => {
                    const fileSize = CHUNK_SIZE * multiplier;
                    const fileContent = new Uint8Array(fileSize);
                    const file = new File([fileContent], fileName, { type: 'application/octet-stream' });

                    const chunks = chunkProcessor.createChunks(file);

                    // Should have exactly 'multiplier' chunks
                    expect(chunks.length).toBe(multiplier);

                    // All chunks should be exactly CHUNK_SIZE
                    chunks.forEach(chunk => {
                        expect(chunk.size).toBe(CHUNK_SIZE);
                    });

                    // Total size should equal original file size
                    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
                    expect(totalSize).toBe(fileSize);
                }
            ),
            { numRuns: 15 }
        );
    });

    /**
     * Property Test: Chunk Data Integrity
     * 
     * Verify that chunks maintain correct size and position information
     * for proper reassembly.
     */
    it('should create chunks with correct position and size for reassembly', () => {
        const fileSizeArbitrary = fc.integer({
            min: CHUNK_THRESHOLD + 1,
            max: 20 * 1024 * 1024 // 20MB
        });

        fc.assert(
            fc.property(
                fileSizeArbitrary,
                (fileSize) => {
                    // Create a file
                    const fileContent = new Uint8Array(fileSize);
                    const file = new File([fileContent], 'test.bin', { type: 'application/octet-stream' });

                    // Create chunks
                    const chunks = chunkProcessor.createChunks(file);

                    // Verify chunks can be reassembled by checking positions
                    let expectedOffset = 0;
                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];

                        // Verify chunk index matches position
                        expect(chunk.index).toBe(i);

                        // Verify chunk size is correct for its position
                        const expectedSize = Math.min(CHUNK_SIZE, fileSize - expectedOffset);
                        expect(chunk.size).toBe(expectedSize);

                        // Verify chunk data size matches reported size
                        expect(chunk.data.size).toBe(chunk.size);

                        expectedOffset += chunk.size;
                    }

                    // Verify all bytes are accounted for
                    expect(expectedOffset).toBe(fileSize);
                }
            ),
            { numRuns: 15 }
        );
    });

    /**
     * Unit Test: Chunk threshold getter
     */
    it('should return correct chunk threshold', () => {
        expect(chunkProcessor.getChunkThreshold()).toBe(CHUNK_THRESHOLD);
    });

    /**
     * Unit Test: Chunk size getter
     */
    it('should return correct chunk size', () => {
        expect(chunkProcessor.getChunkSize()).toBe(CHUNK_SIZE);
    });

    /**
     * Unit Test: Edge case - file exactly at threshold
     */
    it('should not chunk file exactly at threshold size', () => {
        const fileContent = new Uint8Array(CHUNK_THRESHOLD);
        const file = new File([fileContent], 'threshold.bin', { type: 'application/octet-stream' });

        expect(chunkProcessor.shouldChunk(file)).toBe(false);
    });

    /**
     * Unit Test: Edge case - file one byte over threshold
     */
    it('should chunk file one byte over threshold', () => {
        const fileContent = new Uint8Array(CHUNK_THRESHOLD + 1);
        const file = new File([fileContent], 'over-threshold.bin', { type: 'application/octet-stream' });

        expect(chunkProcessor.shouldChunk(file)).toBe(true);

        const chunks = chunkProcessor.createChunks(file);
        expect(chunks.length).toBe(3); // 2MB + 2MB + 1MB + 1 byte
    });
});
