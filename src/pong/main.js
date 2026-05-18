import { Engine } from '../vimero/index.js';
import { schema, POS, BG, FG, GLYPH, SIZE, FONT_SIZE, FONT_FAMILY, HIDDEN, ACTIVE, LIFETIME, VELOCITY, COOLDOWN, COOLDOWN_TIMER, CAN_MOVE, DEFLECT } from './storage/components.js';

import { Click } from './systems/Click.js';
import { Activate } from './systems/Activate.js';
import { Deflection } from './systems/Deflection.js';
import { Cooldown } from './systems/Cooldown.js';
import { Motion } from './systems/Motion.js';
import { WallBounce } from './systems/WallBounce.js';
import { GridBounce } from './systems/GridBounce.js';
import { Wrap } from './systems/Wrap.js';

import { Decay } from './systems/Decay.js';
import { Theme } from './systems/Theme.js';
import { Occlusion } from './systems/Occlusion.js';
import { Render } from './systems/Render.js';
import { Resize } from './systems/Resize.js';
import { Init } from './systems/Init.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const click = new Click(engine, canvas);
const activate = new Activate(engine);
const deflection = new Deflection(engine, canvas);
const cooldown = new Cooldown(engine);
const motion = new Motion(engine);
const wallBounce = new WallBounce(engine, canvas);
const gridBounce = new GridBounce(engine);
const wrap = new Wrap(engine, canvas);

const decay = new Decay(engine);
const theme = new Theme(engine);
const occlusion = new Occlusion(engine);
const render = new Render(engine, canvas);
const resize = new Resize();
const init = new Init(engine, canvas);

const cellWidth = 22;
const cellHeight = 32;
init.fillScreen(cellWidth, cellHeight);

function loop() {
    engine.currentTick++;
    activate.update();
    deflection.update(cellWidth, cellHeight);
    decay.update();
    theme.update();
    cooldown.update();
    motion.update();
    wallBounce.update();
    gridBounce.update();
    wrap.update(cellWidth, cellHeight);
    occlusion.update();
    render.render();
    resize.update();
    requestAnimationFrame(loop);
}

loop();
