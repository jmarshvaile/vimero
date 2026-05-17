import { POS, BG, FG, GLYPH, SIZE, TEXT, FONT, LIFETIME, DELAY, POINTER_LOCK, VELOCITY, TIMER, MOVER } from '../storage/components.js';

export class Init {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
    }

    fillScreen(cellSize) {
        const logicalWidth = window.innerWidth;
        const logicalHeight = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = logicalWidth * dpr;
        this.canvas.height = logicalHeight * dpr;
        this.canvas.style.width = logicalWidth + 'px';
        this.canvas.style.height = logicalHeight + 'px';
        this.canvas.logicalWidth = logicalWidth;
        this.canvas.logicalHeight = logicalHeight;

        const cols = Math.ceil(this.canvas.logicalWidth / cellSize);
        const rows = Math.ceil(this.canvas.logicalHeight / cellSize);
        const total = cols * rows;

        for (let i = 0; i < total; i++) {
            const id = this.engine.insert();
            this.engine.alter(id, POS | BG | FG | GLYPH | SIZE | TEXT | FONT | LIFETIME | DELAY | POINTER_LOCK, 0);
        }
        this.engine.commit();

        const initView = this.engine.view([POS, BG, FG, GLYPH, SIZE, TEXT, FONT, LIFETIME, DELAY, POINTER_LOCK]);
        let entityIndex = 0;

        initView.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6], lft = columns[7], dly = columns[8], lck = columns[9];
            for (let i = 0; i < count; i++) {
                pos[i * 2] = (entityIndex % cols) * cellSize;
                pos[i * 2 + 1] = Math.floor(entityIndex / cols) * cellSize;
                bg[i * 4] = 5; bg[i * 4 + 1] = 0; bg[i * 4 + 2] = 10; bg[i * 4 + 3] = 255;
                fg[i * 4] = 30; fg[i * 4 + 1] = 0; fg[i * 4 + 2] = 50; fg[i * 4 + 3] = 255;
                gly[i] = 33 + Math.floor(Math.random() * 93);
                size[i * 2] = cellSize;
                size[i * 2 + 1] = cellSize;
                glySize[i] = cellSize * 0.8;
                glyFam[i] = 0; lft[i] = 0; dly[i] = 0; lck[i] = 0;
                entityIndex++;
            }
        });

        const numMovers = 4;
        for (let i = 0; i < numMovers; i++) {
            const id = this.engine.insert();
            this.engine.alter(id, POS | BG | FG | GLYPH | SIZE | TEXT | FONT | VELOCITY | TIMER | MOVER, 0);
        }
        this.engine.commit();

        let moverInitCount = 0;
        const moverInitView = this.engine.view([POS, BG, FG, GLYPH, SIZE, TEXT, FONT, VELOCITY, TIMER, MOVER]);
        moverInitView.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6];
            const vel = columns[7], timer = columns[8], isMover = columns[9];

            for (let i = 0; i < count; i++) {
                if (isMover[i] === 0) {
                    isMover[i] = 1;

                    pos[i * 2] = Math.floor(Math.random() * (this.canvas.logicalWidth / cellSize)) * cellSize;
                    pos[i * 2 + 1] = Math.floor(Math.random() * (this.canvas.logicalHeight / cellSize)) * cellSize;

                    bg[i * 4] = 5; bg[i * 4 + 1] = 0; bg[i * 4 + 2] = 10; bg[i * 4 + 3] = 255;
                    fg[i * 4] = 255; fg[i * 4 + 1] = 255; fg[i * 4 + 2] = 255; fg[i * 4 + 3] = 255;

                    gly[i] = 79;

                    size[i * 2] = cellSize;
                    size[i * 2 + 1] = cellSize;
                    glySize[i] = cellSize * 0.9;
                    glyFam[i] = 0;

                    let vx, vy;
                    if (moverInitCount < 2) {
                        vx = Math.random() > 0.5 ? cellSize : -cellSize;
                        vy = Math.random() > 0.5 ? cellSize : -cellSize;
                    } else if (moverInitCount === 2) {
                        vx = cellSize;
                        vy = 0;
                    } else {
                        vx = 0;
                        vy = cellSize;
                    }
                    moverInitCount++;

                    vel[i * 2] = vx;
                    vel[i * 2 + 1] = vy;

                    timer[i] = 0;
                }
            }
        });
    }
}
