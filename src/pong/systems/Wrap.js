import { POS, VELOCITY, SIZE } from '../storage/components.js';

export class Wrap {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.moverView = engine.view([POS, VELOCITY, SIZE]);
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
                }
            }
        });
    }
}
