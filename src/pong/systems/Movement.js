import { POS, VELOCITY, TIMER, DELAY, SIZE, ACTIVE, DEFLECT } from '../storage/components.js';

export class Movement {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.view = engine.view([POS, VELOCITY, TIMER, DELAY, SIZE, ACTIVE]);
        this.gridView = engine.view([POS, VELOCITY, SIZE, ACTIVE, DEFLECT]);

        // [nextX, nextY, bounceX, bounceY]
        this._state = new Float32Array(4);
    }

    _checkWallCollision(currentX, currentY, bw, bh) {
        let nextX = this._state[0];
        let nextY = this._state[1];

        if (nextX < 0 || nextX + bw > this.canvas.logicalWidth) {
            this._state[2] = 1;
            this._state[0] = currentX;
        }
    }

    _checkGridCollision(currentX, currentY, bw, bh, vx, vel, i) {
        let nextX = this._state[0];
        let nextY = this._state[1];
        let hitFound = false;

        this.gridView.fetch((gCount, gColumns) => {
            if (hitFound) return;
            const gPos = gColumns[0], gVel = gColumns[1], gSize = gColumns[2], gActive = gColumns[3], gDefl = gColumns[4];

            for (let j = 0; j < gCount; j++) {
                if (gActive[j] === 0 || gVel[j * 2] !== 0 || gVel[j * 2 + 1] !== 0) continue;

                const gx = gPos[j * 2];
                const gy = gPos[j * 2 + 1];
                const gw = gSize[j * 2];
                const gh = gSize[j * 2 + 1];

                if (nextX < gx + gw && nextX + bw > gx && nextY < gy + gh && nextY + bh > gy) {
                    this._state[3] = 1; // bounceY
                    this._state[2] = 0; // bounceX

                    const hitDeflection = gDefl[j];
                    const speed = bw;

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

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], vel = columns[1], timer = columns[2],
                  delay = columns[3], size = columns[4], active = columns[5];

            for (let i = 0; i < count; i++) {
                if (active[i] === 0 || (vel[i * 2] === 0 && vel[i * 2 + 1] === 0)) continue;

                if (timer[i] > 0) {
                    timer[i]--;
                    continue;
                }

                timer[i] = delay[i];

                const currentX = pos[i * 2];
                const currentY = pos[i * 2 + 1];
                const vx = vel[i * 2];
                const vy = vel[i * 2 + 1];
                const bw = size[i * 2];
                const bh = size[i * 2 + 1];

                this._state[0] = currentX + vx;
                this._state[1] = currentY + vy;
                this._state[2] = 0;
                this._state[3] = 0;

                this._checkWallCollision(currentX, currentY, bw, bh);

                if (this._state[2] === 0 && this._state[3] === 0) {
                    this._checkGridCollision(currentX, currentY, bw, bh, vx, vel, i);
                }

                if (this._state[2] === 1) {
                    vel[i * 2] *= -1;
                    this._state[0] = currentX;
                }
                if (this._state[3] === 1) {
                    vel[i * 2 + 1] *= -1;
                    this._state[1] = currentY;
                }

                pos[i * 2] = this._state[0];
                pos[i * 2 + 1] = this._state[1];
            }
        });
    }
}
