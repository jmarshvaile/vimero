import { POS, HIDDEN, SIZE, VELOCITY } from '../storage/components.js';

export class OccupancySystem {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([POS, SIZE, HIDDEN, VELOCITY]);
    }

    update() {
        // Reset all cells to not hidden initially
        this.view.fetch((count, columns) => {
            const hidden = columns[2];
            for (let i = 0; i < count; i++) {
                hidden[i] = 0;
            }
        });

        // Hide static cells that are currently occupied by moving cells
        this.view.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], hidden = columns[2], vel = columns[3];

            for (let i = 0; i < count; i++) {
                // If it's a moving cell
                if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) {
                    const bx = pos[i * 2];
                    const by = pos[i * 2 + 1];
                    const bw = size[i * 2];
                    const bh = size[i * 2 + 1];

                    // Check against static cells
                    for (let j = 0; j < count; j++) {
                        if (i === j) continue;

                        // We only hide static cells
                        if (vel[j * 2] !== 0 || vel[j * 2 + 1] !== 0) continue;

                        const gx = pos[j * 2];
                        const gy = pos[j * 2 + 1];
                        const gw = size[j * 2];
                        const gh = size[j * 2 + 1];

                        // Simple overlapping bounding box check
                        if (bx < gx + gw && bx + bw > gx && by < gy + gh && by + bh > gy) {
                            hidden[j] = 1;
                        }
                    }
                }
            }
        });
    }
}
