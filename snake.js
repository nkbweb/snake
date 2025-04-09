class Snake {
    constructor(gridSize, cellSize) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.reset();
    }

    reset() {
        // Start with a snake of length 3 in the middle of the grid
        const midPoint = Math.floor(this.gridSize / 2);
        
        this.body = [
            { x: midPoint, y: midPoint },
            { x: midPoint - 1, y: midPoint },
            { x: midPoint - 2, y: midPoint }
        ];
        
        // Initial direction: right
        this.xDir = 1;
        this.yDir = 0;
        
        // Flag to check if direction was already changed this frame
        this.directionChanged = false;
        
        // Flag to check if snake is growing this frame
        this.growing = false;
    }

    update() {
        // If the snake is growing, don't remove the tail
        if (!this.growing) {
            this.body.pop();
        } else {
            this.growing = false;
        }
        
        // Calculate new head position
        const head = { x: this.body[0].x + this.xDir, y: this.body[0].y + this.yDir };
        
        // Wrap around screen edges
        if (head.x >= this.gridSize) head.x = 0;
        if (head.x < 0) head.x = this.gridSize - 1;
        if (head.y >= this.gridSize) head.y = 0;
        if (head.y < 0) head.y = this.gridSize - 1;
        
        // Add new head to the beginning of the body array
        this.body.unshift(head);
        
        // Reset direction change flag for the next frame
        this.directionChanged = false;
    }

    draw() {
        // Draw snake body
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            
            // Head is green, body gets darker towards the tail
            if (i === 0) {
                fill('#4CAF50'); // Head color (green)
            } else {
                const alpha = map(i, 0, this.body.length, 255, 150);
                fill(76, 175, 80, alpha); // Body gradient
            }
            
            noStroke();
            rect(
                segment.x * this.cellSize, 
                segment.y * this.cellSize, 
                this.cellSize, 
                this.cellSize, 
                i === 0 ? 5 : 2 // Rounded corners, more rounded for the head
            );
            
            // Draw eyes on the head
            if (i === 0) {
                fill(0);
                const eyeSize = this.cellSize * 0.15;
                const eyeOffset = this.cellSize * 0.25;
                
                // Adjust eye positions based on direction
                if (this.xDir === 1) {
                    // Facing right
                    ellipse(segment.x * this.cellSize + this.cellSize * 0.7, segment.y * this.cellSize + eyeOffset, eyeSize);
                    ellipse(segment.x * this.cellSize + this.cellSize * 0.7, segment.y * this.cellSize + this.cellSize - eyeOffset, eyeSize);
                } else if (this.xDir === -1) {
                    // Facing left
                    ellipse(segment.x * this.cellSize + this.cellSize * 0.3, segment.y * this.cellSize + eyeOffset, eyeSize);
                    ellipse(segment.x * this.cellSize + this.cellSize * 0.3, segment.y * this.cellSize + this.cellSize - eyeOffset, eyeSize);
                } else if (this.yDir === 1) {
                    // Facing down
                    ellipse(segment.x * this.cellSize + eyeOffset, segment.y * this.cellSize + this.cellSize * 0.7, eyeSize);
                    ellipse(segment.x * this.cellSize + this.cellSize - eyeOffset, segment.y * this.cellSize + this.cellSize * 0.7, eyeSize);
                } else if (this.yDir === -1) {
                    // Facing up
                    ellipse(segment.x * this.cellSize + eyeOffset, segment.y * this.cellSize + this.cellSize * 0.3, eyeSize);
                    ellipse(segment.x * this.cellSize + this.cellSize - eyeOffset, segment.y * this.cellSize + this.cellSize * 0.3, eyeSize);
                }
            }
        }
    }

    changeDirection(x, y) {
        // Prevent changing to opposite direction (which would cause instant death)
        if (this.directionChanged) return;
        
        // Can't move in the opposite direction
        if (x !== 0 && x === -this.xDir) return;
        if (y !== 0 && y === -this.yDir) return;
        
        this.xDir = x;
        this.yDir = y;
        this.directionChanged = true;
    }

    grow() {
        this.growing = true;
    }

    eatFood(food) {
        const head = this.body[0];
        
        // Check if head is at the same position as food
        if (head.x === food.position.x && head.y === food.position.y) {
            this.grow();
            return true;
        }
        
        return false;
    }

    checkCollision() {
        const head = this.body[0];
        
        // Check collision with itself (starting from index 4 since the first few segments cannot collide)
        for (let i = 4; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        
        return false;
    }

    updateCellSize(cellSize) {
        this.cellSize = cellSize;
    }
} 