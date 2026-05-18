import { POS, VELOCITY, SIZE, ACTIVE, DEFLECT } from '../storage/components.js';

export class GridBounce {
    constructor(engine) {
        this.engine = engine;
        this.moverView = engine.view([POS, VELOCITY, SIZE]);
        this.gridView = engine.view([POS, VELOCITY, SIZE, ACTIVE, DEFLECT]);
    }

    update() {
        this.moverView.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], size = columns[2];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) continue;

                const bx = pos[i * 2];
                const by = pos[i * 2 + 1];
                const bw = size[i * 2];
                const bh = size[i * 2 + 1];

                this.gridView.fetch((gCount, gColumns) => {
                    const gPos = gColumns[0], gVel = gColumns[1], gSize = gColumns[2], gActive = gColumns[3], gDefl = gColumns[4];

                    for (let j = 0; j < gCount; j++) {
                        if (gActive[j] === 0 || gVel[j * 2] !== 0 || gVel[j * 2 + 1] !== 0) continue;

                        const gx = gPos[j * 2];
                        const gy = gPos[j * 2 + 1];
                        const gw = gSize[j * 2];
                        const gh = gSize[j * 2 + 1];

                        if (bx < gx + gw && bx + bw > gx && by < gy + gh && by + bh > gy) {
                            pos[i * 2 + 1] -= vel[i * 2 + 1];
                            vel[i * 2 + 1] *= -1;

                            const hitDeflection = gDefl[j];
                            const speed = bw;

                            if (hitDeflection < 0) {
                                vel[i * 2] = Math.max(-speed, vel[i * 2] - speed);
                            } else if (hitDeflection > 0) {
                                vel[i * 2] = Math.min(speed, vel[i * 2] + speed);
                            } else {
                                vel[i * 2] = 0;
                            }

                            break;
                        }
                    }
                });
            }
        });
    }
}
