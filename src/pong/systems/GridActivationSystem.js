import { POS, SIZE, ACTIVE, TIMER, IS_GRID } from '../storage/components.js';

export class GridActivationSystem {
    constructor(engine, clickInputSystem) {
        this.engine = engine;
        this.clickInputSystem = clickInputSystem;
        this.view = engine.view([POS, SIZE, ACTIVE, TIMER, IS_GRID]);
    }

    update() {
        const click = this.clickInputSystem.consume();
        if (!click) return;

        this.view.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], active = columns[2], timer = columns[3];

            for (let i = 0; i < count; i++) {
                const x = pos[i * 2];
                const y = pos[i * 2 + 1];
                const w = size[i * 2];
                const h = size[i * 2 + 1];

                if (click.x >= x && click.x < x + w && click.y >= y && click.y < y + h) {
                    active[i] = 1;
                    timer[i] = 120; // 2 seconds at 60 fps
                }
            }
        });
    }
}
