import { POS, VELOCITY, STEP_TIMER, STEP_DELAY, SIZE, ACTIVE, DRAG_OFFSET } from '../storage/components.js';

export class MotionCollisionSystem {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, VELOCITY, STEP_TIMER, STEP_DELAY, SIZE, ACTIVE, DRAG_OFFSET]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], stepTimer = columns[2],
                  stepDelay = columns[3], size = columns[4], active = columns[5], dragOffset = columns[6];

            for (let i = 0; i < count; i++) {
                // Only process cells that are in motion
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) continue;

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
                    // We need to iterate over all other cells in the same view to check for collision with static active cells
                    for (let j = 0; j < count; j++) {
                        if (i === j) continue; // Skip self

                        // We only collide with active cells that are NOT moving
                        if (active[j] === 0 || vel[j * 2] !== 0 || vel[j * 2 + 1] !== 0) continue;

                        const gx = pos[j * 2];
                        const gy = pos[j * 2 + 1];
                        const gw = size[j * 2];
                        const gh = size[j * 2 + 1];

                        if (nextX < gx + gw && nextX + bw > gx && nextY < gy + gh && nextY + bh > gy) {
                            bounceY = true;
                            bounceX = false;
                            const hitOffset = dragOffset[j];
                            const speed = bw; // we assume bw is the step size which is true for cells
                            if (hitOffset < 0) {
                                vel[i * 2] = Math.max(-speed, vx - speed);
                            } else if (hitOffset > 0) {
                                vel[i * 2] = Math.min(speed, vx + speed);
                            } else {
                                vel[i * 2] = 0;
                            }
                            break; // Stop checking after one hit
                        }
                    }
                }

                if (bounceX) {
                    vel[i * 2] *= -1;
                    nextX = currentX;
                }
                if (bounceY) {
                    vel[i * 2 + 1] *= -1;
                    nextY = currentY;
                }

                if (isDestroyed) {
                    // Move off-screen to mark for respawn handling
                    pos[i * 2] = -1000;
                    pos[i * 2 + 1] = -1000;
                } else {
                    pos[i * 2] = nextX;
                    pos[i * 2 + 1] = nextY;
                }
            }
        });
    }
}
