import { POS, VELOCITY, ACTIVE, TIMER } from '../storage/components.js';

export class Maintainer {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, VELOCITY, ACTIVE]);
    }

    update(cellSize) {
        this.view.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], active = columns[2];
            for (let i = 0; i < count; i++) {
                if (active[i] === 1 && (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0)) {
                    if (pos[i * 2] === -1000 && pos[i * 2 + 1] === -1000) {
                        pos[i * 2] = Math.floor(Math.random() * Math.ceil(this.canvas.logicalWidth / cellSize)) * cellSize;
                        pos[i * 2 + 1] = 0;

                        const fullView = this.engine.view([VELOCITY, TIMER, ACTIVE]);
                        fullView.fetch((fc, fcCols) => {
                            const fv = fcCols[0], fst = fcCols[1], factive = fcCols[2];
                            for(let j = 0; j < fc; j++) {
                                if (factive[j] === 1 && (fv[j * 2] !== 0 || fv[j * 2 + 1] !== 0)) {
                                    fv[j * 2] = 0;
                                    fv[j * 2 + 1] = cellSize;
                                    fst[j] = 15;
                                }
                            }
                        });
                    }
                }
            }
        });
    }
}
