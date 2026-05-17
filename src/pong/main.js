import { Engine } from '../vimero/index.js';
import { schema, FULL_MASK, POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, HIDDEN, ACTIVE, TIMER, VELOCITY, STEP_TIMER, STEP_DELAY, DRAG_OFFSET } from './storage/components.js';

import { ClickInputSystem } from './systems/ClickInputSystem.js';
import { GridActivationSystem } from './systems/GridActivationSystem.js';
import { AdjacencySystem } from './systems/AdjacencySystem.js';
import { TimerStateSystem } from './systems/TimerStateSystem.js';
import { ThemeColorSystem } from './systems/ThemeColorSystem.js';
import { MotionCollisionSystem } from './systems/MotionCollisionSystem.js';
import { OccupancySystem } from './systems/OccupancySystem.js';
import { RenderSystem } from './systems/RenderSystem.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const clickInputSystem = new ClickInputSystem(canvas);
const gridActivationSystem = new GridActivationSystem(engine, clickInputSystem);
const adjacencySystem = new AdjacencySystem(engine);
const timerStateSystem = new TimerStateSystem(engine);
const themeColorSystem = new ThemeColorSystem(engine);
const motionCollisionSystem = new MotionCollisionSystem(engine, canvas);
const occupancySystem = new OccupancySystem(engine);
const renderSystem = new RenderSystem(engine, canvas);

const initialCellSize = 22;
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

// Maintain references so loop can know if we need to respawn moving cell
let movingCellEntityId = -1;

function spawnMovingCell() {
    const id = engine.insert();
    engine.alter(id, FULL_MASK, 0);
    engine.commit();

    const view = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, HIDDEN, ACTIVE, TIMER, VELOCITY, STEP_TIMER, STEP_DELAY, DRAG_OFFSET]);

    view.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        const size = columns[4], glySize = columns[5], glyFam = columns[6];
        const hidden = columns[7], active = columns[8], timer = columns[9];
        const vel = columns[10], stepTimer = columns[11], stepDelay = columns[12];
        const dragOffset = columns[13];

        for (let i = 0; i < count; i++) {
            // Find the newly spawned cell that hasn't been initialized (size is 0)
            if (size[i * 2] === 0 && size[i * 2 + 1] === 0) {
                // Spawn at top, random X within grid
                const cols = Math.ceil(canvas.width / initialCellSize);
                const spawnCol = Math.floor(Math.random() * cols);

                pos[i * 2] = spawnCol * initialCellSize;
                pos[i * 2 + 1] = 0;

                // Active solarized light colors constantly
                bg[i * 4] = 253; bg[i * 4 + 1] = 246; bg[i * 4 + 2] = 227; bg[i * 4 + 3] = 255;
                fg[i * 4] = 101; fg[i * 4 + 1] = 123; fg[i * 4 + 2] = 131; fg[i * 4 + 3] = 255;

                gly[i] = 79; // 'O'
                size[i * 2] = initialCellSize;
                size[i * 2 + 1] = initialCellSize;
                glySize[i] = 20;
                glyFam[i] = 0; // monospace
                hidden[i] = 0;
                active[i] = 1; // Always active
                timer[i] = 0; // Not used
                dragOffset[i] = 0;

                vel[i * 2] = 0;
                vel[i * 2 + 1] = initialCellSize; // Move down by one cell

                stepDelay[i] = 15; // Double speed at 60fps (was 30)
                stepTimer[i] = 15;

                movingCellEntityId = id;
            }
        }
    });
}

function maintainMovingCell() {
    if (movingCellEntityId === -1) return;

    // Quick view to check moving cell position (cells with velocity)
    const view = engine.view([POS, VELOCITY]);
    let needsRespawn = false;

    view.fetch((count, columns) => {
        const pos = columns[0], vel = columns[1];
        for (let i = 0; i < count; i++) {
            if (vel[i * 2] !== 0 || vel[i * 2 + 1] !== 0) {
                const y = pos[i * 2 + 1];
                if (y < 0 || y >= canvas.height) { // If went off top or bottom bounds
                    needsRespawn = true;
                    // Reset its position to essentially reuse it
                    pos[i * 2] = Math.floor(Math.random() * Math.ceil(canvas.width / initialCellSize)) * initialCellSize;
                    pos[i * 2 + 1] = 0;

                    // Reset velocity
                    const fullView = engine.view([VELOCITY, STEP_TIMER], [], engine);
                    fullView.fetch((fc, fcCols) => {
                        const fv = fcCols[0], fst = fcCols[1];
                        for(let j = 0; j < fc; j++) {
                            // Find the moving cell and reset velocity to start down
                            if (fv[j * 2] !== 0 || fv[j * 2 + 1] !== 0) {
                                fv[j * 2] = 0;
                                fv[j * 2 + 1] = initialCellSize;
                                fst[j] = 15;
                            }
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

    const initView = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, HIDDEN, ACTIVE, TIMER, DRAG_OFFSET]);
    let entityIndex = 0;

    initView.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        const size = columns[4], glySize = columns[5], glyFam = columns[6];
        const hidden = columns[7], active = columns[8], timer = columns[9];
        const dragOffset = columns[10];

        for (let i = 0; i < count; i++) {
            if (size[i * 2] !== 0 && size[i * 2 + 1] !== 0) continue; // Already initialized

            pos[i * 2] = (entityIndex % cols) * initialCellSize;
            pos[i * 2 + 1] = Math.floor(entityIndex / cols) * initialCellSize;

            // Solarized Dark Theme Colors (initial)
            bg[i * 4] = 0; bg[i * 4 + 1] = 43; bg[i * 4 + 2] = 54; bg[i * 4 + 3] = 255;
            fg[i * 4] = 131; fg[i * 4 + 1] = 148; fg[i * 4 + 2] = 150; fg[i * 4 + 3] = 255;

            gly[i] = 33 + Math.floor(Math.random() * 93);
            size[i * 2] = initialCellSize;
            size[i * 2 + 1] = initialCellSize;
            glySize[i] = 20;
            glyFam[i] = 0;

            hidden[i] = 0;
            active[i] = 0;
            timer[i] = 0;
            dragOffset[i] = 0;

            entityIndex++;
        }
    });

    spawnMovingCell();
}

fillScreen();

function loop() {
    engine.currentTick++;
    gridActivationSystem.update();
    adjacencySystem.update();
    timerStateSystem.update();
    themeColorSystem.update();
    motionCollisionSystem.update();
    maintainMovingCell();
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
