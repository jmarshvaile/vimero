import { POS, BG_COLOR, FG_COLOR, GLYPH, LIFETIME, RIPPLE_DELAY, MOUSE_LOCK, SIZE } from '../storage/components.js';

export class RippleSystem {
    constructor(engine, inputSystem) {
        this.engine = engine;
        this.input = inputSystem;
        this.view = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, LIFETIME, RIPPLE_DELAY, MOUSE_LOCK, SIZE]);
    }

    triggerCircle(ox, oy, sourceWidth, sourceHeight) {
        const centerX = ox + (sourceWidth / 2);
        const centerY = oy + (sourceHeight / 2);
        const radius = Math.max(sourceWidth, sourceHeight) * 4;

        this.view.fetch((count, columns) => {
            const pos = columns[0], rip = columns[5], lck = columns[6], size = columns[7];

            for (let i = 0; i < count; i++) {
                if (lck[i] === 1) continue;
                const width = size[i * 2];
                const height = size[i * 2 + 1];
                const dx = (pos[i * 2] + width / 2) - centerX;
                const dy = (pos[i * 2 + 1] + height / 2) - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const threshold = Math.max(width, height) / 2;
                if (dist < radius) {
                    rip[i] = dist < threshold ? 1 : 4 + Math.floor(dist / 4);
                    lck[i] = 1;
                }
            }
        });
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3],
                  lft = columns[4], rip = columns[5], lck = columns[6], size = columns[7];

            for (let i = 0; i < count; i++) {
                const idx = i * 4;
                const x = pos[i * 2], y = pos[i * 2 + 1];
                const width = size[i * 2], height = size[i * 2 + 1];

                const isOver = this.input.mouseX >= x && this.input.mouseX < x + width &&
                               this.input.mouseY >= y && this.input.mouseY < y + height;

                if (!isOver && lck[i] === 1 && rip[i] === 0) lck[i] = 0;
                if (isOver && lck[i] === 0) this.triggerCircle(x, y, width, height);

                if (rip[i] > 0) {
                    rip[i]--;
                    if (rip[i] === 0) {
                        fg[idx] = 255; fg[idx + 1] = 255; fg[idx + 2] = 0;
                        bg[idx] = 80; bg[idx + 1] = 0; bg[idx + 2] = 120;
                        gly[i] = 33 + Math.floor(Math.random() * 93);
                        lft[i] = 60;
                    }
                }

                if (lft[i] > 0) {
                    lft[i]--;
                } else if (Math.random() > 0.9995) {
                    fg[idx] = 255; fg[idx + 1] = 255; fg[idx + 2] = 0;
                    bg[idx] = 60; bg[idx + 1] = 0; bg[idx + 2] = 100;
                    gly[i] = 33 + Math.floor(Math.random() * 93);
                    lft[i] = 40;
                }

                if (bg[idx] > 5) bg[idx] -= 2;
                if (bg[idx + 2] > 10) bg[idx + 2] -= 2;

                const tR = bg[idx] + 25, tG = bg[idx + 1], tB = bg[idx + 2] + 40;
                if (fg[idx] > tR) fg[idx] -= 5; else if (fg[idx] < tR) fg[idx] += 1;
                if (fg[idx + 1] > tG) fg[idx + 1] -= 5;
                if (fg[idx + 2] > tB) fg[idx + 2] -= 5; else if (fg[idx + 2] < tB) fg[idx + 2] += 1;
            }
        });
    }
}
