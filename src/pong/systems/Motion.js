import { POS, VELOCITY, CAN_MOVE } from '../storage/components.js';

export class Motion {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([POS, VELOCITY, CAN_MOVE]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], canMove = columns[2];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) continue;

                if (canMove[i] === 1) {
                    pos[i * 2] += vel[i * 2];
                    pos[i * 2 + 1] += vel[i * 2 + 1];
                    canMove[i] = 0;
                }
            }
        });
    }
}
