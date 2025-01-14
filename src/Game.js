import { GameConfig } from './Config.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize all properties first
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.animationFrameId = null;
        this.currentBirdFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 10;
        this.birdColor = 'orange';
        this.baseSpeed = 2;
        this.speedMultiplier = 1;
        this.normalSpeed = 2;
        this.canUseAbility = true;
        this.isUsingAbility = false;
        this.abilityRechargeTime = 10;
        this.abilityTimer = null;
        this.currentCooldown = 0;

        // Initialize fontSize
        this.fontSize = {
            large: 48,
            medium: 24,
            small: 16
        };

        // Initialize bird
        this.bird = {
            x: 150,
            y: 0,  // Will be set after canvas setup
            velocity: 0,
            gravity: 0.4,
            jumpForce: -7
        };

        // Load images
        this.birdImages = [new Image(), new Image()];
        this.birdImages[0].onload = () => this.draw();
        this.birdImages[1].onload = () => this.draw();
        this.birdImages[0].src = 'images/bird-orange-1.svg';
        this.birdImages[1].src = 'images/bird-orange-2.svg';

        // Now set up canvas and scaling
        this.setupResponsiveCanvas();
        window.addEventListener('resize', () => this.setupResponsiveCanvas());

        // Set bird's initial y position after canvas setup
        this.bird.y = this.canvas.height * 0.2;

        // Get DOM elements
        this.startButton = document.getElementById('startButton');
        this.colorButton = document.getElementById('colorButton');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial draw
        this.draw();

        // Add missing speed-related properties
        this.speedIncreaseInterval = GameConfig.speed.increaseInterval;
        this.maxSpeedMultiplier = GameConfig.speed.maxMultiplier;

        // Add obstacle properties
        this.obstacleSpawnDistance = GameConfig.obstacles.spawnDistance;
        this.gapSize = GameConfig.obstacles.gapSize;
        this.obstacleWidth = GameConfig.obstacles.width;
    }

    setupResponsiveCanvas() {
        try {
            const container = this.canvas.parentElement;
            if (!container) {
                console.error('Canvas container not found');
                return;
            }

            const containerWidth = container.clientWidth - 20;
            let canvasWidth = Math.min(containerWidth, GameConfig.canvas.maxWidth);
            canvasWidth = Math.max(canvasWidth, GameConfig.canvas.minWidth);
            let canvasHeight = canvasWidth * (3/4);

            console.log('Canvas dimensions:', canvasWidth, canvasHeight); // Debug log

            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            
            // Scale game elements
            this.birdSize = canvasWidth * 0.075;
            if (this.bird) {
                this.bird.x = canvasWidth * 0.1875;
            }

            this.fontSize = {
                large: Math.floor(canvasWidth * 0.06),
                medium: Math.floor(canvasWidth * 0.03),
                small: Math.floor(canvasWidth * 0.02)
            };

            this.draw();
        } catch (error) {
            console.error('Error in setupResponsiveCanvas:', error);
        }
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
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Reset game state
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.speedMultiplier = 1;
        this.baseSpeed = this.normalSpeed;

        // Reset bird position using canvas dimensions
        this.bird.x = this.canvas.width * 0.1875;
        this.bird.y = this.canvas.height * 0.2;
        this.bird.velocity = 0;

        // Reset UI
        this.startButton.style.display = 'none';
        document.getElementById('score').textContent = 'Score: 0';

        // Reset abilities
        if (this.abilityTimer) {
            clearTimeout(this.abilityTimer);
        }
        this.canUseAbility = true;
        this.isUsingAbility = false;
        this.currentCooldown = 0;

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
        // Use config values for consistency
        const gap = this.gapSize;
        const gapPosition = Math.random() * (this.canvas.height - gap);
        
        this.obstacles.push({
            x: this.canvas.width,
            gapTop: gapPosition,
            gapBottom: gapPosition + gap,
            width: this.obstacleWidth,
            passed: false
        });

        console.log('Obstacle created:', this.obstacles[this.obstacles.length - 1]); // Debug log
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
            1 + (this.score / this.speedIncreaseInterval) * 0.7,  // Reduced from 0.8 to 0.7
            this.maxSpeedMultiplier
        );
        const currentSpeed = this.baseSpeed * this.speedMultiplier;

        // Debug log for obstacle creation check
        console.log('Obstacle check:', {
            obstaclesLength: this.obstacles.length,
            lastObstacleX: this.obstacles.length ? this.obstacles[this.obstacles.length - 1].x : 'no obstacles',
            spawnThreshold: this.canvas.width - this.obstacleSpawnDistance
        });

        // Create new obstacles with more explicit condition
        if (this.gameStarted && (
            this.obstacles.length === 0 || 
            this.obstacles[this.obstacles.length - 1].x < this.canvas.width - this.obstacleSpawnDistance
        )) {
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

        // Update cooldown timer
        if (this.currentCooldown > 0) {
            this.currentCooldown = Math.max(0, this.currentCooldown - (1/60));  // Assuming 60fps
        }
    }

    checkCollision(obstacle) {
        if (this.isUsingAbility && this.birdColor === 'orange') return false;
        
        // Add smaller hitbox for more precise collisions
        const hitboxBuffer = 5;  // Reduce this number to allow flying closer to walls
        return (this.bird.x + this.birdSize - hitboxBuffer > obstacle.x && 
                this.bird.x + hitboxBuffer < obstacle.x + obstacle.width && 
                (this.bird.y + hitboxBuffer < obstacle.gapTop || 
                 this.bird.y + this.birdSize - hitboxBuffer > obstacle.gapBottom));
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
            this.ctx.font = `${this.fontSize.large}px Barriecito`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', 
                            this.canvas.width/2, 
                            this.canvas.height/2);
            this.startButton.style.display = 'block';
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = `${this.fontSize.medium}px Barriecito`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Space or Tap to Play', 
                            this.canvas.width/2, 
                            this.canvas.height/2 + 10);
            this.startButton.style.display = 'block';
        } else {
            this.startButton.style.display = 'none';
        }

        // Draw ability indicator with countdown
        if (this.gameStarted && !this.gameOver) {
            this.ctx.font = '16px Barriecito';
            this.ctx.textAlign = 'right';
            if (this.canUseAbility) {
                this.ctx.fillStyle = '#3498db';
                const abilityText = this.birdColor === 'orange' ? 
                    'Phase (Right Click): Ready' : 
                    'Slow Time (Right Click): Ready';
                this.ctx.fillText(abilityText, this.canvas.width - 20, 90);
            } else {
                this.ctx.fillStyle = '#95a5a6';
                const timeLeft = Math.ceil(this.currentCooldown);
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
            this.ctx.font = '16px Barriecito';
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
            this.currentCooldown = this.abilityRechargeTime;

            // Start recharge timer
            this.abilityTimer = setTimeout(() => {
                if (!this.gameOver) {
                    this.canUseAbility = true;
                }
            }, this.abilityRechargeTime * 1000);

            // Set a timer to end phasing after 3 seconds
            setTimeout(() => {
                this.isUsingAbility = false;
            }, 3000);  // Phase duration of 3 seconds
        }
    }

    startSlowdown() {
        if (this.canUseAbility) {
            this.isUsingAbility = true;
            this.canUseAbility = false;
            this.currentCooldown = this.abilityRechargeTime;
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
        const baseSpeed = 13;  // Higher number = slower flapping
        const speedEffect = 3;  // How much speed affects flapping
        this.animationSpeed = Math.max(8, baseSpeed - (this.speedMultiplier - 1) * speedEffect);
    }
}