export class InputSystem {
    constructor() {
        this.mouseX = -1;
        this.mouseY = -1;

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
}