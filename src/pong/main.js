import { Engine } from '../vimero/index.js';
import { schema, POS, BG, FG, GLYPH, SIZE, TEXT, FONT, HIDDEN, ACTIVE, TIMER, VELOCITY, DELAY, DEFLECT } from './storage/components.js';

import { Click } from './systems/Click.js';
import { Activate } from './systems/Activate.js';
import { Group } from './systems/Group.js';
import { Clock } from './systems/Clock.js';
import { Theme } from './systems/Theme.js';
import { Movement } from './systems/Movement.js';
import { Boundary } from './systems/Boundary.js';
import { Occupancy } from './systems/Occupancy.js';
import { Render } from './systems/Render.js';
import { Resize } from './systems/Resize.js';
import { Init } from './systems/Init.js';
import { Maintainer } from './systems/Maintainer.js';

const canvas = document.getElementById('stage');

const engine = new Engine(schema);
const click = new Click(canvas);
const activate = new Activate(engine, click);
const group = new Group(engine);
const clock = new Clock(engine);
const theme = new Theme(engine);
const movement = new Movement(engine, canvas);
const boundary = new Boundary(engine, canvas);
const occupancy = new Occupancy(engine);
const render = new Render(engine, canvas);
const resize = new Resize();
const init = new Init(engine, canvas);
const maintainer = new Maintainer(engine, canvas);

const cellSize = 22;
init.fillScreen(cellSize);

function loop() {
    engine.currentTick++;
    activate.update();
    group.update();
    clock.update();
    theme.update();
    movement.update();
    boundary.update();
    maintainer.update(cellSize);
    occupancy.update();
    render.render();
    resize.update();
    requestAnimationFrame(loop);
}

loop();
