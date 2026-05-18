import { POS, HIDDEN, SIZE, VELOCITY } from '../storage/components.js';

export class Occlusion {
    constructor(engine) {
        this.engine = engine;
        this.staticView = engine.view([POS, SIZE, HIDDEN, VELOCITY]);
        this.moverView = engine.view([POS, SIZE, VELOCITY]);
    }

    update() {
        this.staticView.fetch((count, columns) => {
            const hidden = columns[2];
            for (let i = 0; i < count; i++) {
                hidden[i] = 0;
            }
        });

        this.moverView.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], vel = columns[2];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) {
                    const bx = pos[i * 2];
                    const by = pos[i * 2 + 1];
                    const bw = size[i * 2];
                    const bh = size[i * 2 + 1];

                    this.staticView.fetch((sCount, sColumns) => {
                        const sPos = sColumns[0], sSize = sColumns[1], sHidden = sColumns[2], sVel = sColumns[3];

                        for (let j = 0; j < sCount; j++) {
                            if (sVel[j * 2] !== 0 || sVel[j * 2 + 1] !== 0) continue;

                            const gx = sPos[j * 2];
                            const gy = sPos[j * 2 + 1];
                            const gw = sSize[j * 2];
                            const gh = sSize[j * 2 + 1];

                            if (bx < gx + gw && bx + bw > gx && by < gy + gh && by + bh > gy) {
                                sHidden[j] = 1;
                            }
                        }
                    });
                }
            }
        });
    }
}
