import { POS, BG_COLOR, FG_COLOR, GLYPH, LIFETIME, DELAY, POINTER_LOCK, SIZE, IS_MOVER } from '../storage/components.js';

export class ProximityStateSystem {
    constructor(engine, inputSystem) {
        this.engine = engine;
        this.input = inputSystem;
        this.view = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, LIFETIME, DELAY, POINTER_LOCK, SIZE], [IS_MOVER]);
    }

    triggerCircle(ox, oy, sourceWidth, sourceHeight) {
        const centerX = ox + (sourceWidth / 2);
        const centerY = oy + (sourceHeight / 2);
        const radius = Math.max(sourceWidth, sourceHeight) * 4;

        this.view.fetch((count, columns) => {
            const pos = columns[0], dly = columns[5], lck = columns[6], size = columns[7];

            for (let i = 0; i < count; i++) {
                if (lck[i] === 1) continue;
                const width = size[i * 2];
                const height = size[i * 2 + 1];
                const dx = (pos[i * 2] + width / 2) - centerX;
                const dy = (pos[i * 2 + 1] + height / 2) - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const threshold = Math.max(width, height) / 2;
                if (dist < radius) {
                    dly[i] = dist < threshold ? 1 : 4 + Math.floor(dist / 4);
                    lck[i] = 1;
                }
            }
        });
    }

    _handleInput(x, y, width, height, lckArray, dlyArray, i) {
        const isOver = this.input.mouseX >= x && this.input.mouseX < x + width &&
                       this.input.mouseY >= y && this.input.mouseY < y + height;

        if (!isOver && lckArray[i] === 1 && dlyArray[i] === 0) lckArray[i] = 0;
        if (isOver && lckArray[i] === 0) this.triggerCircle(x, y, width, height);
    }

    _updateDelayPropagation(bg, fg, gly, lft, dly, i, idx) {
        if (dly[i] > 0) {
            dly[i]--;
            if (dly[i] === 0) {
                fg[idx] = 255; fg[idx + 1] = 255; fg[idx + 2] = 0;
                bg[idx] = 80; bg[idx + 1] = 0; bg[idx + 2] = 120;
                gly[i] = 33 + Math.floor(Math.random() * 93);
                lft[i] = 60; // Set solid for 60 ticks (approx 1 second)
            }
        }
    }

    update() {
        // Trigger rare random state changes (e.g., 1% chance per update)
        if (Math.random() > 0.99) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const rx = Math.floor(Math.random() * screenWidth);
            const ry = Math.floor(Math.random() * screenHeight);
            this.triggerCircle(rx, ry, 20, 20); // Using 20 as an approximate size
        }

        this.view.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3],
                  lft = columns[4], dly = columns[5], lck = columns[6], size = columns[7];

            for (let i = 0; i < count; i++) {
                const idx = i * 4;
                const x = pos[i * 2], y = pos[i * 2 + 1];
                const width = size[i * 2], height = size[i * 2 + 1];

                this._handleInput(x, y, width, height, lck, dly, i);
                this._updateDelayPropagation(bg, fg, gly, lft, dly, i, idx);
            }
        });
    }
}
