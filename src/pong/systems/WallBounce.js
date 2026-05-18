import { POS, VELOCITY, SIZE } from '../storage/components.js';

export class WallBounce {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, VELOCITY, SIZE]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], size = columns[2];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) continue;

                if (pos[i * 2] < 0 || pos[i * 2] + size[i * 2] > this.canvas.logicalWidth) {
                    pos[i * 2] -= vel[i * 2];
                    vel[i * 2] *= -1;
                }
            }
        });
    }
}
