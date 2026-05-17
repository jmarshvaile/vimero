import { POS, VELOCITY, STEP_TIMER, STEP_DELAY, SIZE, ACTIVE, SURFACE_DEFLECTION } from '../storage/components.js';

export class GridMovementSystem {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        // The mover view includes all components necessary for movement and collision checking
        this.view = engine.view([POS, VELOCITY, STEP_TIMER, STEP_DELAY, SIZE, ACTIVE]);
        // The grid view is to check against other elements. It needs the deflection property.
        this.gridView = engine.view([POS, VELOCITY, SIZE, ACTIVE, SURFACE_DEFLECTION]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], stepTimer = columns[2],
                  stepDelay = columns[3], size = columns[4], active = columns[5];

            for (let i = 0; i < count; i++) {
                // Only process cells that are active and in motion
                if (active[i] === 0 || (vel[i * 2] === 0 && vel[i * 2 + 1] === 0)) continue;

                if (stepTimer[i] > 0) {
                    stepTimer[i]--;
                    continue;
                }

                stepTimer[i] = stepDelay[i];

                const currentX = pos[i * 2];
                const currentY = pos[i * 2 + 1];
                const vx = vel[i * 2];
                const vy = vel[i * 2 + 1];
                const bw = size[i * 2];
                const bh = size[i * 2 + 1];

                let nextX = currentX + vx;
                let nextY = currentY + vy;

                let bounceX = false;
                let bounceY = false;

                // Simple grid boundaries logic
                if (nextX < 0 || nextX + bw > this.canvas.logicalWidth) {
                    bounceX = true;
                    nextX = currentX;
                }

                if (!bounceX && !bounceY) {
                    let hitFound = false;
                    this.gridView.fetch((gCount, gColumns) => {
                        if (hitFound) return;

                        const gPos = gColumns[0], gVel = gColumns[1], gSize = gColumns[2], gActive = gColumns[3], gDefl = gColumns[4];

                        for (let j = 0; j < gCount; j++) {
                            // Only collide with static, active cells
                            if (gActive[j] === 0 || gVel[j * 2] !== 0 || gVel[j * 2 + 1] !== 0) continue;

                            const gx = gPos[j * 2];
                            const gy = gPos[j * 2 + 1];
                            const gw = gSize[j * 2];
                            const gh = gSize[j * 2 + 1];

                            if (nextX < gx + gw && nextX + bw > gx && nextY < gy + gh && nextY + bh > gy) {
                                bounceY = true;
                                bounceX = false;
                                const hitDeflection = gDefl[j];
                                const speed = bw; // we assume bw is the step size

                                // Apply the deflection from the surface
                                if (hitDeflection < 0) {
                                    vel[i * 2] = Math.max(-speed, vx - speed);
                                } else if (hitDeflection > 0) {
                                    vel[i * 2] = Math.min(speed, vx + speed);
                                } else {
                                    vel[i * 2] = 0;
                                }
                                hitFound = true;
                                break;
                            }
                        }
                    });
                }

                if (bounceX) {
                    vel[i * 2] *= -1;
                    nextX = currentX;
                }
                if (bounceY) {
                    vel[i * 2 + 1] *= -1;
                    nextY = currentY;
                }

                pos[i * 2] = nextX;
                pos[i * 2 + 1] = nextY;
            }
        });
    }
}
