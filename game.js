class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.bird = {
            x: 150,
            y: this.canvas.height * 0.2,
            velocity: 0,
            gravity: 0.4,
            jumpForce: -7
        };

        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;

        // Load bird image
        this.birdImage = new Image();
        this.birdImage.src = 'images/bird.svg';

        // Get start button reference
        this.startButton = document.getElementById('startButton');
        
        // Event listeners
        this.setupEventListeners();

        // Initial draw
        this.draw();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.gameStarted || this.gameOver) {
                    this.startGame();
                } else {
                    this.jump();
                }
            }
        });
        
        // Touch/click controls
        const handleTouch = (e) => {
            e.preventDefault();
            if (!this.gameStarted || this.gameOver) {
                this.startGame();
            } else {
                this.jump();
            }
        };
        
        // Separate button click handler
        this.startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startGame();
        });
        
        this.canvas.addEventListener('click', handleTouch);
        this.canvas.addEventListener('touchstart', handleTouch);
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.bird.y = this.canvas.height * 0.2;
        this.bird.velocity = 0;
        this.startButton.style.display = 'none';
        document.getElementById('score').textContent = 'Score: 0';
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

        // Draw game over or start message
        if (this.gameOver) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', 
                            this.canvas.width/2, 
                            this.canvas.height/2);
            this.startButton.style.display = 'block';
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Space or Tap to Play', 
                            this.canvas.width/2, 
                            this.canvas.height/2 + 60);
            this.startButton.style.display = 'block';
        } else {
            this.startButton.style.display = 'none';
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