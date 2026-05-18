import { COOLDOWN_TIMER, COOLDOWN, CAN_MOVE, VELOCITY } from '../storage/components.js';

export class Cooldown {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([COOLDOWN_TIMER, COOLDOWN, CAN_MOVE, VELOCITY]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const cooldownTimer = columns[0], cooldown = columns[1], canMove = columns[2], vel = columns[3];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) continue;

                if (cooldownTimer[i] > 0) {
                    cooldownTimer[i]--;
                }

                if (cooldownTimer[i] === 0) {
                    canMove[i] = 1;
                    cooldownTimer[i] = cooldown[i];
                }
            }
        });
    }
}
