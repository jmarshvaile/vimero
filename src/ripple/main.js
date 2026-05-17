import { Engine } from '../vimero/index.js';
import { schema, POS, BG, FG, GLYPH, SIZE, TEXT, FONT, VELOCITY, TIMER, MOVER } from './storage/components.js';
import { Input } from './systems/Input.js';
import { Proximity } from './systems/Proximity.js';
import { Render } from './systems/Render.js';
import { Movement } from './systems/Movement.js';
import { Fade } from './systems/Fade.js';
import { Resize } from './systems/Resize.js';
import { Init } from './systems/Init.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const input = new Input();
const proximity = new Proximity(engine, input);
const fade = new Fade(engine);
const render = new Render(engine, canvas);
const movement = new Movement(engine, canvas);
const resize = new Resize();
const init = new Init(engine, canvas);

const cellSize = 20;
init.fillScreen(cellSize);

function loop() {
    engine.currentTick++;
    movement.update();
    proximity.update();
    fade.update();
    render.render();
    resize.update();
    requestAnimationFrame(loop);
}

loop();
