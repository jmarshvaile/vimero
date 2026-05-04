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

const MAX_RECORDS = 1000000;

export class Engine {
    constructor(schema) {
        this.schema = schema;
        this.currentTick = 1;

        this.registry = new Array(MAX_RECORDS).fill(null); // ID to Table mapping.
        this.offsets = new Uint32Array(MAX_RECORDS); // ID to Local Row mapping.
        this.epochs = new Uint32Array(MAX_RECORDS); // Recycled ID safety.

        this.nextFreeId = 0;
        for (let i = 0; i < MAX_RECORDS - 1; i++) this.offsets[i] = i + 1;
        this.offsets[MAX_RECORDS - 1] = MAX_RECORDS;

        this.tables = new Map();
        this.views = [];
        this.journal = new Uint32Array(MAX_RECORDS); // Write-ahead log for mutations.
        this.mutationCount = 0;
        this.targetMasks = new Int32Array(MAX_RECORDS).fill(0);
    }

    insert() {
        if (this.nextFreeId === MAX_RECORDS) throw new Error("Capacity exhausted.");
        const id = this.nextFreeId;
        this.nextFreeId = this.offsets[id]; // Advance freelist.

        this.epochs[id]++;
        this.registry[id] = null;
        return id;
    }

    isValid(id, epoch) {
        return this.epochs[id] === epoch;
    }

    delete(id) {
        if (this.targetMasks[id] !== -1) {
            if (this.targetMasks[id] === 0) this.journal[this.mutationCount++] = id;
            this.targetMasks[id] = -1; // Flag for terminal drop.
        }
    }

    alter(id, addedMask, removedMask) {
        if (this.targetMasks[id] === -1) return;
        if (this.targetMasks[id] === 0) {
            const currentTable = this.registry[id];
            this.targetMasks[id] = currentTable ? currentTable.mask : 0;
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
            const targetMask = this.targetMasks[id];
            const currentMask = this.registry[id] ? this.registry[id].mask : 0;

            if (targetMask === -1) {
                this.migrate(id, 0);
                this.offsets[id] = this.nextFreeId;
                this.nextFreeId = id;
            } else if (currentMask !== targetMask) {
                this.migrate(id, targetMask);
            }
            this.targetMasks[id] = 0;
        }
        this.mutationCount = 0;
    }

    migrate(id, targetMask) {
        const sourceTable = this.registry[id];
        const sourceRow = this.offsets[id];

        if (targetMask === 0) {
            if (sourceTable) {
                const { movedId, targetPage, lastPage } = sourceTable.delete(sourceRow);
                if (movedId !== null) this.offsets[movedId] = sourceRow;
                targetPage.changedTick = this.currentTick;
                if (lastPage) lastPage.changedTick = this.currentTick;
            }
            this.registry[id] = null;
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

        this.registry[id] = targetTable;
        this.offsets[id] = dest.row;
    }
}
