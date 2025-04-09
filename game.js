class Game {
    constructor() {
        this.gridSize = 20;
        this.frameRate = 10;
        this.initialSpeed = 10;
        this.speedIncrement = 0.5;
        this.maxSpeed = 20;
        this.currentSpeed = this.initialSpeed;
        this.score = null;
        this.snake = null;
        this.food = null;
        this.sound = null;
        this.isGameOver = false;
        this.isPaused = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    setup() {
        // Calculate canvas size based on window size
        const size = min(windowWidth * 0.9, windowHeight * 0.7, 600);
        this.canvas = createCanvas(size, size);
        this.canvas.parent('canvas-container');
        
        // Calculate grid cell size based on canvas size
        this.cellSize = width / this.gridSize;
        
        // Initialize game components
        this.score = new Score();
        this.snake = new Snake(this.gridSize, this.cellSize);
        this.food = new Food(this.gridSize, this.cellSize);
        this.sound = new SoundManager();
        
        // Set initial frame rate
        frameRate(this.currentSpeed);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => this.restart());
        
        // Mute button
        const muteBtn = document.getElementById('mute-btn');
        muteBtn.addEventListener('click', () => {
            if (this.sound.areAllSoundsLoaded()) {
                this.sound.toggleMute();
                muteBtn.textContent = this.sound.isMuted ? '🔇 Muted' : '🔊 Sound';
                muteBtn.classList.toggle('muted', this.sound.isMuted);
            } else {
                console.warn('Sounds are still loading...');
            }
        });
        
        // Mobile controls
        if (this.isMobile) {
            document.getElementById('up-btn').addEventListener('click', () => {
                if (this.sound.isSoundLoaded('move')) {
                    this.snake.changeDirection(0, -1);
                    this.sound.play('move');
                }
            });
            document.getElementById('down-btn').addEventListener('click', () => {
                if (this.sound.isSoundLoaded('move')) {
                    this.snake.changeDirection(0, 1);
                    this.sound.play('move');
                }
            });
            document.getElementById('left-btn').addEventListener('click', () => {
                if (this.sound.isSoundLoaded('move')) {
                    this.snake.changeDirection(-1, 0);
                    this.sound.play('move');
                }
            });
            document.getElementById('right-btn').addEventListener('click', () => {
                if (this.sound.isSoundLoaded('move')) {
                    this.snake.changeDirection(1, 0);
                    this.sound.play('move');
                }
            });
        }
        
        // Add keyboard event listener for pause
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.togglePause();
            }
        });
    }

    update() {
        if (this.isGameOver || this.isPaused) return;
        
        this.snake.update();
        
        // Check if snake ate food
        if (this.snake.eatFood(this.food)) {
            this.score.increment();
            this.food.spawn(this.snake.body);
            this.increaseSpeed();
            
            // Play appropriate sound based on food type if sounds are loaded
            if (this.food.currentType === 0 && this.sound.isSoundLoaded('eat')) {
                this.sound.play('eat');
            } else if (this.sound.isSoundLoaded('powerup')) {
                this.sound.play('powerup');
            }
        }
        
        // Check for collisions
        if (this.snake.checkCollision()) {
            this.gameOver();
        }
    }

    draw() {
        background('#191919');
        
        // Draw grid
        this.drawGrid();
        
        // Draw food
        this.food.draw();
        
        // Draw snake
        this.snake.draw();
        
        // Draw game over screen if needed
        if (this.isGameOver) {
            this.drawGameOver();
        }
        
        // Draw pause indicator if needed
        if (this.isPaused && !this.isGameOver) {
            this.drawPauseIndicator();
        }
    }

    drawGrid() {
        stroke(50);
        strokeWeight(0.5);
        
        // Draw vertical lines
        for (let i = 0; i <= this.gridSize; i++) {
            line(i * this.cellSize, 0, i * this.cellSize, height);
        }
        
        // Draw horizontal lines
        for (let i = 0; i <= this.gridSize; i++) {
            line(0, i * this.cellSize, width, i * this.cellSize);
        }
    }

    drawGameOver() {
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);
        
        textAlign(CENTER, CENTER);
        fill(255, 82, 82);
        textSize(width * 0.1);
        text('GAME OVER', width / 2, height / 2 - 40);
        
        fill(255);
        textSize(width * 0.05);
        text(`Score: ${this.score.current}`, width / 2, height / 2 + 20);
        
        textSize(width * 0.03);
        text('Press RESTART to play again', width / 2, height / 2 + 60);
    }

    drawPauseIndicator() {
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);
        
        textAlign(CENTER, CENTER);
        fill(255);
        textSize(width * 0.08);
        text('PAUSED', width / 2, height / 2);
        
        textSize(width * 0.03);
        text('Press SPACE to continue', width / 2, height / 2 + 40);
    }

    gameOver() {
        this.isGameOver = true;
        this.score.updateHighScore();
        if (this.sound.isSoundLoaded('gameOver')) {
            this.sound.play('gameOver');
        }
    }

    restart() {
        this.isGameOver = false;
        this.isPaused = false;
        this.currentSpeed = this.initialSpeed;
        frameRate(this.currentSpeed);
        this.snake.reset();
        this.food.spawn();
        this.score.reset();
    }

    togglePause() {
        if (!this.isGameOver) {
            this.isPaused = !this.isPaused;
        }
    }

    increaseSpeed() {
        if (this.currentSpeed < this.maxSpeed) {
            this.currentSpeed += this.speedIncrement;
            frameRate(this.currentSpeed);
        }
    }

    windowResized() {
        // Recalculate canvas size
        const size = min(windowWidth * 0.9, windowHeight * 0.7, 600);
        resizeCanvas(size, size);
        this.cellSize = width / this.gridSize;
        
        // Update position of food and snake
        this.food.updateCellSize(this.cellSize);
        this.snake.updateCellSize(this.cellSize);
    }
} 