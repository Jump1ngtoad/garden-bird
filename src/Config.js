export const GameConfig = {
    canvas: {
        width: 800,
        height: 600
    },
    bird: {
        startX: 150,
        size: 60,
        gravity: 0.4,
        jumpForce: -7,
        animationSpeed: {
            base: 13,
            min: 8,
            speedEffect: 3
        }
    },
    obstacles: {
        gapSize: 200,
        width: 50,
        spawnDistance: 300,
        color: '#2ecc71'
    },
    abilities: {
        duration: 3000,
        cooldown: 10000,
        slowdownFactor: 0.5,
        hitboxBuffer: 5
    },
    speed: {
        initial: 2,
        maxMultiplier: 4,
        increaseInterval: 5,
        increaseRate: 0.7
    }
}; 