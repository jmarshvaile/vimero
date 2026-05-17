import { ACTIVE, TIMER } from '../storage/components.js';

export class TimerStateSystem {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([ACTIVE, TIMER]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const active = columns[0], timer = columns[1];

            for (let i = 0; i < count; i++) {
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
