class Score {
    constructor() {
        this.current = 0;
        this.high = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high');
        this.scoreAnimations = [];
        this.updateDisplay();
    }

    increment(points = 10) {
        this.current += points;
        this.createScoreAnimation(points);
        this.updateDisplay();
        
        // Check for new high score
        if (this.current > this.high) {
            this.high = this.current;
            this.updateHighScore();
        }
    }

    reset() {
        this.current = 0;
        this.scoreAnimations = [];
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.current;
        }
        
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.high;
        }
    }

    updateHighScore() {
        // Update display
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.high;
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('snakeHighScore', this.high.toString());
        } catch (e) {
            console.warn('Could not save high score to localStorage', e);
        }
        
        // Animate high score if it's a new record
        if (this.highScoreElement && this.current >= this.high) {
            this.animateHighScore();
        }
    }

    createScoreAnimation(points) {
        const scoreElement = this.scoreElement;
        if (!scoreElement) return;

        // Create floating score element
        const floatingScore = document.createElement('div');
        floatingScore.className = 'floating-score';
        floatingScore.textContent = `+${points}`;
        
        // Add color class based on points
        if (points >= 30) {
            floatingScore.classList.add('rare');
        } else if (points >= 20) {
            floatingScore.classList.add('special');
        }

        // Position it near the score display
        const rect = scoreElement.getBoundingClientRect();
        floatingScore.style.left = `${rect.left}px`;
        floatingScore.style.top = `${rect.top}px`;

        // Add to document
        document.body.appendChild(floatingScore);

        // Animate and remove
        setTimeout(() => {
            floatingScore.classList.add('animate');
            setTimeout(() => {
                document.body.removeChild(floatingScore);
            }, 1000);
        }, 0);
    }

    animateHighScore() {
        // Simple animation for new high score
        const highScoreElement = this.highScoreElement;
        
        if (!highScoreElement) return;
        
        // Add animation class
        highScoreElement.classList.add('new-high-score');
        
        // Flash effect
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            highScoreElement.style.color = flashCount % 2 === 0 ? '#FFD700' : '#FFFFFF';
            flashCount++;
            
            if (flashCount > 5) {
                clearInterval(flashInterval);
                highScoreElement.style.color = '';
                
                // Remove animation class after a delay
                setTimeout(() => {
                    highScoreElement.classList.remove('new-high-score');
                }, 1000);
            }
        }, 200);
    }
}