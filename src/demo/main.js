import { Engine } from '../vimero/index.js';
import { schema, FULL_MASK, POS, BG_COLOR, FG_COLOR, GLYPH, SIZE, GLYPH_SIZE, GLYPH_FAMILY } from './storage/components.js';
import { InputSystem } from './systems/InputSystem.js';
import { RippleSystem } from './systems/RippleSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const inputSystem = new InputSystem();
const rippleSystem = new RippleSystem(engine, inputSystem);
const renderSystem = new RenderSystem(engine, canvas);

function fillScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const initialCellSize = 20;
    const cols = Math.ceil(canvas.width / initialCellSize);
    const rows = Math.ceil(canvas.height / initialCellSize);
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
