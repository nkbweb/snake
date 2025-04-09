class Food {
    constructor(gridSize, cellSize) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.position = { x: 0, y: 0 };
        this.types = [
            { color: '#ff5252', value: 1, size: 0.65 },  // Regular (red)
            { color: '#ffeb3b', value: 2, size: 0.75 },  // Special (yellow)
            { color: '#2196f3', value: 3, size: 0.8 }    // Rare (blue)
        ];
        this.currentType = 0;
        this.pulseValue = 0;
        this.pulseDir = 0.05;
        
        // Initial spawn
        this.spawn();
    }

    spawn(snakeBody = []) {
        let validPosition = false;
        
        // Choose random position until we find one that doesn't overlap with the snake
        while (!validPosition) {
            this.position = {
                x: Math.floor(random(this.gridSize)),
                y: Math.floor(random(this.gridSize))
            };
            
            validPosition = true;
            
            // Check against all snake body segments
            if (snakeBody) {
                for (const segment of snakeBody) {
                    if (segment.x === this.position.x && segment.y === this.position.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
        
        // Determine food type based on randomness
        const rand = random(1);
        if (rand < 0.7) {
            this.currentType = 0; // 70% chance of regular food
        } else if (rand < 0.95) {
            this.currentType = 1; // 25% chance of special food
        } else {
            this.currentType = 2; // 5% chance of rare food
        }
    }

    draw() {
        const type = this.types[this.currentType];
        
        // Update pulse animation
        this.pulseValue += this.pulseDir;
        if (this.pulseValue > 0.2 || this.pulseValue < 0) {
            this.pulseDir *= -1;
        }
        
        // Calculate actual size with pulse effect
        const size = (type.size + this.pulseValue) * this.cellSize;
        
        // Draw food with glow effect
        noStroke();
        
        // Draw glow
        for (let i = 3; i > 0; i--) {
            const alpha = map(i, 3, 0, 50, 150);
            fill(color(type.color + hexAlpha(alpha)));
            ellipse(
                this.position.x * this.cellSize + this.cellSize / 2, 
                this.position.y * this.cellSize + this.cellSize / 2, 
                size + i * 5
            );
        }
        
        // Draw main food circle
        fill(type.color);
        ellipse(
            this.position.x * this.cellSize + this.cellSize / 2, 
            this.position.y * this.cellSize + this.cellSize / 2, 
            size
        );
        
        // Draw shine effect
        fill(255, 255, 255, 150);
        ellipse(
            this.position.x * this.cellSize + this.cellSize * 0.35, 
            this.position.y * this.cellSize + this.cellSize * 0.35, 
            size * 0.3
        );
    }

    getValue() {
        return this.types[this.currentType].value;
    }

    updateCellSize(cellSize) {
        this.cellSize = cellSize;
    }
}

// Helper function to convert alpha decimal to hex for color strings
function hexAlpha(alpha) {
    const hex = Math.floor(alpha).toString(16);
    return hex.length === 1 ? hex + hex : hex;
} 