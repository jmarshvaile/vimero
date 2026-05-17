import { POS, ACTIVE, VELOCITY, DEFLECT, SIZE, TIMER } from '../storage/components.js';

export class Group {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, ACTIVE, VELOCITY, DEFLECT, SIZE, TIMER]);

        this.gridActive = new Float32Array(100000);
        this.gridTimer = new Float32Array(100000);
    }

    update(cellSize) {
        const cols = Math.floor(this.canvas.logicalWidth / cellSize);
        const rows = Math.floor(this.canvas.logicalHeight / cellSize);
        const totalCells = cols * rows;

        for (let i = 0; i < totalCells; i++) {
            this.gridActive[i] = 0;
            this.gridTimer[i] = 0;
        }

        // Pass 1: populate grid
        this.view.fetch((count, columns) => {
            const pos = columns[0], active = columns[1], vel = columns[2], timer = columns[5];
            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    if (active[i] === 1) {
                        const col = Math.floor(pos[i * 2] / cellSize);
                        const row = Math.floor(pos[i * 2 + 1] / cellSize);
                        if (col >= 0 && col < cols && row >= 0 && row < rows) {
                            const idx = row * cols + col;
                            this.gridActive[idx] = 1;
                            this.gridTimer[idx] = timer[i];
                        }
                    }
                }
            }
        });

        // Pass 2: calculate deflection
        this.view.fetch((count, columns) => {
            const pos = columns[0], active = columns[1], vel = columns[2], defl = columns[3], timer = columns[5];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    if (active[i] === 0) {
                        defl[i] = 0;
                        continue;
                    }

                    const col = Math.floor(pos[i * 2] / cellSize);
                    const row = Math.floor(pos[i * 2 + 1] / cellSize);

                    if (col < 0 || col >= cols || row < 0 || row >= rows) {
                        defl[i] = 0;
                        continue;
                    }

                    const idx = row * cols + col;
                    const myTimer = this.gridTimer[idx];

                    // Check horizontal neighbors
                    const leftIdx = row * cols + (col - 1);
                    const rightIdx = row * cols + (col + 1);

                    const leftActive = (col > 0 && this.gridActive[leftIdx] === 1) ? 1 : 0;
                    const rightActive = (col < cols - 1 && this.gridActive[rightIdx] === 1) ? 1 : 0;

                    if (leftActive || rightActive) {
                        const leftTimer = leftActive ? this.gridTimer[leftIdx] : -1;
                        const rightTimer = rightActive ? this.gridTimer[rightIdx] : -1;

                        if ((!leftActive || myTimer <= leftTimer) && (!rightActive || myTimer <= rightTimer)) {
                            // I am oldest
                            defl[i] = 0;
                        } else {
                            // Younger than at least one neighbor, deflect opposite to older neighbor
                            if (leftActive && rightActive) {
                                if (leftTimer < rightTimer) {
                                    defl[i] = 1; // Left is older (smaller timer = older since timer decreases)
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
                            if (this.gridTimer[tlIdx] < minTimer) { minTimer = this.gridTimer[tlIdx]; oldestSide = 1; }
                            if (this.gridTimer[tlIdx] > maxTimer) { maxTimer = this.gridTimer[tlIdx]; youngestSide = -1; }
                        }
                        if (blActive) {
                            if (this.gridTimer[blIdx] < minTimer) { minTimer = this.gridTimer[blIdx]; oldestSide = 1; }
                            if (this.gridTimer[blIdx] > maxTimer) { maxTimer = this.gridTimer[blIdx]; youngestSide = -1; }
                        }
                        if (trActive) {
                            if (this.gridTimer[trIdx] < minTimer) { minTimer = this.gridTimer[trIdx]; oldestSide = -1; }
                            if (this.gridTimer[trIdx] > maxTimer) { maxTimer = this.gridTimer[trIdx]; youngestSide = 1; }
                        }
                        if (brActive) {
                            if (this.gridTimer[brIdx] < minTimer) { minTimer = this.gridTimer[brIdx]; oldestSide = -1; }
                            if (this.gridTimer[brIdx] > maxTimer) { maxTimer = this.gridTimer[brIdx]; youngestSide = 1; }
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
