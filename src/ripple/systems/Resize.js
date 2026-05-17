export class Resize {
    constructor() {
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;
    }

    update() {
        if (window.innerWidth !== this.lastWidth || window.innerHeight !== this.lastHeight) {
            this.lastWidth = window.innerWidth;
            this.lastHeight = window.innerHeight;
            location.reload();
        }
    }
}
