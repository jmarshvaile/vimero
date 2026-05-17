import { POS, VELOCITY, STEP_TIMER, IS_MOVER, SIZE, LIFETIME, DELAY } from '../storage/components.js';

export class GridMovementSystem {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.moverView = engine.view([POS, VELOCITY, STEP_TIMER, IS_MOVER, SIZE]);
        this.gridView = engine.view([POS, SIZE, LIFETIME, DELAY], [IS_MOVER]);

        // Single TypedArray to hold [bounceX, bounceY] to avoid GC allocations in the hot path
        this._collisionState = new Uint8Array(2);
    }

    _checkWallCollision(nextX, nextY, currentX, currentY, bw, bh) {
        let newNextX = nextX;
        let newNextY = nextY;

        if (nextX < 0 || nextX + bw > this.canvas.logicalWidth) {
            this._collisionState[0] = 1; // bounceX = true
            newNextX = currentX;
        }
        if (nextY < 0 || nextY + bh > this.canvas.logicalHeight) {
            this._collisionState[1] = 1; // bounceY = true
            newNextY = currentY;
        }

        return { nextX: newNextX, nextY: newNextY };
    }

    _checkGridCollision(nextX, nextY, currentX, currentY, bw, bh) {
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

                    if (currentX + bw <= gx || currentX >= gx + gw) this._collisionState[0] = 1; // bounceX = true
                    if (currentY + bh <= gy || currentY >= gy + gh) this._collisionState[1] = 1; // bounceY = true

                    if (this._collisionState[0] === 0 && this._collisionState[1] === 0) {
                        this._collisionState[0] = 1;
                        this._collisionState[1] = 1;
                    }
                }
            }
        });
    }

    _updateMover(bPos, bVel, bSize, i, currentX, currentY, vx, vy) {
        const bw = bSize[i * 2];
        const bh = bSize[i * 2 + 1];

        let nextX = currentX + vx;
        let nextY = currentY + vy;

        this._collisionState[0] = 0;
        this._collisionState[1] = 0;

        // Check walls
        const wallState = this._checkWallCollision(nextX, nextY, currentX, currentY, bw, bh);
        nextX = wallState.nextX;
        nextY = wallState.nextY;

        // Check grid if not bouncing yet
        if (this._collisionState[0] === 0 || this._collisionState[1] === 0) {
            this._checkGridCollision(nextX, nextY, currentX, currentY, bw, bh);
        }

        if (this._collisionState[0] === 1) {
            bVel[i * 2] *= -1;
            nextX = currentX;
        }
        if (this._collisionState[1] === 1) {
            bVel[i * 2 + 1] *= -1;
            nextY = currentY;
        }

        bPos[i * 2] = nextX;
        bPos[i * 2 + 1] = nextY;
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
