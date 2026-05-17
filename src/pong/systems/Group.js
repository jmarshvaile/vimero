import { POS, ACTIVE, VELOCITY, DEFLECT, SIZE } from '../storage/components.js';

export class Group {
    constructor(engine) {
        this.engine = engine;
        this.view = engine.view([POS, ACTIVE, VELOCITY, DEFLECT, SIZE]);
    }

    update() {
        this.view.fetch((count, columns) => {
            const pos = columns[0], active = columns[1], vel = columns[2], defl = columns[3], size = columns[4];

            for (let i = 0; i < count; i++) {
                if (vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    defl[i] = 0;
                }
            }

            let segmentStart = -1;
            let currentY = -1;
            let segmentLength = 0;
            let lastX = -1;

            const processSegment = (startIdx, length) => {
                if (length <= 1) return;
                const mid = length / 2;
                for (let k = 0; k < length; k++) {
                    const entityIndex = startIdx + k;
                    if (k < mid - 0.5) {
                        defl[entityIndex] = -1;
                    } else if (k > mid - 0.5) {
                        defl[entityIndex] = 1;
                    } else {
                        defl[entityIndex] = 0;
                    }
                }
            };

            for (let i = 0; i < count; i++) {
                if (active[i] === 1 && vel[i * 2] === 0 && vel[i * 2 + 1] === 0) {
                    const x = pos[i * 2];
                    const y = pos[i * 2 + 1];
                    const w = size[i * 2];

                    if (segmentStart === -1) {
                        segmentStart = i;
                        currentY = y;
                        lastX = x;
                        segmentLength = 1;
                    } else {
                        if (y === currentY && x === lastX + w) {
                            segmentLength++;
                            lastX = x;
                        } else {
                            processSegment(segmentStart, segmentLength);
                            segmentStart = i;
                            currentY = y;
                            lastX = x;
                            segmentLength = 1;
                        }
                    }
                } else {
                    if (segmentStart !== -1) {
                        processSegment(segmentStart, segmentLength);
                        segmentStart = -1;
                    }
                }
            }

            if (segmentStart !== -1) {
                processSegment(segmentStart, segmentLength);
            }
        });
    }
}
