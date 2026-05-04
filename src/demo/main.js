import { Engine } from '../vimero/index.js';
import { schema, FULL_MASK, POS, BG_COLOR, FG_COLOR, GLYPH } from './storage/components.js';
import { InputSystem } from './systems/InputSystem.js';
import { RippleSystem } from './systems/RippleSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';

const CELL_SIZE = 20;
const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const inputSystem = new InputSystem();
const rippleSystem = new RippleSystem(engine, inputSystem, CELL_SIZE);
const renderSystem = new RenderSystem(engine, canvas, CELL_SIZE);

function fillScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.ceil(canvas.width / CELL_SIZE);
    const rows = Math.ceil(canvas.height / CELL_SIZE);
    const total = cols * rows;

    for (let i = 0; i < total; i++) {
        const id = engine.insert();
        engine.alter(id, FULL_MASK, 0);
    }
    engine.commit();

    // Use view mapping directly instead of internal column access arrays
    const initView = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH]);
    let entityIndex = 0;
    
    initView.fetch((count, columns) => {
        const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
        for (let i = 0; i < count; i++) {
            pos[i * 2] = (entityIndex % cols) * CELL_SIZE;
            pos[i * 2 + 1] = Math.floor(entityIndex / cols) * CELL_SIZE;
            bg[i * 4] = 5; bg[i * 4 + 1] = 0; bg[i * 4 + 2] = 10; bg[i * 4 + 3] = 255;
            fg[i * 4] = 30; fg[i * 4 + 1] = 0; fg[i * 4 + 2] = 50; fg[i * 4 + 3] = 255;
            gly[i] = 33 + Math.floor(Math.random() * 93);
            entityIndex++;
        }
    });
}

fillScreen();

function loop() {
    engine.currentTick++;
    rippleSystem.update();
    renderSystem.render();
    requestAnimationFrame(loop);
}

loop();

window.addEventListener('resize', () => location.reload());
