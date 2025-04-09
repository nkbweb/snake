class Score {
    constructor() {
        this.current = 0;
        this.high = this.getStoredHighScore();
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high');
        this.updateDisplay();
    }

    increment() {
        this.current += 1;
        this.updateDisplay();
        
        // Check for new high score
        if (this.current > this.high) {
            this.high = this.current;
            this.updateHighScore();
        }
    }

    reset() {
        this.current = 0;
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

    getStoredHighScore() {
        try {
            const stored = localStorage.getItem('snakeHighScore');
            return stored ? parseInt(stored, 10) : 0;
        } catch (e) {
            console.warn('Could not read high score from localStorage', e);
            return 0;
        }
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