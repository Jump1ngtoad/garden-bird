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

        // Load bird images properly
        this.birdImages = [new Image(), new Image()];
        this.birdImages[0].onload = () => this.draw();  // Redraw when images load
        this.birdImages[1].onload = () => this.draw();
        this.birdImages[0].src = 'images/bird-orange-1.svg';
        this.birdImages[1].src = 'images/bird-orange-2.svg';
        this.currentBirdFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 10;  // Adjust this for flapping speed

        // Get start button reference
        this.startButton = document.getElementById('startButton');
        
        // Event listeners
        this.setupEventListeners();

        // Initial draw
        this.draw();

        // Add speed properties
        this.baseSpeed = 2;
        this.speedMultiplier = 1;
        this.speedIncreaseInterval = 5;  // Changed from 10 to 5 (increase speed every 5 points)
        this.maxSpeedMultiplier = 4;     // Increased from 3 to 4 (higher max speed)

        // Add bird size property
        this.birdSize = 60; // Doubled from 30 to 60

        // Add animation frame ID tracking
        this.animationFrameId = null;

        // Add color state
        this.birdColor = 'orange'; // default color
        
        // Get color button reference
        this.colorButton = document.getElementById('colorButton');
        
        // Add color button listener
        this.colorButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleBirdColor();
        });

        // Simplify ability tracking
        this.canUseAbility = true;
        this.isUsingAbility = false;
        this.hasPassedWallWhilePhasing = false;
        this.normalSpeed = 2;

        // Add recharge properties
        this.abilityRechargeTime = 10; // seconds
        this.abilityTimer = null;
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
            } else if (e.code === 'KeyE') {
                e.preventDefault();
                this.toggleBirdColor();
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

        // Remove or modify the right click listener to just prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();  // Just prevent the context menu from showing
        });

        // Add right click listener for abilities
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.gameStarted && !this.gameOver && this.canUseAbility) {
                if (this.birdColor === 'orange') {
                    this.startPhasing();
                } else {
                    this.startSlowdown();
                }
            }
        });
    }

    startGame() {
        // Cancel any existing game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.bird.y = this.canvas.height * 0.2;
        this.bird.velocity = 0;
        this.speedMultiplier = 1;
        this.startButton.style.display = 'none';
        document.getElementById('score').textContent = 'Score: 0';
        
        // Clear any existing ability timer
        if (this.abilityTimer) {
            clearTimeout(this.abilityTimer);
        }
        this.canUseAbility = true;
        this.isUsingAbility = false;
        this.baseSpeed = this.normalSpeed;

        // Start game loop
        this.gameLoop();
    }

    gameLoop() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
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

        // Update animation speed based on game speed
        this.updateAnimationSpeed();

        // Update bird animation
        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.currentBirdFrame = this.currentBirdFrame === 0 ? 1 : 0;  // Toggle between 0 and 1
            this.frameCount = 0;
        }

        // Update bird position
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Calculate current speed with steeper increase
        this.speedMultiplier = Math.min(
            1 + (this.score / this.speedIncreaseInterval) * 0.8,  // Changed from 0.5 to 0.8
            this.maxSpeedMultiplier
        );
        const currentSpeed = this.baseSpeed * this.speedMultiplier;

        // Create new obstacles
        if (this.obstacles.length === 0 || 
            this.obstacles[this.obstacles.length - 1].x < this.canvas.width - 300) {
            this.createObstacle();
        }

        // Update obstacles with current speed
        this.obstacles.forEach((obstacle) => {
            obstacle.x -= currentSpeed;

            // Simplified phasing check
            if (this.isUsingAbility && this.birdColor === 'orange') {
                // Let the bird phase through while ability is active
                return;
            }

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
        if (this.isUsingAbility && this.birdColor === 'orange') return false;
        return (this.bird.x + this.birdSize > obstacle.x && 
                this.bird.x < obstacle.x + obstacle.width && 
                (this.bird.y < obstacle.gapTop || this.bird.y + this.birdSize > obstacle.gapBottom));
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bird with current animation frame
        this.ctx.drawImage(
            this.birdImages[this.currentBirdFrame], 
            this.bird.x, 
            this.bird.y, 
            this.birdSize, 
            this.birdSize
        );

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

        // Draw ability indicator
        if (this.gameStarted && !this.gameOver) {
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'right';
            if (this.canUseAbility) {
                this.ctx.fillStyle = '#3498db';
                const abilityText = this.birdColor === 'orange' ? 
                    'Phase (Right Click): Ready' : 
                    'Slow Time (Right Click): Ready';
                this.ctx.fillText(abilityText, this.canvas.width - 20, 90);
            } else {
                this.ctx.fillStyle = '#95a5a6';
                const timeLeft = Math.ceil((this.abilityRechargeTime * 1000 - 
                    (Date.now() - this.abilityTimer._idleStart)) / 1000);
                const abilityText = this.birdColor === 'orange' ? 
                    `Phase (Right Click): ${timeLeft}s` : 
                    `Slow Time (Right Click): ${timeLeft}s`;
                this.ctx.fillText(abilityText, this.canvas.width - 20, 90);
            }
        }

        // Only show transparency effect for orange bird phasing
        if (this.isUsingAbility && this.birdColor === 'orange') {
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(
                this.birdImages[this.currentBirdFrame], 
                this.bird.x, 
                this.bird.y, 
                this.birdSize, 
                this.birdSize
            );
            this.ctx.globalAlpha = 1.0;
        }

        // Add speed indicator in bottom left
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            const currentSpeed = this.baseSpeed * this.speedMultiplier;
            this.ctx.fillText(`Current Speed: ${currentSpeed.toFixed(1)}`, 
                            20,  // x position
                            this.canvas.height - 20);  // y position, 20px from bottom
        }
    }

    startPhasing() {
        if (this.canUseAbility) {
            this.isUsingAbility = true;
            this.canUseAbility = false;
            this.hasPassedWallWhilePhasing = false;

            // Start recharge timer
            this.abilityTimer = setTimeout(() => {
                if (!this.gameOver) {
                    this.canUseAbility = true;
                    this.isUsingAbility = false;  // Make sure to reset this
                }
            }, this.abilityRechargeTime * 1000);

            // Set a timer to end phasing after a short duration
            setTimeout(() => {
                this.isUsingAbility = false;
            }, 1000);  // Phase duration of 1 second
        }
    }

    startSlowdown() {
        if (this.canUseAbility) {
            this.isUsingAbility = true;
            this.canUseAbility = false;
            this.baseSpeed = this.baseSpeed * 0.5;

            // Reset speed after 3 seconds
            setTimeout(() => {
                this.baseSpeed = this.normalSpeed;
                this.isUsingAbility = false;
            }, 3000);

            // Start recharge timer
            this.abilityTimer = setTimeout(() => {
                if (!this.gameOver) {
                    this.canUseAbility = true;
                }
            }, this.abilityRechargeTime * 1000);
        }
    }

    toggleBirdColor() {
        // Toggle between orange and blue with proper image loading
        if (this.birdColor === 'orange') {
            this.birdImages[0].onload = () => this.draw();
            this.birdImages[1].onload = () => this.draw();
            this.birdImages[0].src = 'images/bird-blue-1.svg';
            this.birdImages[1].src = 'images/bird-blue-2.svg';
            this.birdColor = 'blue';
        } else {
            this.birdImages[0].onload = () => this.draw();
            this.birdImages[1].onload = () => this.draw();
            this.birdImages[0].src = 'images/bird-orange-1.svg';
            this.birdImages[1].src = 'images/bird-orange-2.svg';
            this.birdColor = 'orange';
        }
    }

    // Add method to change animation speed based on current game speed
    updateAnimationSpeed() {
        // Adjust these values to change animation speed
        const baseSpeed = 10;  // Higher number = slower flapping
        const speedEffect = 3;  // How much speed affects flapping
        this.animationSpeed = Math.max(8, baseSpeed - (this.speedMultiplier - 1) * speedEffect);
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
};