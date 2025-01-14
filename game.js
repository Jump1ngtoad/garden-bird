class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.bird = {
            x: 150,
            y: 300,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10
        };

        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;

        // Load bird image
        this.birdImage = new Image();
        this.birdImage.src = 'images/bird.svg';

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });
        
        document.addEventListener('click', () => this.jump());

        // Start game loop
        this.gameLoop();
    }

    jump() {
        if (!this.gameOver) {
            this.bird.velocity = this.bird.jumpForce;
        }
    }

    createObstacle() {
        const gap = 200;
        const gapPosition = Math.random() * (this.canvas.height - gap);
        
        this.obstacles.push({
            x: this.canvas.width,
            gapTop: gapPosition,
            gapBottom: gapPosition + gap,
            width: 50,
            passed: false
        });
    }

    update() {
        if (this.gameOver) return;

        // Update bird position
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Create new obstacles
        if (this.obstacles.length === 0 || 
            this.obstacles[this.obstacles.length - 1].x < this.canvas.width - 300) {
            this.createObstacle();
        }

        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= 2;

            // Check collision
            if (this.checkCollision(obstacle)) {
                this.gameOver = true;
            }

            // Update score
            if (!obstacle.passed && obstacle.x < this.bird.x) {
                obstacle.passed = true;
                this.score++;
                document.getElementById('score').textContent = `Score: ${this.score}`;
            }
        });

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

        // Check boundaries
        if (this.bird.y > this.canvas.height || this.bird.y < 0) {
            this.gameOver = true;
        }
    }

    checkCollision(obstacle) {
        return (this.bird.x + 30 > obstacle.x && 
                this.bird.x < obstacle.x + obstacle.width && 
                (this.bird.y < obstacle.gapTop || this.bird.y + 30 > obstacle.gapBottom));
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bird
        this.ctx.drawImage(this.birdImage, this.bird.x, this.bird.y, 30, 30);

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapTop);
            this.ctx.fillRect(obstacle.x, obstacle.gapBottom, obstacle.width, 
                            this.canvas.height - obstacle.gapBottom);
        });

        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('Game Over!', 
                            this.canvas.width/2 - 100, 
                            this.canvas.height/2);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
}; 