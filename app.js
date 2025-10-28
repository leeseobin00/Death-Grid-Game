// Game State
let gameState = {
    wallet: 100,
    currentBet: 0,
    gridSize: 5,
    multiplier: 1.0,
    tilesRevealed: 0,
    gameActive: false,
    grid: [],
    fogTriggered: false,
    soundEnabled: true,
    lastPlayDate: null,
    streak: 0,
    powerups: {
        shield: 0,
        reveal: 0,
        boost: 0
    },
    shieldActive: false,
    combo: 0,
    maxCombo: 0,
    achievements: [],
    totalGamesPlayed: 0,
    totalWinnings: 0,
    highestMultiplier: 0
};

// Audio Context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound Effects
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'harvest':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'death':
            oscillator.frequency.value = 100;
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
            break;
        case 'cashout':
            oscillator.frequency.value = 1200;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'click':
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
    }
}

// Initialize game
function init() {
    loadGameData();
    updateWalletDisplay();
    updateStreakDisplay();
    updatePowerupDisplay();
    setupEventListeners();
    updateLeaderboard();
    updateAchievementsDisplay();
    checkDailyStreak();
    checkAchievements();
}

// Load game data from localStorage
function loadGameData() {
    const savedWallet = localStorage.getItem('reaperWallet');
    const savedStreak = localStorage.getItem('reaperStreak');
    const savedLastPlay = localStorage.getItem('reaperLastPlay');
    const savedPowerups = localStorage.getItem('reaperPowerups');
    const savedAchievements = localStorage.getItem('reaperAchievements');
    const savedStats = localStorage.getItem('reaperStats');
    
    if (savedWallet) {
        gameState.wallet = parseFloat(savedWallet);
    }
    
    if (savedStreak) {
        gameState.streak = parseInt(savedStreak);
    }
    
    if (savedLastPlay) {
        gameState.lastPlayDate = savedLastPlay;
    }
    
    if (savedPowerups) {
        gameState.powerups = JSON.parse(savedPowerups);
    }
    
    if (savedAchievements) {
        gameState.achievements = JSON.parse(savedAchievements);
    }
    
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        gameState.totalGamesPlayed = stats.totalGamesPlayed || 0;
        gameState.totalWinnings = stats.totalWinnings || 0;
        gameState.highestMultiplier = stats.highestMultiplier || 0;
    }
    
    // Auto-refill if wallet is zero
    if (gameState.wallet <= 0) {
        gameState.wallet = 100;
        saveGameData();
    }
}

// Save game data to localStorage
function saveGameData() {
    localStorage.setItem('reaperWallet', gameState.wallet.toFixed(2));
    localStorage.setItem('reaperStreak', gameState.streak);
    if (gameState.lastPlayDate) {
        localStorage.setItem('reaperLastPlay', gameState.lastPlayDate);
    }
    localStorage.setItem('reaperPowerups', JSON.stringify(gameState.powerups));
    localStorage.setItem('reaperAchievements', JSON.stringify(gameState.achievements));
    localStorage.setItem('reaperStats', JSON.stringify({
        totalGamesPlayed: gameState.totalGamesPlayed,
        totalWinnings: gameState.totalWinnings,
        highestMultiplier: gameState.highestMultiplier
    }));
}

// Check and update daily streak
function checkDailyStreak() {
    const today = new Date().toDateString();
    
    if (gameState.lastPlayDate) {
        const lastPlay = new Date(gameState.lastPlayDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlay.toDateString() === yesterday.toDateString()) {
            // Consecutive day
            gameState.streak++;
        } else if (lastPlay.toDateString() !== today) {
            // Streak broken
            gameState.streak = 1;
        }
    } else {
        gameState.streak = 1;
    }
    
    gameState.lastPlayDate = today;
    saveGameData();
    updateStreakDisplay();
}

// Update wallet display
function updateWalletDisplay() {
    document.getElementById('walletAmount').textContent = gameState.wallet.toFixed(2);
}

// Update streak display
function updateStreakDisplay() {
    document.getElementById('streakCount').textContent = gameState.streak;
}

// Setup event listeners
function setupEventListeners() {
    // Grid size selector
    document.querySelectorAll('.grid-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.gridSize = parseInt(btn.dataset.size);
            playSound('click');
        });
    });
    
    // Start button
    document.getElementById('startBtn').addEventListener('click', startGame);
    
    // Cashout button
    document.getElementById('cashoutBtn').addEventListener('click', cashOut);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    // Modal close button
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.add('hidden');
        resetGame();
    });
    
    // Sound toggle
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        gameState.soundEnabled = e.target.checked;
        playSound('click');
    });
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareScore);
    
    // Powerup buttons
    document.getElementById('useShield').addEventListener('click', () => usePowerup('shield'));
    document.getElementById('useReveal').addEventListener('click', () => usePowerup('reveal'));
    document.getElementById('useBoost').addEventListener('click', () => usePowerup('boost'));
}

// Start game
function startGame() {
    const betInput = document.getElementById('betAmount');
    const bet = parseFloat(betInput.value);
    
    // Validate bet
    if (isNaN(bet) || bet < 0.01 || bet > 10) {
        alert('Please enter a bet between 0.01 and 10 ETH');
        return;
    }
    
    if (bet > gameState.wallet) {
        alert('Insufficient funds! Your wallet: ' + gameState.wallet.toFixed(2) + ' ETH');
        return;
    }
    
    // Deduct bet from wallet
    gameState.wallet -= bet;
    gameState.currentBet = bet;
    gameState.multiplier = 1.0;
    gameState.tilesRevealed = 0;
    gameState.gameActive = true;
    gameState.fogTriggered = false;
    gameState.shieldActive = false;
    gameState.combo = 0;
    gameState.totalGamesPlayed++;
    
    updateWalletDisplay();
    saveGameData();
    
    // Generate grid
    generateGrid();
    
    // Update UI
    document.getElementById('gameSetup').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');
    document.getElementById('currentBet').textContent = bet.toFixed(2);
    document.getElementById('powerupControls').classList.remove('hidden');
    updateGameStats();
    updatePowerupDisplay();
    
    playSound('click');
}

// Generate grid
function generateGrid() {
    const size = gameState.gridSize;
    const totalTiles = size * size;
    const reaperCount = Math.floor(totalTiles * 0.2); // 20% reapers
    const soulCount = Math.floor(totalTiles * 0.35); // 35% souls
    const goldenSoulCount = Math.floor(totalTiles * 0.05); // 5% golden souls
    const cursedCount = Math.floor(totalTiles * 0.05); // 5% cursed
    const mysteryCount = Math.floor(totalTiles * 0.05); // 5% mystery
    const neutralCount = totalTiles - reaperCount - soulCount - goldenSoulCount - cursedCount - mysteryCount;
    
    // Create tile types array
    const tiles = [
        ...Array(reaperCount).fill('reaper'),
        ...Array(soulCount).fill('soul'),
        ...Array(goldenSoulCount).fill('golden'),
        ...Array(cursedCount).fill('cursed'),
        ...Array(mysteryCount).fill('mystery'),
        ...Array(neutralCount).fill('neutral')
    ];
    
    // Shuffle using seeded random (Date.now() for fairness feel)
    const seed = Date.now();
    const random = seededRandom(seed);
    
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    gameState.grid = tiles.map(type => {
        let multiplier = 1.0;
        if (type === 'soul') multiplier = 1.1 + random() * 1.9; // 1.1x to 3.0x
        if (type === 'golden') multiplier = 4.0 + random() * 2.0; // 4.0x to 6.0x
        if (type === 'cursed') multiplier = 0.5 + random() * 0.3; // 0.5x to 0.8x
        if (type === 'mystery') multiplier = random() < 0.5 ? (2.0 + random() * 3.0) : (0.3 + random() * 0.4);
        
        return {
            type,
            revealed: false,
            multiplier
        };
    });
    
    // Render grid
    renderGrid();
}

// Seeded random number generator
function seededRandom(seed) {
    let state = seed;
    return function() {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
}

// Render grid
function renderGrid() {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';
    container.className = `grid-container size-${gameState.gridSize}`;
    
    gameState.grid.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.dataset.index = index;
        
        tileElement.addEventListener('click', () => revealTile(index));
        
        container.appendChild(tileElement);
    });
}

// Reveal tile
function revealTile(index) {
    if (!gameState.gameActive) return;
    
    const tile = gameState.grid[index];
    if (tile.revealed) return;
    
    tile.revealed = true;
    gameState.tilesRevealed++;
    
    const tileElement = document.querySelector(`[data-index="${index}"]`);
    tileElement.classList.add('revealed');
    
    if (tile.type === 'reaper') {
        // Check shield
        if (gameState.shieldActive) {
            handleShieldedReaper(tileElement);
            gameState.shieldActive = false;
            updatePowerupDisplay();
        } else {
            handleReaper(tileElement);
        }
    } else if (tile.type === 'soul') {
        handleSoul(tileElement, tile.multiplier);
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
    } else if (tile.type === 'golden') {
        handleGoldenSoul(tileElement, tile.multiplier);
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
    } else if (tile.type === 'cursed') {
        handleCursed(tileElement, tile.multiplier);
        gameState.combo = 0;
    } else if (tile.type === 'mystery') {
        handleMystery(tileElement, tile.multiplier);
    } else {
        handleNeutral(tileElement);
        gameState.combo = 0;
    }
    
    updateGameStats();
    checkAchievements();
    
    // Check for fog weather (20% chance after 5 reveals)
    if (gameState.tilesRevealed === 5 && !gameState.fogTriggered && Math.random() < 0.2) {
        triggerFogWeather();
    }
}

// Handle reaper tile
function handleReaper(tileElement) {
    tileElement.classList.add('reaper');
    tileElement.innerHTML = '<div class="tile-content"><span class="icon">💀</span></div>';
    
    playSound('death');
    gameState.gameActive = false;
    
    // Show all reapers
    setTimeout(() => {
        gameState.grid.forEach((tile, i) => {
            if (tile.type === 'reaper' && !tile.revealed) {
                const el = document.querySelector(`[data-index="${i}"]`);
                el.classList.add('revealed', 'reaper');
                el.innerHTML = '<div class="tile-content"><span class="icon">💀</span></div>';
            }
        });
        
        setTimeout(() => showGameOver(false), 1000);
    }, 500);
}

// Handle soul tile
function handleSoul(tileElement, multiplier) {
    const comboBonus = 1 + (gameState.combo * 0.05); // 5% per combo
    const finalMultiplier = multiplier * comboBonus;
    
    tileElement.classList.add('soul');
    let displayText = `<span class="icon">👻</span><br>${finalMultiplier.toFixed(2)}x`;
    if (gameState.combo > 0) {
        displayText += `<br><small>🔥${gameState.combo}x</small>`;
    }
    tileElement.innerHTML = `<div class="tile-content">${displayText}</div>`;
    
    gameState.multiplier *= finalMultiplier;
    playSound('harvest');
    
    // Create soul particles
    createParticles(tileElement, '✨', 8);
    
    // Chance to earn powerup
    if (Math.random() < 0.1) {
        earnPowerup();
    }
}

// Handle neutral tile
function handleNeutral(tileElement) {
    tileElement.classList.add('neutral');
    tileElement.innerHTML = '<div class="tile-content"><span class="icon">⚰️</span></div>';
    
    playSound('click');
}

// Handle golden soul tile
function handleGoldenSoul(tileElement, multiplier) {
    const comboBonus = 1 + (gameState.combo * 0.05);
    const finalMultiplier = multiplier * comboBonus;
    
    tileElement.classList.add('golden');
    let displayText = `<span class=\"icon\">⭐</span><br>${finalMultiplier.toFixed(2)}x`;
    if (gameState.combo > 0) {
        displayText += `<br><small>🔥${gameState.combo}x</small>`;
    }
    tileElement.innerHTML = `<div class="tile-content">${displayText}</div>`;
    
    gameState.multiplier *= finalMultiplier;
    playSound('cashout');
    
    createParticles(tileElement, '⭐', 12);
    
    if (Math.random() < 0.2) {
        earnPowerup();
    }
}

// Handle cursed tile
function handleCursed(tileElement, multiplier) {
    tileElement.classList.add('cursed');
    tileElement.innerHTML = `<div class=\"tile-content\"><span class=\"icon\">🕷️</span><br>${multiplier.toFixed(2)}x</div>`;
    
    gameState.multiplier *= multiplier;
    playSound('death');
    
    createParticles(tileElement, '💨', 6);
}

// Handle mystery tile
function handleMystery(tileElement, multiplier) {
    const isGood = multiplier > 1.0;
    
    tileElement.classList.add(isGood ? 'mystery-good' : 'mystery-bad');
    tileElement.innerHTML = `<div class=\"tile-content\"><span class=\"icon\">❓</span><br>${multiplier.toFixed(2)}x</div>`;
    
    gameState.multiplier *= multiplier;
    playSound(isGood ? 'harvest' : 'click');
    
    createParticles(tileElement, isGood ? '💫' : '❓', 8);
    
    if (isGood) {
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
    } else {
        gameState.combo = 0;
    }
}

// Handle shielded reaper
function handleShieldedReaper(tileElement) {
    tileElement.classList.add('shielded');
    tileElement.innerHTML = '<div class="tile-content">🛡️<br>BLOCKED!</div>';
    
    playSound('click');
    createParticles(tileElement, '✨', 10);
    
    showAlert('Shield absorbed the Reaper! 🛡️', 'success');
}

// Trigger fog weather
function triggerFogWeather() {
    gameState.fogTriggered = true;
    
    // Show alert
    const alert = document.getElementById('weatherAlert');
    alert.classList.remove('hidden');
    
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 3000);
    
    // Add 2 extra reapers to unrevealed tiles
    const unrevealedIndices = gameState.grid
        .map((tile, i) => tile.revealed ? -1 : i)
        .filter(i => i !== -1);
    
    // Convert 2 random unrevealed non-reaper tiles to reapers
    let added = 0;
    while (added < 2 && unrevealedIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * unrevealedIndices.length);
        const tileIndex = unrevealedIndices[randomIndex];
        
        if (gameState.grid[tileIndex].type !== 'reaper') {
            gameState.grid[tileIndex].type = 'reaper';
            added++;
        }
        
        unrevealedIndices.splice(randomIndex, 1);
    }
    
    playSound('death');
}

// Update game stats
function updateGameStats() {
    document.getElementById('multiplier').textContent = gameState.multiplier.toFixed(2) + 'x';
    document.getElementById('potentialWin').textContent = (gameState.currentBet * gameState.multiplier).toFixed(2);
    document.getElementById('tilesRevealed').textContent = gameState.tilesRevealed;
    document.getElementById('comboCount').textContent = gameState.combo;
}

// Cash out
function cashOut() {
    if (!gameState.gameActive) return;
    
    const winAmount = gameState.currentBet * gameState.multiplier;
    gameState.wallet += winAmount;
    gameState.totalWinnings += winAmount;
    if (gameState.multiplier > gameState.highestMultiplier) {
        gameState.highestMultiplier = gameState.multiplier;
    }
    gameState.gameActive = false;
    
    updateWalletDisplay();
    saveGameData();
    
    playSound('cashout');
    createConfetti();
    
    // Save to leaderboard
    saveToLeaderboard(winAmount, gameState.multiplier);
    
    checkAchievements();
    
    setTimeout(() => showGameOver(true, winAmount), 500);
}

// Reset game
function resetGame() {
    gameState.gameActive = false;
    gameState.currentBet = 0;
    gameState.multiplier = 1.0;
    gameState.tilesRevealed = 0;
    gameState.fogTriggered = false;
    gameState.shieldActive = false;
    gameState.combo = 0;
    
    document.getElementById('gameSetup').classList.remove('hidden');
    document.getElementById('gameBoard').classList.add('hidden');
    document.getElementById('weatherAlert').classList.add('hidden');
    document.getElementById('powerupControls').classList.add('hidden');
    
    updateWalletDisplay();
}

// Show game over modal
function showGameOver(won, winAmount = 0) {
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('modalTitle');
    const result = document.getElementById('modalResult');
    const stats = document.getElementById('modalStats');
    
    if (won) {
        title.textContent = '💰 CASHED OUT! 💰';
        result.className = 'modal-result win';
        result.textContent = `+${winAmount.toFixed(2)} ETH`;
        stats.innerHTML = `
            <div>Multiplier: ${gameState.multiplier.toFixed(2)}x</div>
            <div>Max Combo: ${gameState.maxCombo}x 🔥</div>
            <div>Tiles Revealed: ${gameState.tilesRevealed}</div>
            <div>Profit: ${(winAmount - gameState.currentBet).toFixed(2)} ETH</div>
        `;
    } else {
        title.textContent = '💀 REAPED! 💀';
        result.className = 'modal-result loss';
        result.textContent = `-${gameState.currentBet.toFixed(2)} ETH`;
        stats.innerHTML = `
            <div>Multiplier Reached: ${gameState.multiplier.toFixed(2)}x</div>
            <div>Max Combo: ${gameState.maxCombo}x 🔥</div>
            <div>Tiles Revealed: ${gameState.tilesRevealed}</div>
            <div>Better luck next time!</div>
        `;
    }
    
    modal.classList.remove('hidden');
}

// Create particles
function createParticles(element, emoji, count) {
    const rect = element.getBoundingClientRect();
    const container = document.getElementById('particleContainer');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.fontSize = '20px';
        
        // Random offset
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50;
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }
}

// Create confetti
function createConfetti() {
    const container = document.getElementById('particleContainer');
    const colors = ['#ffd700', '#00ff00', '#8a2be2', '#ff69b4', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Save to leaderboard
function saveToLeaderboard(winAmount, multiplier) {
    const leaderboard = JSON.parse(localStorage.getItem('reaperLeaderboard') || '[]');
    
    const score = {
        amount: winAmount,
        multiplier: multiplier,
        date: new Date().toLocaleDateString(),
        gridSize: gameState.gridSize
    };
    
    leaderboard.push(score);
    leaderboard.sort((a, b) => b.amount - a.amount);
    leaderboard.splice(10); // Keep top 10
    
    localStorage.setItem('reaperLeaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
}

// Update leaderboard display
function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('reaperLeaderboard') || '[]');
    const container = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No scores yet. Be the first!</div>';
        return;
    }
    
    container.innerHTML = leaderboard.map((score, index) => `
        <div class="leaderboard-entry rank-${index + 1}">
            <span class="entry-rank">#${index + 1}</span>
            <span class="entry-info">
                ${score.gridSize}x${score.gridSize} | ${score.multiplier.toFixed(2)}x | ${score.date}
            </span>
            <span class="entry-score">${score.amount.toFixed(2)} ETH</span>
        </div>
    `).join('');
}

// Share score
function shareScore() {
    const leaderboard = JSON.parse(localStorage.getItem('reaperLeaderboard') || '[]');
    
    if (leaderboard.length === 0) {
        alert('Play a game first to share your score!');
        return;
    }
    
    const topScore = leaderboard[0];
    const shareText = `🎮 Reaper's Harvest 🎮\n\nMy best harvest: ${topScore.amount.toFixed(2)} ETH\nMultiplier: ${topScore.multiplier.toFixed(2)}x\nGrid: ${topScore.gridSize}x${topScore.gridSize}\n\nCan you beat my score? 💀`;
    
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Score copied to clipboard! 📋');
            playSound('cashout');
        }).catch(() => {
            // Fallback
            fallbackCopy(shareText);
        });
    } else {
        fallbackCopy(shareText);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('Score copied to clipboard! 📋');
        playSound('cashout');
    } catch (err) {
        alert('Failed to copy. Please copy manually:\n\n' + text);
    }
    
    document.body.removeChild(textarea);
}

// Powerup functions
function usePowerup(type) {
    if (!gameState.gameActive) {
        showAlert('Start a game first!', 'error');
        return;
    }
    
    if (gameState.powerups[type] <= 0) {
        showAlert('No ' + type + ' powerups available!', 'error');
        return;
    }
    
    gameState.powerups[type]--;
    
    switch(type) {
        case 'shield':
            gameState.shieldActive = true;
            showAlert('Shield activated! Next Reaper will be blocked! 🛡️', 'success');
            break;
        case 'reveal':
            revealSafeTiles();
            showAlert('Safe tiles revealed! 👁️', 'success');
            break;
        case 'boost':
            gameState.multiplier *= 1.5;
            updateGameStats();
            showAlert('Multiplier boosted by 1.5x! 🚀', 'success');
            break;
    }
    
    playSound('cashout');
    updatePowerupDisplay();
    saveGameData();
}

function earnPowerup() {
    const types = ['shield', 'reveal', 'boost'];
    const type = types[Math.floor(Math.random() * types.length)];
    gameState.powerups[type]++;
    
    showAlert(`Earned ${type} powerup! 🎁`, 'success');
    updatePowerupDisplay();
    saveGameData();
}

function revealSafeTiles() {
    let revealed = 0;
    gameState.grid.forEach((tile, index) => {
        if (!tile.revealed && tile.type !== 'reaper' && revealed < 3) {
            const tileElement = document.querySelector(`[data-index="${index}"]`);
            tileElement.classList.add('hint');
            setTimeout(() => tileElement.classList.remove('hint'), 2000);
            revealed++;
        }
    });
}

function updatePowerupDisplay() {
    document.getElementById('shieldCount').textContent = gameState.powerups.shield;
    document.getElementById('revealCount').textContent = gameState.powerups.reveal;
    document.getElementById('boostCount').textContent = gameState.powerups.boost;
    
    // Update button states
    document.getElementById('useShield').disabled = !gameState.gameActive || gameState.powerups.shield <= 0;
    document.getElementById('useReveal').disabled = !gameState.gameActive || gameState.powerups.reveal <= 0;
    document.getElementById('useBoost').disabled = !gameState.gameActive || gameState.powerups.boost <= 0;
    
    // Show shield indicator
    const shieldIndicator = document.getElementById('shieldIndicator');
    if (gameState.shieldActive) {
        shieldIndicator.classList.remove('hidden');
    } else {
        shieldIndicator.classList.add('hidden');
    }
}

// Achievement system
const ACHIEVEMENTS = [
    { id: 'first_win', name: 'First Harvest', desc: 'Cash out for the first time', icon: '🎉' },
    { id: 'big_win', name: 'Big Harvest', desc: 'Win 50+ ETH in one game', icon: '💰' },
    { id: 'huge_win', name: 'Mega Harvest', desc: 'Win 100+ ETH in one game', icon: '💎' },
    { id: 'combo_5', name: 'Soul Chain', desc: 'Get a 5x combo', icon: '🔥' },
    { id: 'combo_10', name: 'Soul Master', desc: 'Get a 10x combo', icon: '⚡' },
    { id: 'multiplier_10', name: 'High Roller', desc: 'Reach 10x multiplier', icon: '🎰' },
    { id: 'multiplier_50', name: 'Legendary', desc: 'Reach 50x multiplier', icon: '👑' },
    { id: 'streak_7', name: 'Dedicated', desc: 'Play 7 days in a row', icon: '📅' },
    { id: 'games_10', name: 'Veteran', desc: 'Play 10 games', icon: '🎮' },
    { id: 'games_50', name: 'Addicted', desc: 'Play 50 games', icon: '🎯' },
    { id: 'golden_soul', name: 'Golden Touch', desc: 'Find a golden soul', icon: '⭐' },
    { id: 'shield_save', name: 'Protected', desc: 'Block a Reaper with shield', icon: '🛡️' }
];

function checkAchievements() {
    const newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (gameState.achievements.includes(achievement.id)) return;
        
        let unlocked = false;
        
        switch(achievement.id) {
            case 'first_win':
                unlocked = gameState.totalWinnings > 0;
                break;
            case 'big_win':
                unlocked = gameState.totalWinnings >= 50;
                break;
            case 'huge_win':
                unlocked = gameState.totalWinnings >= 100;
                break;
            case 'combo_5':
                unlocked = gameState.maxCombo >= 5;
                break;
            case 'combo_10':
                unlocked = gameState.maxCombo >= 10;
                break;
            case 'multiplier_10':
                unlocked = gameState.highestMultiplier >= 10;
                break;
            case 'multiplier_50':
                unlocked = gameState.highestMultiplier >= 50;
                break;
            case 'streak_7':
                unlocked = gameState.streak >= 7;
                break;
            case 'games_10':
                unlocked = gameState.totalGamesPlayed >= 10;
                break;
            case 'games_50':
                unlocked = gameState.totalGamesPlayed >= 50;
                break;
        }
        
        if (unlocked) {
            gameState.achievements.push(achievement.id);
            newAchievements.push(achievement);
            earnPowerup(); // Reward powerup for achievement
        }
    });
    
    if (newAchievements.length > 0) {
        saveGameData();
        updateAchievementsDisplay();
        newAchievements.forEach(achievement => {
            showAlert(`Achievement Unlocked: ${achievement.icon} ${achievement.name}!`, 'achievement');
        });
    }
}

function updateAchievementsDisplay() {
    const container = document.getElementById('achievementsList');
    
    container.innerHTML = ACHIEVEMENTS.map(achievement => {
        const unlocked = gameState.achievements.includes(achievement.id);
        return `
            <div class="achievement ${unlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</span>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Alert system
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `game-alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);

// Handle visibility change for streak tracking
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkDailyStreak();
    }
});
