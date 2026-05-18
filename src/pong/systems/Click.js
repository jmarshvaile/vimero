import { POS, ACTIVE, POINTER } from '../storage/components.js';

export class Click {
    constructor(engine, canvas) {
        this.engine = engine;

        // Create the singleton pointer entity
        const id = engine.insert();
        engine.alter(id, POS | ACTIVE | POINTER, 0);
        engine.commit();

        this.view = engine.view([POS, ACTIVE, POINTER]);

        const updatePointer = (x, y, isActive) => {
            this.view.fetch((count, columns) => {
                const pos = columns[0], active = columns[1];
                for (let i = 0; i < count; i++) {
                    pos[i * 2] = x;
                    pos[i * 2 + 1] = y;
                    active[i] = isActive ? 1 : 0;
                }
            });
        };

        const handleStart = (x, y) => {
            updatePointer(x, y, true);
        };

        const handleMove = (x, y) => {
            this.view.fetch((count, columns) => {
                const active = columns[1];
                for (let i = 0; i < count; i++) {
                    if (active[i] === 1) {
                        updatePointer(x, y, true);
                    }
                }
            });
        };

        const handleEnd = () => {
            this.view.fetch((count, columns) => {
                const active = columns[1];
                for (let i = 0; i < count; i++) {
                    active[i] = 0;
                }
            });
        };

        // Mouse events
        canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
        canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleEnd);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault(); // Prevent scrolling while dragging
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);
    }
}
