/**
 * ARCHETYPE ECS: BROWSER-OPTIMIZED BUILD (RDBMS MAPPED)
 * * DEPLOYMENT: GitHub Pages client-side execution.
 * * ARCHITECTURAL GUIDELINES & CONSTRAINTS:
 * * RDBMS Nomenclature: Uses database terminology (Table, Page, commit, alter).
 * * Single-Threaded: Bypasses SharedArrayBuffer for GitHub Pages environment.
 * * Zero-GC Engine: Hot paths rigidly avoid object/array allocations to prevent stutter.
 * * 32-Column Limit: Schema is strictly capped at 32 components for bitwise performance.
 */

export class Schema {
    constructor() {
        this.definitions = [];
        this.nextId = 0;
    }

    defineColumn(size, ArrayType = Float32Array) {
        if (this.nextId > 31) throw new Error("Max 32 columns supported."); // Bitwise limit.
        const id = this.nextId++;
        const flag = 1 << id;
        this.definitions.push({ id, flag, size, ArrayType });
        return flag;
    }
}
