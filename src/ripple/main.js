import { Engine } from '../vimero/index.js';
import { schema, FULL_MASK, POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, VELOCITY, STEP_TIMER, IS_MOVER } from './storage/components.js';
import { InputSystem } from './systems/InputSystem.js';
import { ProximityStateSystem } from './systems/ProximityStateSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { GridMovementSystem } from './systems/GridMovementSystem.js';
import { FadeSystem } from './systems/FadeSystem.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const inputSystem = new InputSystem();
const proximityStateSystem = new ProximityStateSystem(engine, inputSystem);
const fadeSystem = new FadeSystem(engine);
const renderSystem = new RenderSystem(engine, canvas);
const movementSystem = new GridMovementSystem(engine, canvas);

const initialCellSize = 20;

function fillScreen() {
    const logicalWidth = window.innerWidth;
    const logicalHeight = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';
    canvas.logicalWidth = logicalWidth;
    canvas.logicalHeight = logicalHeight;

    const cols = Math.ceil(canvas.logicalWidth / initialCellSize);
    const rows = Math.ceil(canvas.logicalHeight / initialCellSize);
    const total = cols * rows;

    for (let i = 0; i < total; i++) {
        const id = engine.insert();
        engine.alter(id, FULL_MASK, 0);
    }
    engine.commit();

    // Use view mapping directly instead of internal column access arrays
    const initView = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY]);
    let entityIndex = 0;
    
    initView.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        const size = columns[4], glySize = columns[5], glyFam = columns[6];
        for (let i = 0; i < count; i++) {
            pos[i * 2] = (entityIndex % cols) * initialCellSize;
            pos[i * 2 + 1] = Math.floor(entityIndex / cols) * initialCellSize;
            bg[i * 4] = 5; bg[i * 4 + 1] = 0; bg[i * 4 + 2] = 10; bg[i * 4 + 3] = 255;
            fg[i * 4] = 30; fg[i * 4 + 1] = 0; fg[i * 4 + 2] = 50; fg[i * 4 + 3] = 255;
            gly[i] = 33 + Math.floor(Math.random() * 93);
            size[i * 2] = initialCellSize;
            size[i * 2 + 1] = initialCellSize;
            glySize[i] = initialCellSize * 0.8;
            glyFam[i] = 0; // 0 index means 'monospace'
            entityIndex++;
        }
    });

    // Spawn mover entities for stress testing
    const numMovers = 4;
    for (let i = 0; i < numMovers; i++) {
        const id = engine.insert();
        // Include FULL_MASK and the new components
        engine.alter(id, FULL_MASK | VELOCITY | STEP_TIMER | IS_MOVER, 0);
    }
    engine.commit();

    // Initialize the movers
    let moverInitCount = 0;
    const moverInitView = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY, VELOCITY, STEP_TIMER, IS_MOVER]);
    moverInitView.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        const size = columns[4], glySize = columns[5], glyFam = columns[6];
        const vel = columns[7], timer = columns[8], isMover = columns[9];

        for (let i = 0; i < count; i++) {
            if (isMover[i] === 0) { // Only initialize the ones we just added which have IS_MOVER flag
                isMover[i] = 1;

                pos[i * 2] = Math.floor(Math.random() * (canvas.logicalWidth / initialCellSize)) * initialCellSize;
                pos[i * 2 + 1] = Math.floor(Math.random() * (canvas.logicalHeight / initialCellSize)) * initialCellSize;

                // Use base background color to hide the background
                bg[i * 4] = 5; bg[i * 4 + 1] = 0; bg[i * 4 + 2] = 10; bg[i * 4 + 3] = 255;
                fg[i * 4] = 255; fg[i * 4 + 1] = 255; fg[i * 4 + 2] = 255; fg[i * 4 + 3] = 255;

                gly[i] = 79; // ASCII for 'O'

                size[i * 2] = initialCellSize;
                size[i * 2 + 1] = initialCellSize;
                glySize[i] = initialCellSize * 0.9;
                glyFam[i] = 0;

                // Velocity in terms of grid cells
                let vx, vy;
                if (moverInitCount < 2) {
                    vx = Math.random() > 0.5 ? initialCellSize : -initialCellSize;
                    vy = Math.random() > 0.5 ? initialCellSize : -initialCellSize;
                } else if (moverInitCount === 2) {
                    vx = initialCellSize;
                    vy = 0;
                } else {
                    vx = 0;
                    vy = initialCellSize;
                }
                moverInitCount++;

                vel[i * 2] = vx;
                vel[i * 2 + 1] = vy;

                timer[i] = 0;
            }
        }
    });
}

fillScreen();

function loop() {
    engine.currentTick++;
    movementSystem.update();
    proximityStateSystem.update();
    fadeSystem.update();
    renderSystem.render();
    requestAnimationFrame(loop);
}

loop();

let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
        location.reload();
    }
});
