/**
 * ARCHETYPE ECS: BROWSER-OPTIMIZED BUILD (RDBMS MAPPED)
 * * DEPLOYMENT: GitHub Pages client-side execution.
 * * ARCHITECTURAL GUIDELINES & CONSTRAINTS:
 * * RDBMS Nomenclature: Uses database terminology (Table, Page, commit, alter).
 * * Single-Threaded: Bypasses SharedArrayBuffer for GitHub Pages environment.
 * * Zero-GC Engine: Hot paths rigidly avoid object/array allocations to prevent stutter.
 * * 32-Column Limit: Schema is strictly capped at 32 components for bitwise performance.
 */

import { Page, PAGE_SIZE } from './Page.js';

export class Table {
    constructor(columns, mask) {
        this.columns = columns;
        this.mask = mask; // Identity bitmask.
        this.pages = [];
        this.count = 0;
        this.columnIndex = new Int32Array(32).fill(-1); // Secondary index for O(1) offsets.

        let rowStride = 0;
        for (let i = 0; i < columns.length; i++) {
            this.columnIndex[columns[i].id] = i;
            rowStride += columns[i].size * columns[i].ArrayType.BYTES_PER_ELEMENT;
        }
        this.pageCapacity = rowStride > 0 ? Math.floor(PAGE_SIZE / rowStride) : 10000;
    }

    insert(id) {
        const row = this.count++;
        const pageIdx = Math.floor(row / this.pageCapacity);
        const localRow = row % this.pageCapacity;

        if (pageIdx === this.pages.length) {
            this.pages.push(new Page(this.columns, this.pageCapacity));
        }

        const page = this.pages[pageIdx];
        page.ids[localRow] = id;
        return { row, page, localRow };
    }

    delete(row) {
        const lastRow = --this.count;
        const lastPageIdx = Math.floor(lastRow / this.pageCapacity);
        const lastPage = this.pages[lastPageIdx];
        const lastLocalRow = lastRow % this.pageCapacity;

        const targetPageIdx = Math.floor(row / this.pageCapacity);
        const targetPage = this.pages[targetPageIdx];
        const targetLocalRow = row % this.pageCapacity;

        let movedId = null;

        if (row !== lastRow) {
            movedId = lastPage.ids[lastLocalRow];
            targetPage.ids[targetLocalRow] = movedId;

            // O(1) Swap-and-Pop via native memcpy.
            for (let i = 0; i < this.columns.length; i++) {
                const arrTarget = targetPage.columns[i];
                const arrSource = lastPage.columns[i];
                const stride = this.columns[i].size;
                const sourceOffset = lastLocalRow * stride;
                const targetOffset = targetLocalRow * stride;
                arrTarget.set(arrSource.subarray(sourceOffset, sourceOffset + stride), targetOffset);
            }
        }

        if (lastLocalRow === 0 && this.pages.length > 1) {
            this.pages.pop(); // Evict empty pages.
        }
        return { movedId, targetPage, lastPage };
    }
}
