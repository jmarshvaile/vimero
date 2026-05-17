import { POS, SIZE, ACTIVE, TIMER, VELOCITY } from '../storage/components.js';

export class Activate {
    constructor(engine, clickInputSystem) {
        this.engine = engine;
        this.clickInputSystem = clickInputSystem;
        this.view = engine.view([POS, SIZE, ACTIVE, TIMER, VELOCITY]);
    }

    update() {
        const events = this.clickInputSystem.consume();
        if (!events || events.length === 0) return;

        this.view.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], active = columns[2], timer = columns[3], vel = columns[4];

            for (let i = 0; i < count; i++) {
                // Skip cells that are moving
                if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) continue;

                const x = pos[i * 2];
                const y = pos[i * 2 + 1];
                const w = size[i * 2];
                const h = size[i * 2 + 1];

                for (const event of events) {
                    if (event.x >= x && event.x < x + w && event.y >= y && event.y < y + h) {
                        active[i] = 1;
                        timer[i] = 120; // 2 seconds at 60 fps
                    }
                }
            }
        });
    }
}
