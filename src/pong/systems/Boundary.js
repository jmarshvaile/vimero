import { POS, SIZE, ACTIVE } from '../storage/components.js';

export class Boundary {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, SIZE, ACTIVE]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], active = columns[2];

            for (let i = 0; i < count; i++) {
                if (active[i] === 0) continue;

                const y = pos[i * 2 + 1];
                const h = size[i * 2 + 1];

                // Specific behavior for Y despawn
                if (y < 0 || y + h > this.canvas.logicalHeight) {
                    pos[i * 2] = -1000;
                    pos[i * 2 + 1] = -1000;
                }
            }
        });
    }
}
