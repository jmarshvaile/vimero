/**
 * ARCHETYPE ECS: BROWSER-OPTIMIZED BUILD (RDBMS MAPPED)
 * * DEPLOYMENT: GitHub Pages client-side execution.
 * * ARCHITECTURAL GUIDELINES & CONSTRAINTS:
 * * RDBMS Nomenclature: Uses database terminology (Table, Page, commit, alter).
 * * Single-Threaded: Bypasses SharedArrayBuffer for GitHub Pages environment.
 * * Zero-GC Engine: Hot paths rigidly avoid object/array allocations to prevent stutter.
 * * 32-Column Limit: Schema is strictly capped at 32 components for bitwise performance.
 */

export const PAGE_SIZE = 16384; // 16KB aligns with hardware cache lines.

export class Page {
    constructor(columns, capacity) {
        this.buffer = new ArrayBuffer(PAGE_SIZE);
        this.capacity = capacity;
        this.changedTick = 0;
        this.columns = [];

        // Ensure perfect memory locality: 'ids' directly mapped into the beginning of the page buffer.
        this.ids = new Uint32Array(this.buffer, 0, capacity);

        let offset = capacity * Uint32Array.BYTES_PER_ELEMENT; // Start offset after the IDs block.

        for (let i = 0; i < columns.length; i++) {
            const def = columns[i];

            // Optional: Padding for strict TypedArray alignment based on BYTES_PER_ELEMENT.
            // This is critical if mixing Float64 or standard arrays.
            const padding = offset % def.ArrayType.BYTES_PER_ELEMENT;
            if (padding !== 0) {
                offset += (def.ArrayType.BYTES_PER_ELEMENT - padding);
            }

            const byteSize = def.size * def.ArrayType.BYTES_PER_ELEMENT;

            // Pure SoA layout for CPU SIMD vectorization.
            this.columns.push(new def.ArrayType(this.buffer, offset, capacity * def.size));
            offset += byteSize * capacity;
        }
    }
}
