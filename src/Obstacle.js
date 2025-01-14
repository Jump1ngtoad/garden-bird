class Obstacle {
    constructor(canvas) {
        this.gap = 200;
        this.width = 50;
        this.x = canvas.width;
        this.gapPosition = Math.random() * (canvas.height - this.gap);
        this.gapTop = this.gapPosition;
        this.gapBottom = this.gapPosition + this.gap;
        this.passed = false;
    }

    update(speed) {
        this.x -= speed;
    }

    checkCollision(bird, hitboxBuffer = 5) {
        return (bird.x + bird.size - hitboxBuffer > this.x && 
                bird.x + hitboxBuffer < this.x + this.width && 
                (bird.y + hitboxBuffer < this.gapTop || 
                 bird.y + bird.size - hitboxBuffer > this.gapBottom));
    }
} 