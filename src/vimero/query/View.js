/**
 * ARCHETYPE ECS: BROWSER-OPTIMIZED BUILD (RDBMS MAPPED)
 * * DEPLOYMENT: GitHub Pages client-side execution.
 * * ARCHITECTURAL GUIDELINES & CONSTRAINTS:
 * * RDBMS Nomenclature: Uses database terminology (Table, Page, commit, alter).
 * * Single-Threaded: Bypasses SharedArrayBuffer for GitHub Pages environment.
 * * Zero-GC Engine: Hot paths rigidly avoid object/array allocations to prevent stutter.
 * * 32-Column Limit: Schema is strictly capped at 32 components for bitwise performance.
 */

export class View {
    constructor(includeFlags, excludeFlags, engine) {
        this.includeMask = 0;
        for (let i = 0; i < includeFlags.length; i++) this.includeMask |= includeFlags[i];

        this.excludeMask = 0;
        if (excludeFlags) {
            for (let i = 0; i < excludeFlags.length; i++) this.excludeMask |= excludeFlags[i];
        }

        this.engine = engine;
        this.matchedTables = [];
        for (const table of engine.tables.values()) this.evaluate(table);
    }

    evaluate(table) {
        if ((table.mask & this.includeMask) !== this.includeMask) return;
        if (this.excludeMask !== 0 && (table.mask & this.excludeMask) !== 0) return;
        if (!this.matchedTables.includes(table)) this.matchedTables.push(table);
    }

    fetch(processResultSet, systemTick = 0) {
        for (let t = 0; t < this.matchedTables.length; t++) {
            const table = this.matchedTables[t];
            let remaining = table.count;

            for (let p = 0; p < table.pages.length; p++) {
                const page = table.pages[p];
                const activeLength = remaining > table.pageCapacity ? table.pageCapacity : remaining;
                remaining -= activeLength;

                // Yields raw arrays directly for JIT vectorization.
                if (activeLength > 0 && page.changedTick > systemTick) {
                    processResultSet(activeLength, page.columns);
                }
            }
        }
    }
}
