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
        this.ids = new Uint32Array(capacity); // Tracks record IDs per page.

        let offset = 0;
        for (let i = 0; i < columns.length; i++) {
            const def = columns[i];
            const byteSize = def.size * def.ArrayType.BYTES_PER_ELEMENT;
            // Pure SoA layout for CPU SIMD vectorization.
            this.columns.push(new def.ArrayType(this.buffer, offset, capacity * def.size));
            offset += byteSize * capacity;
        }
    }
}
