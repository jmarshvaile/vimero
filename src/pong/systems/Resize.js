export class Resize {
    constructor() {
        this.lastWidth = document.body.clientWidth;
        this.lastHeight = document.body.clientHeight;
    }

    update() {
        if (document.body.clientWidth !== this.lastWidth || document.body.clientHeight !== this.lastHeight) {
            this.lastWidth = document.body.clientWidth;
            this.lastHeight = document.body.clientHeight;
            location.reload();
        }
    }
}
