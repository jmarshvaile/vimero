import { POS, SIZE, ACTIVE, TIMER, VELOCITY, POINTER } from '../storage/components.js';

export class Activate {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([POS, SIZE, ACTIVE, TIMER, VELOCITY], [POINTER]);
        this.pointerView = engine.view([POS, ACTIVE, POINTER]);
    }

    update() {
        let pointerX = -1;
        let pointerY = -1;
        let pointerActive = 0;

        this.pointerView.fetch((count, columns) => {
            const pos = columns[0], active = columns[1];
            for (let i = 0; i < count; i++) {
                pointerX = pos[i * 2];
                pointerY = pos[i * 2 + 1];
                pointerActive = active[i];
            }
        });

        if (pointerActive === 0) return;

        this.view.fetch((count, columns) => {
            const pos = columns[0], size = columns[1], active = columns[2], timer = columns[3], vel = columns[4];

            for (let i = 0; i < count; i++) {
                // Skip cells that are moving
                if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) continue;

                const x = pos[i * 2];
                const y = pos[i * 2 + 1];
                const w = size[i * 2];
                const h = size[i * 2 + 1];

                if (pointerX >= x && pointerX < x + w && pointerY >= y && pointerY < y + h) {
                    active[i] = 1;
                    timer[i] = 120; // 2 seconds at 60 fps
                }
            }
        });
    }
}
