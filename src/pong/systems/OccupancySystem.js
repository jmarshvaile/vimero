import { POS, HIDDEN, IS_BALL, SIZE } from '../storage/components.js';

export class OccupancySystem {
    constructor(engine) {
        this.engine = engine;
        this.ballView = engine.view([POS, SIZE, IS_BALL]);
        this.gridView = engine.view([POS, SIZE, HIDDEN], [IS_BALL]);
    }

    update() {
        // Reset all grid cells to not hidden
        this.gridView.fetch((count, columns) => {
            const hidden = columns[2];
            for (let i = 0; i < count; i++) {
                hidden[i] = 0;
            }
        });

        // Hide grid cells that are currently occupied by a ball
        this.ballView.fetch((bCount, bColumns) => {
            const bPos = bColumns[0], bSize = bColumns[1], bIsBall = bColumns[2];

            for (let i = 0; i < bCount; i++) {
                if (bIsBall[i] === 0) continue;

                const bx = bPos[i * 2];
                const by = bPos[i * 2 + 1];
                const bw = bSize[i * 2];
                const bh = bSize[i * 2 + 1];

                this.gridView.fetch((gCount, gColumns) => {
                    const gPos = gColumns[0], gSize = gColumns[1], gHidden = gColumns[2];

                    for (let j = 0; j < gCount; j++) {
                        const gx = gPos[j * 2];
                        const gy = gPos[j * 2 + 1];
                        const gw = gSize[j * 2];
                        const gh = gSize[j * 2 + 1];

                        // Simple overlapping bounding box check
                        if (bx < gx + gw && bx + bw > gx && by < gy + gh && by + bh > gy) {
                            gHidden[j] = 1;
                        }
                    }
                });
            }
        });
    }
}
