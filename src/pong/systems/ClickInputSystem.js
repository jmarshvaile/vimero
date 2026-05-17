export class ClickInputSystem {
    constructor(canvas) {
        this.clickX = -1;
        this.clickY = -1;
        this.hasClick = false;

        canvas.addEventListener('mousedown', (e) => {
            this.clickX = e.clientX;
            this.clickY = e.clientY;
            this.hasClick = true;
        });
    }

    consume() {
        if (!this.hasClick) return null;
        this.hasClick = false;
        return { x: this.clickX, y: this.clickY };
    }
}
