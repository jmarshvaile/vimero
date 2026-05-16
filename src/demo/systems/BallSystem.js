import { POS, VELOCITY, BALL_TIMER, IS_BALL, SIZE, LIFETIME } from '../storage/components.js';

export class BallSystem {
    constructor(engine, canvas, rippleSystem) {
        this.engine = engine;
        this.canvas = canvas;
        this.rippleSystem = rippleSystem;
        this.ballView = engine.view([POS, VELOCITY, BALL_TIMER, IS_BALL, SIZE]);
        this.gridView = engine.view([POS, SIZE, LIFETIME]);
    }

    update() {
        this.ballView.fetch((bCount, bColumns) => {
            const bPos = bColumns[0], bVel = bColumns[1], bTimer = bColumns[2], bIsBall = bColumns[3], bSize = bColumns[4];

            for (let i = 0; i < bCount; i++) {
                if (bIsBall[i] === 0) continue;

                if (bTimer[i] > 0) {
                    bTimer[i]--;
                    continue;
                }

                bTimer[i] = 5; // Movement cooldown ticks

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

                // Canvas boundaries check
                if (nextX < 0 || nextX + bw > this.canvas.width) {
                    bounceX = true;
                    nextX = currentX;
                }
                if (nextY < 0 || nextY + bh > this.canvas.height) {
                    bounceY = true;
                    nextY = currentY;
                }

                // Grid cell collision check
                if (!bounceX || !bounceY) {
                    this.gridView.fetch((gCount, gColumns) => {
                        const gPos = gColumns[0], gSize = gColumns[1], gLifetime = gColumns[2];
                        for (let j = 0; j < gCount; j++) {
                            if (gLifetime[j] === 0) continue;

                            const gx = gPos[j * 2];
                            const gy = gPos[j * 2 + 1];
                            const gw = gSize[j * 2];
                            const gh = gSize[j * 2 + 1];

                            if (nextX < gx + gw &&
                                nextX + bw > gx &&
                                nextY < gy + gh &&
                                nextY + bh > gy) {

                                if (currentX + bw <= gx || currentX >= gx + gw) bounceX = true;
                                if (currentY + bh <= gy || currentY >= gy + gh) bounceY = true;

                                if (!bounceX && !bounceY) {
                                    bounceX = true;
                                    bounceY = true;
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

                if (bounceX || bounceY) {
                    this.rippleSystem.triggerCircle(currentX, currentY, bw, bh);
                }

                bPos[i * 2] = nextX;
                bPos[i * 2 + 1] = nextY;
            }
        });
    }
}