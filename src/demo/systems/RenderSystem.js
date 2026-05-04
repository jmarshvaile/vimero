import { POS, BG_COLOR, FG_COLOR, GLYPH } from '../storage/components.js';

export class RenderSystem {
    constructor(engine, canvas, cellSize) {
        this.engine = engine;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.cellSize = cellSize;
        this.view = engine.view([POS, BG_COLOR, FG_COLOR, GLYPH]);
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `bold ${this.cellSize * 0.8}px monospace`;
        this.ctx.textAlign = 'center'; 
        this.ctx.textBaseline = 'middle';

        this.view.fetch((count, columns) => {
            const pos = columns[0], bg = columns[1], fg = columns[2], gly = columns[3];
            for (let i = 0; i < count; i++) {
                const idx = i * 4;
                this.ctx.fillStyle = `rgb(${bg[idx]},${bg[idx+1]},${bg[idx+2]})`;
                this.ctx.fillRect(pos[i * 2], pos[i * 2 + 1], this.cellSize, this.cellSize);
                
                this.ctx.fillStyle = `rgb(${fg[idx]},${fg[idx+1]},${fg[idx+2]})`;
                this.ctx.fillText(String.fromCharCode(gly[i]), pos[i * 2] + (this.cellSize/2), pos[i * 2 + 1] + (this.cellSize/2));
            }
        });
    }
}
