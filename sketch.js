// Global game instance
let game;

// p5.js setup function
function setup() {
    // Create game instance
    game = new Game();
    game.setup();
}

// p5.js draw function
function draw() {
    game.update();
    game.draw();
}

// p5.js windowResized function
function windowResized() {
    game.windowResized();
}

// Keyboard input handling
function keyPressed() {
    // Arrow keys for movement
    if (keyCode === UP_ARROW || keyCode === 87) { // Up arrow or W
        game.snake.changeDirection(0, -1);
        if (game.sound.isSoundLoaded('move')) {
            game.sound.play('move');
        }
    } else if (keyCode === DOWN_ARROW || keyCode === 83) { // Down arrow or S
        game.snake.changeDirection(0, 1);
        if (game.sound.isSoundLoaded('move')) {
            game.sound.play('move');
        }
    } else if (keyCode === LEFT_ARROW || keyCode === 65) { // Left arrow or A
        game.snake.changeDirection(-1, 0);
        if (game.sound.isSoundLoaded('move')) {
            game.sound.play('move');
        }
    } else if (keyCode === RIGHT_ARROW || keyCode === 68) { // Right arrow or D
        game.snake.changeDirection(1, 0);
        if (game.sound.isSoundLoaded('move')) {
            game.sound.play('move');
        }
    } 
    
    // Spacebar for pause
    if (keyCode === 32) { // Spacebar
        game.togglePause();
    }
    
    // R key for restart
    if (keyCode === 82) { // R key
        game.restart();
    }
    
    // M key for muting/unmuting sound
    if (keyCode === 77) { // M key
        if (game.sound.areAllSoundsLoaded()) {
            game.sound.toggleMute();
            const muteBtn = document.getElementById('mute-btn');
            if (muteBtn) {
                muteBtn.textContent = game.sound.isMuted ? '🔇 Muted' : '🔊 Sound';
                muteBtn.classList.toggle('muted', game.sound.isMuted);
            }
        }
    }
    
    // Prevent default behavior for arrow keys and space to avoid page scrolling
    if ([32, 37, 38, 39, 40].includes(keyCode)) {
        return false;
    }
}

// Add touch swipe controls for mobile
document.addEventListener('DOMContentLoaded', function() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    const gameContainer = document.getElementById('canvas-container');
    
    if (!gameContainer) return;
    
    // Touch start event
    gameContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    // Touch end event
    gameContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);
    
    // Handle swipe direction
    function handleSwipe() {
        const delX = touchEndX - touchStartX;
        const delY = touchEndY - touchStartY;
        
        // Min swipe distance
        const minSwipeDistance = 30;
        
        // Determine direction based on which axis had greater movement
        if (Math.abs(delX) > Math.abs(delY)) {
            // Horizontal swipe
            if (Math.abs(delX) > minSwipeDistance) {
                if (delX > 0) {
                    // Right swipe
                    game.snake.changeDirection(1, 0);
                } else {
                    // Left swipe
                    game.snake.changeDirection(-1, 0);
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(delY) > minSwipeDistance) {
                if (delY > 0) {
                    // Down swipe
                    game.snake.changeDirection(0, 1);
                } else {
                    // Up swipe
                    game.snake.changeDirection(0, -1);
                }
            }
        }
    }
    
    // Prevent scrolling when touching the canvas
    gameContainer.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}); 