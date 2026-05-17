export class Click {
    constructor(canvas) {
        this.events = [];
        this.isDragging = false;
        this.startX = -1;
        this.startY = -1;

        const handleStart = (x, y) => {
            this.isDragging = true;
            this.startX = x;
            this.startY = y;
            this.events.push({ x, y, startX: this.startX, startY: this.startY });
        };

        const handleMove = (x, y) => {
            if (this.isDragging) {
                this.events.push({ x, y, startX: this.startX, startY: this.startY });
            }
        };

        const handleEnd = () => {
            this.isDragging = false;
        };

        // Mouse events
        canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
        canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleEnd);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault(); // Prevent scrolling while dragging
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);
    }

    consume() {
        if (this.events.length === 0) return [];
        const currentEvents = [...this.events];
        this.events = [];
        return currentEvents;
    }
}
