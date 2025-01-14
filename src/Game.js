class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.renderer = new Renderer(this.canvas, this.ctx);
        this.bird = new Bird(this.canvas);
        this.abilities = new Abilities();
        this.obstacles = [];
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.baseSpeed = 2;
        this.speedMultiplier = 1;
        
        this.setupEventListeners();
        this.renderer.drawUI(this);
    }

    // ... rest of game logic ...
} 