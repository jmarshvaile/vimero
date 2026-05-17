import { ACTIVE, BG, FG } from '../storage/components.js';

export class Theme {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([ACTIVE, BG, FG]);

        // Solarized Dark Theme Colors
        this.darkBg = [0, 43, 54, 255]; // #002b36
        this.darkFg = [131, 148, 150, 255]; // #839496

        // Solarized Light Theme Colors
        this.lightBg = [253, 246, 227, 255]; // #fdf6e3
        this.lightFg = [101, 123, 131, 255]; // #657b83
    }

    update() {
        this.view.fetch((count, columns) => {
            const active = columns[0], bg = columns[1], fg = columns[2];

            for (let i = 0; i < count; i++) {
                const idx = i * 4;

                if (active[i] === 1) {
                    bg[idx] = this.lightBg[0];
                    bg[idx+1] = this.lightBg[1];
                    bg[idx+2] = this.lightBg[2];
                    bg[idx+3] = this.lightBg[3];

                    fg[idx] = this.lightFg[0];
                    fg[idx+1] = this.lightFg[1];
                    fg[idx+2] = this.lightFg[2];
                    fg[idx+3] = this.lightFg[3];
                } else {
                    bg[idx] = this.darkBg[0];
                    bg[idx+1] = this.darkBg[1];
                    bg[idx+2] = this.darkBg[2];
                    bg[idx+3] = this.darkBg[3];

                    fg[idx] = this.darkFg[0];
                    fg[idx+1] = this.darkFg[1];
                    fg[idx+2] = this.darkFg[2];
                    fg[idx+3] = this.darkFg[3];
                }
            }
        });
    }
}
