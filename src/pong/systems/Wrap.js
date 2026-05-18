import { POS, VELOCITY, SIZE, LIFETIME, ACTIVE } from '../storage/components.js';

export class Wrap {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.moverView = engine.view([POS, VELOCITY, SIZE]);
        this.gridView = engine.view([POS, VELOCITY, SIZE, LIFETIME, ACTIVE]);
    }

    update(cellWidth, cellHeight) {
        this.moverView.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], size = columns[2];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) continue;

                if (pos[i * 2 + 1] < 0 || pos[i * 2 + 1] + size[i * 2 + 1] > this.canvas.logicalHeight) {
                    const cols = Math.floor(this.canvas.logicalWidth / cellWidth);
                    const spawnCol = Math.floor(Math.random() * cols);

                    pos[i * 2] = spawnCol * cellWidth;
                    pos[i * 2 + 1] = 0;
                    vel[i * 2] = 0;
                    vel[i * 2 + 1] = cellHeight;

                    const bx = pos[i * 2];
                    const by = pos[i * 2 + 1];
                    const bw = size[i * 2];
                    const bh = size[i * 2 + 1];

                    this.gridView.fetch((gCount, gColumns) => {
                        const gPos = gColumns[0], gVel = gColumns[1], gSize = gColumns[2], gLifetime = gColumns[3], gActive = gColumns[4];
                        for(let j = 0; j < gCount; j++) {
                            if (gVel[j * 2] !== 0 || gVel[j * 2 + 1] !== 0) continue;

                            const gx = gPos[j * 2];
                            const gy = gPos[j * 2 + 1];
                            const gw = gSize[j * 2];
                            const gh = gSize[j * 2 + 1];

                            if (bx < gx + gw && bx + bw > gx && by < gy + gh && by + bh > gy) {
                                gActive[j] = 1;
                                gLifetime[j] = 15;
                            }
                        }
                    });
                }
            }
        });
    }
}
