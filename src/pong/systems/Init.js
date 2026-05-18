import { POS, BG, FG, GLYPH, SIZE, TEXT, FONT, HIDDEN, ACTIVE, TIMER, VELOCITY, DELAY, DEFLECT } from '../storage/components.js';

export class Init {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
    }

    spawnMovingCell(cellSize) {
        const id = this.engine.insert();
        this.engine.alter(id, POS | BG | FG | GLYPH | SIZE | TEXT | FONT | HIDDEN | ACTIVE | TIMER | VELOCITY | DELAY | DEFLECT, 0);
        this.engine.commit();

        const view = this.engine.view([POS, BG, FG, GLYPH, SIZE, TEXT, FONT, HIDDEN, ACTIVE, TIMER, VELOCITY, DELAY, DEFLECT]);

        view.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6];
            const hidden = columns[7], active = columns[8], timer = columns[9];
            const vel = columns[10], delay = columns[11], deflect = columns[12];

            for (let i = 0; i < count; i++) {
                if (size[i * 2] === 0 && size[i * 2 + 1] === 0) {
                    const cols = Math.floor(this.canvas.logicalWidth / cellSize);
                    const spawnCol = Math.floor(Math.random() * cols);

                    pos[i * 2] = spawnCol * cellSize;
                    pos[i * 2 + 1] = 0;

                    bg[i * 4] = 253; bg[i * 4 + 1] = 246; bg[i * 4 + 2] = 227; bg[i * 4 + 3] = 255;
                    fg[i * 4] = 101; fg[i * 4 + 1] = 123; fg[i * 4 + 2] = 131; fg[i * 4 + 3] = 255;

                    gly[i] = 79;
                    size[i * 2] = cellSize;
                    size[i * 2 + 1] = cellSize;
                    glySize[i] = 20;
                    glyFam[i] = 0;
                    hidden[i] = 0;
                    active[i] = 1;
                    timer[i] = 15;
                    deflect[i] = 0;

                    vel[i * 2] = 0;
                    vel[i * 2 + 1] = cellSize;

                    delay[i] = 15;
                }
            }
        });
    }

    fillScreen(cellSize) {
        const dpr = window.devicePixelRatio || 1;
        const physicalCellSize = Math.round(cellSize * dpr);
        const actualDpr = physicalCellSize / cellSize;

        const logicalWidth = Math.floor(window.innerWidth / cellSize) * cellSize;
        const logicalHeight = Math.floor(window.innerHeight / cellSize) * cellSize;

        this.canvas.width = logicalWidth * actualDpr;
        this.canvas.height = logicalHeight * actualDpr;
        this.canvas.style.width = logicalWidth + 'px';
        this.canvas.style.height = logicalHeight + 'px';
        this.canvas.logicalWidth = logicalWidth;
        this.canvas.logicalHeight = logicalHeight;

        const cols = Math.floor(this.canvas.logicalWidth / cellSize);
        const rows = Math.floor(this.canvas.logicalHeight / cellSize);
        const total = cols * rows;

        for (let i = 0; i < total; i++) {
            const id = this.engine.insert();
            this.engine.alter(id, POS | BG | FG | GLYPH | SIZE | TEXT | FONT | HIDDEN | ACTIVE | TIMER | DEFLECT | VELOCITY | DELAY, 0);
        }
        this.engine.commit();

        const initView = this.engine.view([POS, BG, FG, GLYPH, SIZE, TEXT, FONT, HIDDEN, ACTIVE, TIMER, DEFLECT, VELOCITY, DELAY]);
        let entityIndex = 0;

        initView.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6];
            const hidden = columns[7], active = columns[8], timer = columns[9];
            const deflect = columns[10], vel = columns[11], dly = columns[12];

            for (let i = 0; i < count; i++) {
                if (size[i * 2] !== 0 && size[i * 2 + 1] !== 0) continue;

                pos[i * 2] = (entityIndex % cols) * cellSize;
                pos[i * 2 + 1] = Math.floor(entityIndex / cols) * cellSize;

                bg[i * 4] = 0; bg[i * 4 + 1] = 43; bg[i * 4 + 2] = 54; bg[i * 4 + 3] = 255;
                fg[i * 4] = 131; fg[i * 4 + 1] = 148; fg[i * 4 + 2] = 150; fg[i * 4 + 3] = 255;

                gly[i] = 33 + Math.floor(Math.random() * 93);
                size[i * 2] = cellSize;
                size[i * 2 + 1] = cellSize;
                glySize[i] = 20;
                glyFam[i] = 0;

                hidden[i] = 0;
                active[i] = 0;
                timer[i] = 0;
                deflect[i] = 0;
                vel[i * 2] = 0; vel[i * 2 + 1] = 0;
                dly[i] = 0;

                entityIndex++;
            }
        });

        this.spawnMovingCell(cellSize);
    }
}
