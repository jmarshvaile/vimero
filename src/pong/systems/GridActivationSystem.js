import { POS, SIZE, ACTIVE, TIMER, IS_GRID, DRAG_OFFSET } from '../storage/components.js';

export class GridActivationSystem {
    constructor(engine, clickInputSystem) {
        this.engine = engine;
        this.clickInputSystem = clickInputSystem;
        this.view = engine.view([POS, SIZE, ACTIVE, TIMER, IS_GRID, DRAG_OFFSET]);
    }

    update() {
        const events = this.clickInputSystem.consume();
        if (!events || events.length === 0) return;

        this.view.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], active = columns[2], timer = columns[3], dragOffset = columns[5];

            for (let i = 0; i < count; i++) {
                const x = pos[i * 2];
                const y = pos[i * 2 + 1];
                const w = size[i * 2];
                const h = size[i * 2 + 1];

                for (const event of events) {
                    if (event.x >= x && event.x < x + w && event.y >= y && event.y < y + h) {
                        if (active[i] === 0) {
                            const startCellX = Math.floor(event.startX / w) * w;
                            if (x < startCellX) {
                                dragOffset[i] = -1;
                            } else if (x > startCellX) {
                                dragOffset[i] = 1;
                            } else {
                                dragOffset[i] = 0;
                            }
                        }
                        active[i] = 1;
                        timer[i] = 120; // 2 seconds at 60 fps
                    }
                }
            }
        });
    }
}
