/**
 * ARCHETYPE ECS: BROWSER-OPTIMIZED BUILD (RDBMS MAPPED)
 * * DEPLOYMENT: GitHub Pages client-side execution.
 * * ARCHITECTURAL GUIDELINES & CONSTRAINTS:
 * * RDBMS Nomenclature: Uses database terminology (Table, Page, commit, alter).
 * * Single-Threaded: Bypasses SharedArrayBuffer for GitHub Pages environment.
 * * Zero-GC Engine: Hot paths rigidly avoid object/array allocations to prevent stutter.
 * * 32-Column Limit: Schema is strictly capped at 32 components for bitwise performance.
 */

import { Table } from '../storage/Table.js';
import { View } from '../query/View.js';

export class Engine {
    constructor(schema, maxRecords = 1000000) {
        this.schema = schema;
        this.currentTick = 1;
        this.maxRecords = maxRecords;

        this.masks = new Int32Array(maxRecords).fill(0); // ID to bitmask mapping.
        this.offsets = new Uint32Array(maxRecords); // ID to Local Row mapping.
        this.epochs = new Uint32Array(maxRecords); // Recycled ID safety.

        this.nextFreeId = 0;
        for (let i = 0; i < maxRecords - 1; i++) this.offsets[i] = i + 1;
        this.offsets[maxRecords - 1] = maxRecords;

        this.tables = new Map();
        this.views = [];
        this.journal = new Uint32Array(maxRecords); // Write-ahead log for mutations.
        this.mutationCount = 0;
        this.targetMasks = new Int32Array(maxRecords).fill(0);
        this.isMutating = new Uint8Array(maxRecords).fill(0); // 0 = none, 1 = mutated, 2 = deleted
    }

    insert() {
        if (this.nextFreeId === this.maxRecords) throw new Error("Capacity exhausted.");
        const id = this.nextFreeId;
        this.nextFreeId = this.offsets[id]; // Advance freelist.

        this.epochs[id]++;
        this.masks[id] = 0;
        return id;
    }

    isValid(id, epoch) {
        return this.epochs[id] === epoch;
    }

    delete(id) {
        if (this.isMutating[id] !== 2) {
            if (this.isMutating[id] === 0) this.journal[this.mutationCount++] = id;
            this.isMutating[id] = 2; // Flag for terminal drop.
        }
    }

    alter(id, addedMask, removedMask) {
        if (this.isMutating[id] === 2) return;
        if (this.isMutating[id] === 0) {
            this.targetMasks[id] = this.masks[id];
            this.isMutating[id] = 1;
            this.journal[this.mutationCount++] = id;
        }
        this.targetMasks[id] = (this.targetMasks[id] | addedMask) & ~removedMask;
    }

    table(mask) {
        let table = this.tables.get(mask);
        if (!table) {
            const columns = this.schema.definitions.filter(def => (mask & def.flag) === def.flag);
            table = new Table(columns, mask);
            this.tables.set(mask, table);
            for (let i = 0; i < this.views.length; i++) this.views[i].evaluate(table);
        }
        return table;
    }

    view(include, exclude = []) {
        const view = new View(include, exclude, this);
        this.views.push(view);
        return view;
    }

    commit() {
        this.currentTick++;
        for (let i = 0; i < this.mutationCount; i++) {
            const id = this.journal[i];

            if (this.isMutating[id] === 2) {
                this.migrate(id, 0);
                this.offsets[id] = this.nextFreeId;
                this.nextFreeId = id;
            } else {
                const targetMask = this.targetMasks[id];
                const currentMask = this.masks[id];
                if (currentMask !== targetMask) {
                    this.migrate(id, targetMask);
                }
            }
            this.isMutating[id] = 0;
            this.targetMasks[id] = 0;
        }
        this.mutationCount = 0;
    }

    migrate(id, targetMask) {
        const sourceMask = this.masks[id];
        const sourceTable = sourceMask !== 0 ? this.tables.get(sourceMask) : null;
        const sourceRow = this.offsets[id];

        if (targetMask === 0) {
            if (sourceTable) {
                const { movedId, targetPage, lastPage } = sourceTable.delete(sourceRow);
                if (movedId !== null) this.offsets[movedId] = sourceRow;
                targetPage.changedTick = this.currentTick;
                if (lastPage) lastPage.changedTick = this.currentTick;
            }
            this.masks[id] = 0;
            return;
        }

        const targetTable = this.table(targetMask);
        const dest = targetTable.insert(id);
        dest.page.changedTick = this.currentTick;

        if (sourceTable) {
            const sourcePage = sourceTable.pages[Math.floor(sourceRow / sourceTable.pageCapacity)];
            const sourceLocalRow = sourceRow % sourceTable.pageCapacity;

            for (let i = 0; i < targetTable.columns.length; i++) {
                const colDef = targetTable.columns[i];
                const sourceColIdx = sourceTable.columnIndex[colDef.id];

                if (sourceColIdx !== -1) {
                    const targetArr = dest.page.columns[i];
                    const sourceArr = sourcePage.columns[sourceColIdx];
                    const stride = colDef.size;
                    const sourceOffset = sourceLocalRow * stride;
                    const targetOffset = dest.localRow * stride;
                    targetArr.set(sourceArr.subarray(sourceOffset, sourceOffset + stride), targetOffset);
                }
            }

            const { movedId, targetPage, lastPage } = sourceTable.delete(sourceRow);
            if (movedId !== null) this.offsets[movedId] = sourceRow;
            targetPage.changedTick = this.currentTick;
            if (lastPage) lastPage.changedTick = this.currentTick;
        }

        this.masks[id] = targetMask;
        this.offsets[id] = dest.row;
    }
}
