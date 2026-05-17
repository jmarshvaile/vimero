import { POS, ACTIVE, VELOCITY, DRAG_OFFSET, SIZE } from '../storage/components.js';

export class AdjacencySystem {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([POS, ACTIVE, VELOCITY, DRAG_OFFSET, SIZE]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], active = columns[1], vel = columns[2], dragOffset = columns[3], size = columns[4];

            // First, reset drag offsets for all non-moving cells
            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    dragOffset[i] = 0;
                }
            }

            // Now, find active, non-moving cells and group them by rows (Y coordinate)
            // We'll iterate through and collect ranges of active cells in the same row
            // We assume cells are generally sorted or we can just do a naive N^2 check or rely on grid logic
            // Since this is a simple grid and entities are in order, we can just process them

            // To be robust and O(N), let's store the state of rows and then evaluate continuous segments
            // But actually, since cells are spawned row by row, we can just look at them linearly
            // Wait, we need to know the segments.
            // Let's do a more robust approach. We can extract all active static cells into an array, sort by Y then X, and then find contiguous blocks.
            // Wait, allocating arrays breaks Zero-GC.
            // Let's rely on the fact that entities are ordered by grid position (from fillScreen)
            // The cells are inserted in order: top-left to bottom-right, row by row.

            let segmentStart = -1;
            let currentY = -1;
            let segmentLength = 0;
            let lastX = -1;
            let cellSize = 0;

            const processSegment = (startIdx, length) => {
                if (length <= 1) return;
                const mid = length / 2;
                for (let k = 0; k < length; k++) {
                    const entityIndex = startIdx + k;
                    if (k < mid - 0.5) {
                        dragOffset[entityIndex] = -1;
                    } else if (k > mid - 0.5) {
                        dragOffset[entityIndex] = 1;
                    } else {
                        dragOffset[entityIndex] = 0;
                    }
                }
            };

            for (let i = 0; i < count; i++) {
                // Is this a static active cell?
                if (active[i] === 1 && vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    const x = pos[i * 2];
                    const y = pos[i * 2 + 1];
                    const w = size[i * 2];

                    if (segmentStart === -1) {
                        // Start a new segment
                        segmentStart = i;
                        currentY = y;
                        lastX = x;
                        segmentLength = 1;
                        cellSize = w;
                    } else {
                        // Is it contiguous horizontally?
                        // Due to ordering, it should be the next entity, and x should be lastX + w
                        if (y === currentY && x === lastX + w) {
                            segmentLength++;
                            lastX = x;
                        } else {
                            // End previous segment
                            processSegment(segmentStart, segmentLength);
                            // Start new segment
                            segmentStart = i;
                            currentY = y;
                            lastX = x;
                            segmentLength = 1;
                            cellSize = w;
                        }
                    }
                } else {
                    // Not active or moving, so it breaks the segment
                    if (segmentStart !== -1) {
                        processSegment(segmentStart, segmentLength);
                        segmentStart = -1;
                    }
                }
            }

            // Process any remaining segment at the end
            if (segmentStart !== -1) {
                processSegment(segmentStart, segmentLength);
            }
        });
    }
}
