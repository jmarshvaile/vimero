import { BG, FG, GLYPH, LIFETIME, MOVER } from '../storage/components.js';

export class Fade {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([BG, FG, GLYPH, LIFETIME], [MOVER]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const bg = columns[0], fg = columns[1], gly = columns[2], lft = columns[3];

            for (let i = 0; i < count; i++) {
                const idx = i * 4;

                if (lft[i] > 0) {
                    lft[i]--;
                } else {
                    // Start fading since solid state is over
                    if (bg[idx] > 5) bg[idx] -= 2;
                    if (bg[idx + 2] > 10) bg[idx + 2] -= 2;

                    const tR = bg[idx] + 25, tG = bg[idx + 1], tB = bg[idx + 2] + 40;
                    if (fg[idx] > tR) fg[idx] -= 5; else if (fg[idx] < tR) fg[idx] += 1;
                    if (fg[idx + 1] > tG) fg[idx + 1] -= 5;
                    if (fg[idx + 2] > tB) fg[idx + 2] -= 5; else if (fg[idx + 2] < tB) fg[idx + 2] += 1;

                    // Spontaneous random flash
                    if (Math.random() > 0.9995) {
                        fg[idx] = 255; fg[idx + 1] = 255; fg[idx + 2] = 0;
                        bg[idx] = 60; bg[idx + 1] = 0; bg[idx + 2] = 100;
                        gly[i] = 33 + Math.floor(Math.random() * 93);
                        lft[i] = 60; // 1 second of solid color
                    }
                }
            }
        });
    }
}
