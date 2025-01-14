class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBird(bird, isPhasing) {
        this.ctx.drawImage(
            bird.images[bird.currentFrame],
            bird.x,
            bird.y,
            bird.size,
            bird.size
        );

        if (isPhasing) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(
                bird.images[bird.currentFrame],
                bird.x,
                bird.y,
                bird.size,
                bird.size
            );
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawObstacles(obstacles) {
        obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapTop);
            this.ctx.fillRect(
                obstacle.x, 
                obstacle.gapBottom, 
                obstacle.width, 
                this.canvas.height - obstacle.gapBottom
            );
        });
    }

    drawUI(game) {
        // ... UI drawing code ...
    }
} 