import { POS, BG, FG, GLYPH, SIZE, FONT_SIZE, FONT_FAMILY, HIDDEN, ACTIVE, LIFETIME, VELOCITY, COOLDOWN, COOLDOWN_TIMER, CAN_MOVE, DEFLECT } from '../storage/components.js';

export class Init {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
    }

    spawnMovingCell(cellWidth, cellHeight) {
        const id = this.engine.insert();
        this.engine.alter(id, POS | BG | FG | GLYPH | SIZE | FONT_SIZE | FONT_FAMILY | HIDDEN | ACTIVE | LIFETIME | VELOCITY | COOLDOWN | COOLDOWN_TIMER | CAN_MOVE | DEFLECT, 0);
        this.engine.commit();

        const view = this.engine.view([POS, BG, FG, GLYPH, SIZE, FONT_SIZE, FONT_FAMILY, HIDDEN, ACTIVE, LIFETIME, VELOCITY, COOLDOWN, COOLDOWN_TIMER, CAN_MOVE, DEFLECT]);

        view.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6];
            const hidden = columns[7], active = columns[8], timer = columns[9];
            const vel = columns[10], delay = columns[11], cooldownTimer = columns[12], canMove = columns[13], deflect = columns[14];

            for (let i = 0; i < count; i++) {
                if (size[i * 2] === 0 && size[i * 2 + 1] === 0) {
                    const cols = Math.floor(this.canvas.logicalWidth / cellWidth);
                    const spawnCol = Math.floor(Math.random() * cols);

                    pos[i * 2] = spawnCol * cellWidth;
                    pos[i * 2 + 1] = 0;

                    bg[i * 4] = 253; bg[i * 4 + 1] = 246; bg[i * 4 + 2] = 227; bg[i * 4 + 3] = 255;
                    fg[i * 4] = 101; fg[i * 4 + 1] = 123; fg[i * 4 + 2] = 131; fg[i * 4 + 3] = 255;

                    gly[i] = 79;
                    size[i * 2] = cellWidth;
                    size[i * 2 + 1] = cellHeight;
                    glySize[i] = 16;
                    glyFam[i] = 0;
                    hidden[i] = 0;
                    active[i] = 1;
                    timer[i] = 15;
                    deflect[i] = 0;

                    vel[i * 2] = 0;
                    vel[i * 2 + 1] = cellHeight;

                    cooldownTimer[i] = 15;
                    canMove[i] = 0;

                    delay[i] = 15;
                }
            }
        });
    }

    fillScreen(cellWidth, cellHeight) {
        const dpr = window.devicePixelRatio || 1;
        const physicalCellWidth = Math.round(cellWidth * dpr);
        const actualDprX = physicalCellWidth / cellWidth;
        const physicalCellHeight = Math.round(cellHeight * dpr);
        const actualDprY = physicalCellHeight / cellHeight;

        // document.body.clientWidth / clientHeight accurately reflect the actual layout space
        // without including potential scrollbars or mobile viewport zoom quirks like innerWidth.
        const logicalWidth = Math.floor(document.body.clientWidth / cellWidth) * cellWidth;
        const logicalHeight = Math.floor(document.body.clientHeight / cellHeight) * cellHeight;

        this.canvas.width = logicalWidth * actualDprX;
        this.canvas.height = logicalHeight * actualDprY;
        this.canvas.style.width = logicalWidth + 'px';
        this.canvas.style.height = logicalHeight + 'px';
        this.canvas.logicalWidth = logicalWidth;
        this.canvas.logicalHeight = logicalHeight;

        const cols = Math.floor(this.canvas.logicalWidth / cellWidth);
        const rows = Math.floor(this.canvas.logicalHeight / cellHeight);
        const total = cols * rows;

        for (let i = 0; i < total; i++) {
            const id = this.engine.insert();
            this.engine.alter(id, POS | BG | FG | GLYPH | SIZE | FONT_SIZE | FONT_FAMILY | HIDDEN | ACTIVE | LIFETIME | DEFLECT | VELOCITY | COOLDOWN | COOLDOWN_TIMER | CAN_MOVE, 0);
        }
        this.engine.commit();

        const initView = this.engine.view([POS, BG, FG, GLYPH, SIZE, FONT_SIZE, FONT_FAMILY, HIDDEN, ACTIVE, LIFETIME, DEFLECT, VELOCITY, COOLDOWN, COOLDOWN_TIMER, CAN_MOVE]);
        let entityIndex = 0;

        initView.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6];
            const hidden = columns[7], active = columns[8], timer = columns[9];
            const deflect = columns[10], vel = columns[11], dly = columns[12], cooldownTimer = columns[13], canMove = columns[14];

            for (let i = 0; i < count; i++) {
                if (size[i * 2] !== 0 && size[i * 2 + 1] !== 0) continue;

                pos[i * 2] = (entityIndex % cols) * cellWidth;
                pos[i * 2 + 1] = Math.floor(entityIndex / cols) * cellHeight;

                bg[i * 4] = 0; bg[i * 4 + 1] = 43; bg[i * 4 + 2] = 54; bg[i * 4 + 3] = 255;
                fg[i * 4] = 131; fg[i * 4 + 1] = 148; fg[i * 4 + 2] = 150; fg[i * 4 + 3] = 255;

                gly[i] = 33 + Math.floor(Math.random() * 93);
                size[i * 2] = cellWidth;
                    size[i * 2 + 1] = cellHeight;
                glySize[i] = 16;
                glyFam[i] = 0;

                hidden[i] = 0;
                active[i] = 0;
                timer[i] = 0;
                deflect[i] = 0;
                vel[i * 2] = 0; vel[i * 2 + 1] = 0;
                dly[i] = 0;
                cooldownTimer[i] = 0;
                canMove[i] = 0;

                entityIndex++;
            }
        });

        this.spawnMovingCell(cellWidth, cellHeight);
    }
}
