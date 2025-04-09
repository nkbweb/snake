class Game {
    constructor() {
        this.gridSize = 20;
        this.frameRate = 10;
        this.difficulties = {
            easy: {
                initialSpeed: 8,
                speedIncrement: 0.3,
                maxSpeed: 15
            },
            medium: {
                initialSpeed: 10,
                speedIncrement: 0.5,
                maxSpeed: 20
            },
            hard: {
                initialSpeed: 12,
                speedIncrement: 0.7,
                maxSpeed: 25
            }
        };
        this.difficulty = 'medium';
        this.initialSpeed = this.difficulties[this.difficulty].initialSpeed;
        this.speedIncrement = this.difficulties[this.difficulty].speedIncrement;
        this.maxSpeed = this.difficulties[this.difficulty].maxSpeed;
        this.currentSpeed = this.initialSpeed;
        this.score = null;
        this.snake = null;
        this.food = null;
        this.sound = null;
        this.isGameOver = false;
        this.isPaused = false;
        this.isCountingDown = false;
        this.countdownValue = 3;
        this.countdownInterval = null;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.particles = [];
        this.gameOverParticles = [];
        this.snakeTrail = [];
        this.maxTrailLength = 5;
        this.combo = 0;
        this.comboTimer = null;
        this.comboTimeout = 5000; // 5 seconds to maintain combo
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
        
        // Start initial countdown
        this.startCountdown();
    }

    setupEventListeners() {
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => this.restart());
        
        // Settings button and modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettingsBtn = document.getElementById('close-settings');
        const difficultySelect = document.getElementById('difficulty');
        const volumeSlider = document.getElementById('volume');
        
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('show');
            this.isPaused = true;
        });
        
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('show');
            this.isPaused = false;
        });
        
        difficultySelect.value = this.difficulty;
        difficultySelect.addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.sound.setVolume(volume);
        });
        
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

    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.difficulty = difficulty;
            this.initialSpeed = this.difficulties[difficulty].initialSpeed;
            this.speedIncrement = this.difficulties[difficulty].speedIncrement;
            this.maxSpeed = this.difficulties[difficulty].maxSpeed;
            this.currentSpeed = this.initialSpeed;
            frameRate(this.currentSpeed);
        }
    }

    update() {
        if (this.isGameOver || this.isPaused) return;
        
        this.snake.update();
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.alpha > 0;
        });
        
        // Update snake trail
        if (this.snakeTrail.length > this.maxTrailLength) {
            this.snakeTrail.shift();
        }
        this.snakeTrail.push([...this.snake.body]);
        
        // Check if snake ate food
        if (this.snake.eatFood(this.food)) {
            // Calculate points with combo multiplier
            const basePoints = this.food.types[this.food.currentType].points;
            const comboMultiplier = 1 + (this.combo * 0.1); // 10% increase per combo level
            const points = Math.round(basePoints * comboMultiplier);
            
            this.score.increment(points);
            this.updateCombo();
            
            this.createFoodParticles(this.food.position.x, this.food.position.y, this.food.types[this.food.currentType].color);
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
        
        // Update game over particles
        if (this.isGameOver) {
            this.gameOverParticles = this.gameOverParticles.filter(particle => {
                particle.update();
                return particle.alpha > 0;
            });
        }
    }

    draw() {
        background('#191919');
        
        // Draw grid
        this.drawGrid();
        
        // Draw snake trail
        this.drawSnakeTrail();
        
        // Draw food
        this.food.draw();
        
        // Draw snake
        this.snake.draw();
        
        // Draw particles
        this.particles.forEach(particle => particle.draw());
        
        // Draw game over particles
        this.gameOverParticles.forEach(particle => particle.draw());
        
        // Draw game over screen if needed
        if (this.isGameOver) {
            this.drawGameOver();
        }
        
        // Draw pause indicator if needed
        if (this.isPaused && !this.isGameOver) {
            if (this.isCountingDown) {
                this.drawCountdown();
            } else {
                this.drawPauseIndicator();
            }
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

    drawCountdown() {
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);
        
        textAlign(CENTER, CENTER);
        fill(255);
        textSize(width * 0.2);
        text(this.countdownValue, width / 2, height / 2);
        
        textSize(width * 0.05);
        text('Get Ready!', width / 2, height / 2 + 60);
    }

    gameOver() {
        this.isGameOver = true;
        this.score.updateHighScore();
        if (this.sound.isSoundLoaded('gameOver')) {
            this.sound.play('gameOver');
        }
        this.createGameOverParticles();
    }

    restart() {
        this.isGameOver = false;
        this.isPaused = false;
        this.currentSpeed = this.initialSpeed;
        this.combo = 0;
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        let comboElement = document.getElementById('combo-text');
        if (comboElement) {
            comboElement.className = '';
        }
        frameRate(this.currentSpeed);
        this.snake.reset();
        this.food.spawn();
        this.score.reset();
        this.startCountdown();
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

    startCountdown() {
        this.isCountingDown = true;
        this.countdownValue = 3;
        this.isPaused = true;
        
        // Clear any existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue <= 0) {
                clearInterval(this.countdownInterval);
                this.isCountingDown = false;
                this.isPaused = false;
            }
        }, 1000);
    }

    createFoodParticles(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                x * this.cellSize + this.cellSize / 2,
                y * this.cellSize + this.cellSize / 2,
                color
            ));
        }
    }

    createGameOverParticles() {
        const head = this.snake.body[0];
        for (let i = 0; i < 50; i++) {
            this.gameOverParticles.push(new Particle(
                head.x * this.cellSize + this.cellSize / 2,
                head.y * this.cellSize + this.cellSize / 2,
                '#ff5252'
            ));
        }
    }

    drawSnakeTrail() {
        this.snakeTrail.forEach((trail, index) => {
            const alpha = map(index, 0, this.maxTrailLength, 0, 0.2);
            fill(76, 175, 80, alpha * 255);
            noStroke();
            trail.forEach(segment => {
                rect(
                    segment.x * this.cellSize,
                    segment.y * this.cellSize,
                    this.cellSize,
                    this.cellSize,
                    2
                );
            });
        });
    }

    updateCombo() {
        this.combo++;
        
        // Clear existing combo timer
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        // Create combo text element if it doesn't exist
        let comboElement = document.getElementById('combo-text');
        if (!comboElement) {
            comboElement = document.createElement('div');
            comboElement.id = 'combo-text';
            document.getElementById('game-container').appendChild(comboElement);
        }
        
        // Update combo text
        comboElement.textContent = `Combo x${this.combo}!`;
        comboElement.className = this.combo >= 5 ? 'mega-combo' : 'active-combo';
        
        // Reset combo after timeout
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            comboElement.className = '';
        }, this.comboTimeout);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 1;
        this.size = random(4, 8);
        const angle = random(TWO_PI);
        const speed = random(2, 5);
        this.vx = cos(angle) * speed;
        this.vy = sin(angle) * speed;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= 0.02;
        this.size *= 0.95;
    }

    draw() {
        noStroke();
        const c = color(this.color);
        c.setAlpha(this.alpha * 255);
        fill(c);
        circle(this.x, this.y, this.size);
    }
} 