import { POS, ACTIVE, VELOCITY, DEFLECT, SIZE, LIFETIME } from '../storage/components.js';

export class Deflection {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, ACTIVE, VELOCITY, DEFLECT, SIZE, LIFETIME]);

        this.gridActive = new Float32Array(100000);
        this.gridLifetime = new Float32Array(100000);
    }

    update(cellWidth, cellHeight) {
        const cols = Math.floor(this.canvas.logicalWidth / cellWidth);
        const rows = Math.floor(this.canvas.logicalHeight / cellHeight);
        const totalCells = cols * rows;

        for (let i = 0; i < totalCells; i++) {
            this.gridActive[i] = 0;
            this.gridLifetime[i] = 0;
        }

        // Pass 1: populate grid
        this.view.fetch((count, columns) => {
            const pos = columns[0], active = columns[1], vel = columns[2], lifetime = columns[5];
            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    if (active[i] === 1) {
                        const col = Math.floor(pos[i * 2] / cellWidth);
                        const row = Math.floor(pos[i * 2 + 1] / cellHeight);
                        if (col >= 0 && col < cols && row >= 0 && row < rows) {
                            const idx = row * cols + col;
                            this.gridActive[idx] = 1;
                            this.gridLifetime[idx] = lifetime[i];
                        }
                    }
                }
            }
        });

        // Pass 2: calculate deflection
        this.view.fetch((count, columns) => {
            const pos = columns[0], active = columns[1], vel = columns[2], defl = columns[3], lifetime = columns[5];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    if (active[i] === 0) {
                        defl[i] = 0;
                        continue;
                    }

                    const col = Math.floor(pos[i * 2] / cellWidth);
                    const row = Math.floor(pos[i * 2 + 1] / cellHeight);

                    if (col < 0 || col >= cols || row < 0 || row >= rows) {
                        defl[i] = 0;
                        continue;
                    }

                    const idx = row * cols + col;
                    const myTimer = this.gridLifetime[idx];

                    // Check horizontal neighbors
                    const leftIdx = row * cols + (col - 1);
                    const rightIdx = row * cols + (col + 1);

                    const leftActive = (col > 0 && this.gridActive[leftIdx] === 1) ? 1 : 0;
                    const rightActive = (col < cols - 1 && this.gridActive[rightIdx] === 1) ? 1 : 0;

                    if (leftActive || rightActive) {
                        const leftTimer = leftActive ? this.gridLifetime[leftIdx] : -1;
                        const rightTimer = rightActive ? this.gridLifetime[rightIdx] : -1;

                        if ((!leftActive || myTimer <= leftTimer) && (!rightActive || myTimer <= rightTimer)) {
                            // I am oldest
                            defl[i] = 0;
                        } else {
                            // Younger than at least one neighbor, deflect opposite to older neighbor
                            if (leftActive && rightActive) {
                                if (leftTimer < rightTimer) {
                                    defl[i] = 1; // Left is older (smaller lifetime = older since lifetime decreases)
                                } else {
                                    defl[i] = -1; // Right is older
                                }
                            } else if (leftActive) {
                                defl[i] = 1;
                            } else {
                                defl[i] = -1;
                            }
                        }
                        continue;
                    }

                    // Check diagonal neighbors
                    const tlIdx = (row - 1) * cols + (col - 1);
                    const trIdx = (row - 1) * cols + (col + 1);
                    const blIdx = (row + 1) * cols + (col - 1);
                    const brIdx = (row + 1) * cols + (col + 1);

                    const tlActive = (row > 0 && col > 0 && this.gridActive[tlIdx] === 1) ? 1 : 0;
                    const trActive = (row > 0 && col < cols - 1 && this.gridActive[trIdx] === 1) ? 1 : 0;
                    const blActive = (row < rows - 1 && col > 0 && this.gridActive[blIdx] === 1) ? 1 : 0;
                    const brActive = (row < rows - 1 && col < cols - 1 && this.gridActive[brIdx] === 1) ? 1 : 0;

                    if (tlActive || trActive || blActive || brActive) {
                        let minTimer = Infinity;
                        let maxTimer = -1;
                        let oldestSide = 0;
                        let youngestSide = 0;

                        if (tlActive) {
                            if (this.gridLifetime[tlIdx] < minTimer) { minTimer = this.gridLifetime[tlIdx]; oldestSide = 1; }
                            if (this.gridLifetime[tlIdx] > maxTimer) { maxTimer = this.gridLifetime[tlIdx]; youngestSide = -1; }
                        }
                        if (blActive) {
                            if (this.gridLifetime[blIdx] < minTimer) { minTimer = this.gridLifetime[blIdx]; oldestSide = 1; }
                            if (this.gridLifetime[blIdx] > maxTimer) { maxTimer = this.gridLifetime[blIdx]; youngestSide = -1; }
                        }
                        if (trActive) {
                            if (this.gridLifetime[trIdx] < minTimer) { minTimer = this.gridLifetime[trIdx]; oldestSide = -1; }
                            if (this.gridLifetime[trIdx] > maxTimer) { maxTimer = this.gridLifetime[trIdx]; youngestSide = 1; }
                        }
                        if (brActive) {
                            if (this.gridLifetime[brIdx] < minTimer) { minTimer = this.gridLifetime[brIdx]; oldestSide = -1; }
                            if (this.gridLifetime[brIdx] > maxTimer) { maxTimer = this.gridLifetime[brIdx]; youngestSide = 1; }
                        }

                        if (maxTimer > myTimer) {
                            // Deflect towards youngest
                            defl[i] = youngestSide;
                        } else if (minTimer < myTimer) {
                            // Deflect away from oldest
                            defl[i] = oldestSide;
                        } else {
                            defl[i] = 0;
                        }
                        continue;
                    }

                    // Default
                    defl[i] = 0;
                }
            }
        });
    }
}
