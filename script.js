let comboCount = 0;
let comboTimer = null;
const COMBO_TIMEOUT = 2000; // 2 seconds to maintain combo

function updateComboText() {
    const comboText = document.getElementById('combo-text');
    
    if (comboCount > 0) {
        comboText.textContent = `${comboCount}x COMBO!`;
        comboText.classList.add('active-combo');
        
        if (comboCount >= 5) {
            comboText.classList.add('mega-combo');
            comboText.classList.remove('active-combo');
        } else {
            comboText.classList.remove('mega-combo');
        }
    } else {
        comboText.classList.remove('active-combo', 'mega-combo');
    }
}

function incrementCombo() {
    comboCount++;
    clearTimeout(comboTimer);
    
    comboTimer = setTimeout(() => {
        comboCount = 0;
        updateComboText();
    }, COMBO_TIMEOUT);
    
    updateComboText();
}

function resetCombo() {
    comboCount = 0;
    clearTimeout(comboTimer);
    updateComboText();
}

// Add this to your existing success/failure handling code
function handleSuccess() {
    incrementCombo();
    // ... existing success handling code ...
}

function handleFailure() {
    resetCombo();
    // ... existing failure handling code ...
} 