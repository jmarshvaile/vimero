import { ACTIVE, LIFETIME, VELOCITY } from '../storage/components.js';

export class Decay {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([ACTIVE, LIFETIME, VELOCITY]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const active = columns[0], lifetime = columns[1], vel = columns[2];

            for (let i = 0; i < count; i++) {
                // Skip moving cells to retain active state indefinitely
                if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) continue;

                if (lifetime[i] > 0) {
                    lifetime[i]--;
                    if (lifetime[i] === 0) {
                        active[i] = 0;
                    }
                }
            }
        });
    }
}
