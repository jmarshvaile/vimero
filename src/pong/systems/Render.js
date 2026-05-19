import { POS, BG, FG, GLYPH, SIZE, FONT_SIZE, FONT_FAMILY, HIDDEN } from '../storage/components.js';

const FONT_FAMILIES = ['monospace', 'sans-serif', 'serif', 'cursive', 'fantasy'];

export class Render {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.view = engine.view([POS, BG, FG, GLYPH, SIZE, FONT_SIZE, FONT_FAMILY, HIDDEN]);
    }

    render() {
        const actualDprX = this.canvas.width / this.canvas.logicalWidth;
        const actualDprY = this.canvas.height / this.canvas.logicalHeight;
        this.ctx.setTransform(actualDprX, 0, 0, actualDprY, 0, 0);

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.logicalWidth, this.canvas.logicalHeight);
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.view.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            const size = columns[4], glySize = columns[5], glyFam = columns[6], hidden = columns[7];

            for (let i = 0; i < count; i++) {
                if (hidden[i] === 1) continue;

                const idx = i * 4;
                const width = size[i * 2];
                const height = size[i * 2 + 1];

                this.ctx.fillStyle = `rgb(${bg[idx]},${bg[idx+1]},${bg[idx+2]})`;
                this.ctx.fillRect(pos[i * 2], pos[i * 2 + 1], width, height);

                const fontFamily = FONT_FAMILIES[glyFam[i]] || 'monospace';
                this.ctx.font = `bold ${glySize[i]}px ${fontFamily}`;

                this.ctx.fillStyle = `rgb(${fg[idx]},${fg[idx+1]},${fg[idx+2]})`;
                this.ctx.fillText(String.fromCharCode(gly[i]), pos[i * 2] + (width/2), pos[i * 2 + 1] + (height/2));
            }
        });
    }
}
