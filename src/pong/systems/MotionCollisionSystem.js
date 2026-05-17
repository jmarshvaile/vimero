import { POS, VELOCITY, STEP_TIMER, STEP_DELAY, IS_BALL, IS_GRID, SIZE, ACTIVE, DRAG_OFFSET } from '../storage/components.js';

export class MotionCollisionSystem {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.ballView = engine.view([POS, VELOCITY, STEP_TIMER, STEP_DELAY, IS_BALL, SIZE]);
        this.gridView = engine.view([POS, SIZE, ACTIVE, DRAG_OFFSET, IS_GRID]);
    }

    update() {
        this.ballView.fetch((bCount, bColumns) => {
            const bPos = bColumns[0], bVel = bColumns[1], bStepTimer = bColumns[2],
                  bStepDelay = bColumns[3], bIsBall = bColumns[4], bSize = bColumns[5];

            for (let i = 0; i < bCount; i++) {
                if (bIsBall[i] === 0) continue;

                if (bStepTimer[i] > 0) {
                    bStepTimer[i]--;
                    continue;
                }

                bStepTimer[i] = bStepDelay[i];

                const currentX = bPos[i * 2];
                const currentY = bPos[i * 2 + 1];
                const vx = bVel[i * 2];
                const vy = bVel[i * 2 + 1];
                const bw = bSize[i * 2];
                const bh = bSize[i * 2 + 1];

                let nextX = currentX + vx;
                let nextY = currentY + vy;

                let bounceX = false;
                let bounceY = false;
                let isDestroyed = false;

                // Screen bounds collision
                if (nextX < 0 || nextX + bw > this.canvas.width) {
                    bounceX = true;
                    nextX = currentX;
                }

                // Despawn on top/bottom bounds
                if (nextY < 0 || nextY + bh > this.canvas.height) {
                    isDestroyed = true;
                }

                // Grid collision
                if (!bounceX && !bounceY && !isDestroyed) {
                    this.gridView.fetch((gCount, gColumns) => {
                        const gPos = gColumns[0], gSize = gColumns[1], gActive = gColumns[2], gDragOffset = gColumns[3], gIsGrid = gColumns[4];
                        for (let j = 0; j < gCount; j++) {
                            if (gIsGrid[j] === 0 || gActive[j] === 0) continue;

                            const gx = gPos[j * 2];
                            const gy = gPos[j * 2 + 1];
                            const gw = gSize[j * 2];
                            const gh = gSize[j * 2 + 1];

                            if (nextX < gx + gw && nextX + bw > gx && nextY < gy + gh && nextY + bh > gy) {
                                bounceY = true;
                                bounceX = false;
                                const hitOffset = gDragOffset[j];
                                const speed = bw;
                                if (hitOffset < 0) {
                                    bVel[i * 2] = Math.max(-speed, vx - speed);
                                } else if (hitOffset > 0) {
                                    bVel[i * 2] = Math.min(speed, vx + speed);
                                } else {
                                    bVel[i * 2] = 0;
                                }
                            }
                        }
                    });
                }

                if (bounceX) {
                    bVel[i * 2] *= -1;
                    nextX = currentX;
                }
                if (bounceY) {
                    bVel[i * 2 + 1] *= -1;
                    nextY = currentY;
                }

                if (isDestroyed) {
                    // Mark ball to hide or delete, handled elsewhere, but set position off-screen
                    bPos[i * 2] = -1000;
                    bPos[i * 2 + 1] = -1000;
                } else {
                    bPos[i * 2] = nextX;
                    bPos[i * 2 + 1] = nextY;
                }
            }
        });
    }
}
