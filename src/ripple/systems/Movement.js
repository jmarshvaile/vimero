import { POS, VELOCITY, TIMER, MOVER, SIZE, LIFETIME, DELAY } from '../storage/components.js';

export class Movement {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.moverView = engine.view([POS, VELOCITY, TIMER, MOVER, SIZE]);
        this.gridView = engine.view([POS, SIZE, LIFETIME, DELAY], [MOVER]);

        // Float32Array to hold [nextX, nextY, bounceX, bounceY] to avoid GC allocations
        this._state = new Float32Array(4);
    }

    _checkWallCollision(currentX, currentY, bw, bh) {
        let nextX = this._state[0];
        let nextY = this._state[1];

        if (nextX < 0 || nextX + bw > this.canvas.logicalWidth) {
            this._state[2] = 1; // bounceX = true
            this._state[0] = currentX;
        }
        if (nextY < 0 || nextY + bh > this.canvas.logicalHeight) {
            this._state[3] = 1; // bounceY = true
            this._state[1] = currentY;
        }
    }

    _checkGridCollision(currentX, currentY, bw, bh) {
        let nextX = this._state[0];
        let nextY = this._state[1];

        this.gridView.fetch((gCount, gColumns) => {
            const gPos = gColumns[0], gSize = gColumns[1], gLifetime = gColumns[2], gDelay = gColumns[3];
            for (let j = 0; j < gCount; j++) {
                // If lifetime is 0 and delay is 0, the cell has begun fading and loses collision
                if (gLifetime[j] === 0 && gDelay[j] === 0) continue;

                const gx = gPos[j * 2];
                const gy = gPos[j * 2 + 1];
                const gw = gSize[j * 2];
                const gh = gSize[j * 2 + 1];

                if (nextX < gx + gw &&
                    nextX + bw > gx &&
                    nextY < gy + gh &&
                    nextY + bh > gy) {

                    if (currentX + bw <= gx || currentX >= gx + gw) this._state[2] = 1; // bounceX = true
                    if (currentY + bh <= gy || currentY >= gy + gh) this._state[3] = 1; // bounceY = true

                    if (this._state[2] === 0 && this._state[3] === 0) {
                        this._state[2] = 1;
                        this._state[3] = 1;
                    }
                }
            }
        });
    }

    _updateMover(bPos, bVel, bSize, i, currentX, currentY, vx, vy) {
        const bw = bSize[i * 2];
        const bh = bSize[i * 2 + 1];

        this._state[0] = currentX + vx;
        this._state[1] = currentY + vy;
        this._state[2] = 0; // bounceX
        this._state[3] = 0; // bounceY

        // Check walls
        this._checkWallCollision(currentX, currentY, bw, bh);

        // Check grid if not bouncing yet
        if (this._state[2] === 0 || this._state[3] === 0) {
            this._checkGridCollision(currentX, currentY, bw, bh);
        }

        if (this._state[2] === 1) {
            bVel[i * 2] *= -1;
            this._state[0] = currentX;
        }
        if (this._state[3] === 1) {
            bVel[i * 2 + 1] *= -1;
            this._state[1] = currentY;
        }

        bPos[i * 2] = this._state[0];
        bPos[i * 2 + 1] = this._state[1];
    }

    update() {
        this.moverView.fetch((bCount, bColumns) => {
            const bPos = bColumns[0], bVel = bColumns[1], bTimer = bColumns[2], bIsMover = bColumns[3], bSize = bColumns[4];

            for (let i = 0; i < bCount; i++) {
                if (bIsMover[i] === 0) continue;

                if (bTimer[i] > 0) {
                    bTimer[i]--;
                    continue;
                }

                bTimer[i] = 11; // Movement cooldown ticks

                const currentX = bPos[i * 2];
                const currentY = bPos[i * 2 + 1];
                const vx = bVel[i * 2];
                const vy = bVel[i * 2 + 1];

                this._updateMover(bPos, bVel, bSize, i, currentX, currentY, vx, vy);
            }
        });
    }
}
