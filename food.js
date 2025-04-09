class Food {
    constructor(gridSize, cellSize) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.position = { x: 0, y: 0 };
        this.types = [
            { color: '#ff5252', value: 1, size: 0.65, points: 10 },  // Regular (red)
            { color: '#ffeb3b', value: 2, size: 0.75, points: 20 },  // Special (yellow)
            { color: '#2196f3', value: 3, size: 0.8, points: 30 }    // Rare (blue)
        ];
        this.currentType = 0;
        this.pulseValue = 0;
        this.pulseDir = 0.05;
        this.rotationAngle = 0;
        this.sparkles = [];
        this.maxSparkles = 3;
        
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

        // Reset sparkles
        this.sparkles = [];
    }

    draw() {
        const type = this.types[this.currentType];
        
        // Update pulse animation
        this.pulseValue += this.pulseDir;
        if (this.pulseValue > 0.2 || this.pulseValue < 0) {
            this.pulseDir *= -1;
        }
        
        // Update rotation
        this.rotationAngle += 0.02;
        
        // Calculate actual size with pulse effect
        const size = (type.size + this.pulseValue) * this.cellSize;
        
        // Update sparkles
        this.updateSparkles();
        
        push();
        translate(
            this.position.x * this.cellSize + this.cellSize / 2,
            this.position.y * this.cellSize + this.cellSize / 2
        );
        rotate(this.rotationAngle);
        
        // Draw food with glow effect
        noStroke();
        
        // Draw outer glow
        for (let i = 4; i > 0; i--) {
            const alpha = map(i, 4, 0, 30, 100);
            fill(color(type.color + hexAlpha(alpha)));
            circle(0, 0, size + i * 8);
        }
        
        // Draw main food shape
        fill(type.color);
        
        // Draw different shapes based on food type
        if (this.currentType === 0) {
            // Regular food - Circle
            circle(0, 0, size);
        } else if (this.currentType === 1) {
            // Special food - Star
            this.drawStar(0, 0, size/2, size/3, 5);
        } else {
            // Rare food - Diamond
            this.drawDiamond(0, 0, size/2);
        }
        
        // Draw shine effect
        fill(255, 255, 255, 150);
        circle(-size * 0.15, -size * 0.15, size * 0.3);
        
        pop();
        
        // Draw sparkles
        this.drawSparkles();
        
        // Draw points value
        this.drawPoints();
    }

    drawStar(x, y, outerRadius, innerRadius, points) {
        let angle = TWO_PI / points;
        beginShape();
        for (let i = 0; i < TWO_PI; i += angle) {
            let sx = x + cos(i) * outerRadius;
            let sy = y + sin(i) * outerRadius;
            vertex(sx, sy);
            sx = x + cos(i + angle/2) * innerRadius;
            sy = y + sin(i + angle/2) * innerRadius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
    }

    drawDiamond(x, y, size) {
        beginShape();
        vertex(x, y - size);
        vertex(x + size, y);
        vertex(x, y + size);
        vertex(x - size, y);
        endShape(CLOSE);
    }

    updateSparkles() {
        // Remove faded sparkles
        this.sparkles = this.sparkles.filter(s => s.alpha > 0);
        
        // Add new sparkles if needed
        while (this.sparkles.length < this.maxSparkles) {
            const angle = random(TWO_PI);
            const distance = random(this.cellSize * 0.5, this.cellSize);
            this.sparkles.push({
                x: cos(angle) * distance,
                y: sin(angle) * distance,
                alpha: 1,
                size: random(3, 6)
            });
        }
        
        // Update existing sparkles
        this.sparkles.forEach(s => {
            s.alpha -= 0.02;
            s.size *= 0.95;
        });
    }

    drawSparkles() {
        const centerX = this.position.x * this.cellSize + this.cellSize / 2;
        const centerY = this.position.y * this.cellSize + this.cellSize / 2;
        
        this.sparkles.forEach(s => {
            noStroke();
            fill(255, 255, 255, s.alpha * 255);
            circle(centerX + s.x, centerY + s.y, s.size);
        });
    }

    drawPoints() {
        if (this.currentType > 0) {
            const points = this.types[this.currentType].points;
            const x = this.position.x * this.cellSize + this.cellSize / 2;
            const y = this.position.y * this.cellSize - this.cellSize / 3;
            
            textAlign(CENTER, CENTER);
            textSize(this.cellSize * 0.4);
            fill(255, 255, 255, 200);
            text(`+${points}`, x, y);
        }
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
    return hex.length === 1 ? '0' + hex : hex;
} 