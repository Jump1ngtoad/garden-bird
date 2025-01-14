class Bird {
    constructor(canvas) {
        this.x = 150;
        this.y = canvas.height * 0.2;
        this.velocity = 0;
        this.gravity = 0.4;
        this.jumpForce = -7;
        this.size = 60;
        
        // Bird images and animation
        this.images = [new Image(), new Image()];
        this.currentFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 10;
        this.color = 'orange';
        
        this.loadImages();
    }

    loadImages() {
        this.images[0].src = 'images/bird-orange-1.svg';
        this.images[1].src = 'images/bird-orange-2.svg';
    }

    changeColor(color) {
        this.color = color;
        if (color === 'blue') {
            this.images[0].src = 'images/bird-blue-1.svg';
            this.images[1].src = 'images/bird-blue-2.svg';
        } else {
            this.images[0].src = 'images/bird-orange-1.svg';
            this.images[1].src = 'images/bird-orange-2.svg';
        }
    }

    jump() {
        this.velocity = this.jumpForce;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    }

    updateAnimation(speedMultiplier) {
        const baseSpeed = 13;
        const speedEffect = 3;
        this.animationSpeed = Math.max(8, baseSpeed - (speedMultiplier - 1) * speedEffect);
        
        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.currentFrame = this.currentFrame === 0 ? 1 : 0;
            this.frameCount = 0;
        }
    }
} 