import { Engine } from '../vimero/index.js';
import { schema, FULL_MASK, POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, HIDDEN, ACTIVE, TIMER, VELOCITY, STEP_TIMER, STEP_DELAY, IS_BALL, IS_GRID } from './storage/components.js';

import { ClickInputSystem } from './systems/ClickInputSystem.js';
import { GridActivationSystem } from './systems/GridActivationSystem.js';
import { TimerStateSystem } from './systems/TimerStateSystem.js';
import { ThemeColorSystem } from './systems/ThemeColorSystem.js';
import { MotionCollisionSystem } from './systems/MotionCollisionSystem.js';
import { OccupancySystem } from './systems/OccupancySystem.js';
import { RenderSystem } from './systems/RenderSystem.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const clickInputSystem = new ClickInputSystem(canvas);
const gridActivationSystem = new GridActivationSystem(engine, clickInputSystem);
const timerStateSystem = new TimerStateSystem(engine);
const themeColorSystem = new ThemeColorSystem(engine);
const motionCollisionSystem = new MotionCollisionSystem(engine, canvas);
const occupancySystem = new OccupancySystem(engine);
const renderSystem = new RenderSystem(engine, canvas);

const initialCellSize = 16;
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

// Maintain references so ball loop can know if we need to respawn
let ballEntityId = -1;

function spawnBall() {
    const id = engine.insert();
    engine.alter(id, FULL_MASK, 0);
    engine.commit();

    const ballView = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, HIDDEN, ACTIVE, TIMER, VELOCITY, STEP_TIMER, STEP_DELAY, IS_BALL, IS_GRID]);

    ballView.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        const size = columns[4], glySize = columns[5], glyFam = columns[6];
        const hidden = columns[7], active = columns[8], timer = columns[9];
        const vel = columns[10], stepTimer = columns[11], stepDelay = columns[12];
        const isBall = columns[13], isGrid = columns[14];

        for (let i = 0; i < count; i++) {
            // Find the newly spawned ball that hasn't been initialized
            if (isBall[i] === 0 && isGrid[i] === 0) {
                isBall[i] = 1;

                // Spawn at top, random X within grid
                const cols = Math.ceil(canvas.width / initialCellSize);
                const spawnCol = Math.floor(Math.random() * cols);

                pos[i * 2] = spawnCol * initialCellSize;
                pos[i * 2 + 1] = 0;

                // Active solarized light colors for ball constantly
                bg[i * 4] = 253; bg[i * 4 + 1] = 246; bg[i * 4 + 2] = 227; bg[i * 4 + 3] = 255;
                fg[i * 4] = 101; fg[i * 4 + 1] = 123; fg[i * 4 + 2] = 131; fg[i * 4 + 3] = 255;

                gly[i] = 79; // 'O'
                size[i * 2] = initialCellSize;
                size[i * 2 + 1] = initialCellSize;
                glySize[i] = initialCellSize * 0.9;
                glyFam[i] = 0; // monospace
                hidden[i] = 0;
                active[i] = 1; // Always active
                timer[i] = 0; // Not used for ball

                vel[i * 2] = 0;
                vel[i * 2 + 1] = initialCellSize; // Move down by one cell

                stepDelay[i] = 60; // 1 second at 60fps
                stepTimer[i] = 60;

                ballEntityId = id;
            }
        }
    });
}

function checkAndRespawnBall() {
    if (ballEntityId === -1) return;

    // Quick view to check ball position
    const bv = engine.view([POS, IS_BALL]);
    let needsRespawn = false;

    bv.fetch((count, columns) => {
        const pos = columns[0], isBall = columns[1];
        for (let i = 0; i < count; i++) {
            if (isBall[i] === 1) {
                const y = pos[i * 2 + 1];
                if (y < 0 || y >= canvas.height) { // If went off top or bottom bounds
                    needsRespawn = true;
                    // Reset its position and flag to essentially reuse it
                    pos[i * 2] = Math.floor(Math.random() * Math.ceil(canvas.width / initialCellSize)) * initialCellSize;
                    pos[i * 2 + 1] = 0;

                    // Needs view to reset velocity
                    const fullBallView = engine.view([VELOCITY, STEP_TIMER], [], engine);
                    fullBallView.fetch((fc, fcCols) => {
                        const fv = fcCols[0], fst = fcCols[1];
                        for(let j = 0; j < fc; j++) {
                            // Find the correct entity, since this view includes grid we just reset all balls velocity to start down
                            // This works because we only have 1 ball
                            fv[j * 2] = 0;
                            fv[j * 2 + 1] = initialCellSize;
                            fst[j] = 60;
                        }
                    });
                }
            }
        }
    });
}

function fillScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.ceil(canvas.width / initialCellSize);
    const rows = Math.ceil(canvas.height / initialCellSize);
    const total = cols * rows;

    for (let i = 0; i < total; i++) {
        const id = engine.insert();
        engine.alter(id, FULL_MASK, 0);
    }
    engine.commit();

    const initView = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, HIDDEN, ACTIVE, TIMER, IS_GRID, IS_BALL]);
    let entityIndex = 0;

    initView.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        const size = columns[4], glySize = columns[5], glyFam = columns[6];
        const hidden = columns[7], active = columns[8], timer = columns[9];
        const isGrid = columns[10], isBall = columns[11];

        for (let i = 0; i < count; i++) {
            if (isGrid[i] === 1 || isBall[i] === 1) continue; // Already initialized

            isGrid[i] = 1;
            pos[i * 2] = (entityIndex % cols) * initialCellSize;
            pos[i * 2 + 1] = Math.floor(entityIndex / cols) * initialCellSize;

            // Solarized Dark Theme Colors (initial)
            bg[i * 4] = 0; bg[i * 4 + 1] = 43; bg[i * 4 + 2] = 54; bg[i * 4 + 3] = 255;
            fg[i * 4] = 131; fg[i * 4 + 1] = 148; fg[i * 4 + 2] = 150; fg[i * 4 + 3] = 255;

            gly[i] = 33 + Math.floor(Math.random() * 93);
            size[i * 2] = initialCellSize;
            size[i * 2 + 1] = initialCellSize;
            glySize[i] = initialCellSize;
            glyFam[i] = 0;

            hidden[i] = 0;
            active[i] = 0;
            timer[i] = 0;

            entityIndex++;
        }
    });

    spawnBall();
}

fillScreen();

function loop() {
    engine.currentTick++;
    gridActivationSystem.update();
    timerStateSystem.update();
    themeColorSystem.update();
    motionCollisionSystem.update();
    checkAndRespawnBall();
    occupancySystem.update();
    renderSystem.render();
    requestAnimationFrame(loop);
}

loop();

window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
        location.reload();
    }
});
