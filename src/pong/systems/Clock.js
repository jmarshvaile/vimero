import { ACTIVE, TIMER, VELOCITY } from '../storage/components.js';

export class Clock {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([ACTIVE, TIMER, VELOCITY]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const active = columns[0], timer = columns[1], vel = columns[2];

            for (let i = 0; i < count; i++) {
                // Skip moving cells to retain active state indefinitely
                if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) continue;

                if (timer[i] > 0) {
                    timer[i]--;
                    if (timer[i] === 0) {
                        active[i] = 0;
                    }
                }
            }
        });
    }
}
