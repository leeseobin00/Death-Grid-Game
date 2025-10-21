# 🎮 Reaper's Harvest - Death Grid Game

A thrilling, death-themed grid avoidance game where you bet fake ETH, harvest souls for multipliers, and cash out before the Reaper claims you!

## 🎯 Game Features

### Core Mechanics
- **Three Grid Sizes**: 5x5 (Easy), 7x7 (Medium), 10x10 (Hard)
- **Smart Grid Generation**: Diverse tile types with strategic depth
  - 👻 **Soul Tiles** (35%): 1.1x-3.0x multipliers
  - ⭐ **Golden Souls** (5%): 4.0x-6.0x mega multipliers!
  - 🕷️ **Cursed Tiles** (5%): 0.5x-0.8x penalty multipliers
  - ❓ **Mystery Tiles** (5%): Random 0.3x-5.0x surprise!
  - ⚰️ **Neutral Tiles** (30%): Safe but no multiplier
  - 💀 **Reapers** (20%): Instant game over!
- **Combo System**: Stack consecutive soul harvests for +5% bonus per combo!
- **Progressive Gameplay**: Click tiles to reveal, stack multipliers, cash out anytime
- **Fog Weather Event**: 20% chance after 5 reveals - adds 2 extra Reapers!
- **Risk vs Reward**: Higher multipliers = more danger

### Power-Up System 🎁
- **🛡️ Shield**: Block the next Reaper you hit (one-time protection)
- **👁️ Reveal**: Highlight 3 safe tiles temporarily
- **🚀 Boost**: Instantly multiply your current multiplier by 1.5x
- **Earn Powerups**: 10% chance on soul tiles, 20% on golden souls, guaranteed on achievements!

### Achievements System 🏅
- **12 Unlockable Achievements**: From "First Harvest" to "Legendary"
- **Progressive Challenges**: Combo chains, high multipliers, win streaks, and more
- **Powerup Rewards**: Each achievement unlocks a random powerup
- **Visual Tracking**: See locked and unlocked achievements in real-time

### UI/UX Features
- **Dark Gothic Theme**: Black/purple graveyard aesthetic with skull icons
- **Smooth Animations**: 
  - Tile flip animations on reveal
  - Soul particle effects on harvest
  - Confetti explosion on cashout
  - Reaper explosion on death
  - Hint pulses for revealed safe tiles
  - Special effects for golden souls and shields
- **Web Audio**: Toggleable sound effects (harvest chime, death scream, cashout)
- **Alert System**: Real-time notifications for powerups, achievements, and events
- **Fully Responsive**: Works perfectly on mobile and desktop with touch/click support

### Progression System
- **Fake Wallet**: Start with 100 ETH, auto-refills when empty
- **Top 10 Leaderboard**: Best scores saved to localStorage
- **Daily Streak Counter**: Track consecutive days played
- **Session Persistence**: Your wallet, powerups, achievements, and stats are saved
- **Lifetime Stats**: Track total games played, total winnings, and highest multiplier

### Social Features
- **Share Button**: Copy your best score to clipboard
- **Global Ranking**: Compare with your previous best harvests

## 🚀 How to Play

1. **Set Your Bet**: Choose between 0.01 - 10 fake ETH
2. **Select Grid Size**: Pick your difficulty (5x5, 7x7, or 10x10)
3. **Start Game**: Click "START GAME" to generate the grid
4. **Reveal Tiles**: Click tiles to reveal what's underneath
   - 👻 **Soul Tiles**: Multiply your winnings (1.1x - 3.0x) + combo bonus!
   - ⭐ **Golden Souls**: MEGA multipliers (4.0x - 6.0x) + combo bonus!
   - 🕷️ **Cursed Tiles**: Penalty multipliers (0.5x - 0.8x), breaks combo
   - ❓ **Mystery Tiles**: Random outcome - could be great or terrible!
   - ⚰️ **Neutral Tiles**: Safe but no multiplier, breaks combo
   - 💀 **Reaper Tiles**: Instant game over, lose your bet! (unless shielded)
5. **Use Powerups**: Activate powerups strategically during gameplay
   - Shield before risky clicks
   - Reveal to find safe paths
   - Boost to maximize your multiplier
6. **Build Combos**: Chain soul/golden tiles for +5% bonus per combo level
7. **Cash Out**: Hit the "CASH OUT" button anytime to secure your winnings
8. **Watch for Fog**: After 5 reveals, there's a 20% chance of fog adding 2 more Reapers!
9. **Unlock Achievements**: Complete challenges to earn powerups and bragging rights

## 📁 Installation & Setup

### Option 1: Direct File Opening
1. Download all files (index.html, style.css, app.js)
2. Double-click `index.html` to open in your browser
3. Start playing immediately!

### Option 2: Local Web Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 🎮 Controls

- **Mouse**: Click tiles to reveal
- **Touch**: Tap tiles on mobile devices
- **Keyboard**: Tab to navigate, Enter to select (accessibility)

## 💾 Technical Details

- **Pure Frontend**: No backend, Web3, or server required
- **localStorage**: Saves wallet, powerups, achievements, leaderboard, streak, and stats
- **Seeded RNG**: Uses Date.now() for fair randomization
- **Web Audio API**: Dynamic sound generation
- **Responsive Design**: CSS Grid and Flexbox for perfect scaling
- **Enhanced Animations**: CSS keyframes for smooth visual feedback
- **File Size**: ~35KB total (well under 5MB requirement)

## 🎨 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Minimum Requirements**: Modern browser with ES6 support

## 🔧 Customization

Want to tweak the game? Here are some easy modifications:

### Change Tile Distribution (app.js, line 270-275)
```javascript
const reaperCount = Math.floor(totalTiles * 0.2); // 20% reapers
const soulCount = Math.floor(totalTiles * 0.35); // 35% souls
const goldenSoulCount = Math.floor(totalTiles * 0.05); // 5% golden
const cursedCount = Math.floor(totalTiles * 0.05); // 5% cursed
const mysteryCount = Math.floor(totalTiles * 0.05); // 5% mystery
```

### Adjust Multiplier Ranges (app.js, line 298-301)
```javascript
if (type === 'soul') multiplier = 1.1 + random() * 1.9; // 1.1x to 3.0x
if (type === 'golden') multiplier = 4.0 + random() * 2.0; // 4.0x to 6.0x
if (type === 'cursed') multiplier = 0.5 + random() * 0.3; // 0.5x to 0.8x
```

### Change Combo Bonus (app.js, line 417)
```javascript
const comboBonus = 1 + (gameState.combo * 0.05); // 5% per combo
```

### Modify Powerup Drop Rates (app.js, line 434, 464)
```javascript
if (Math.random() < 0.1) // 10% chance on souls
if (Math.random() < 0.2) // 20% chance on golden souls
```

### Change Starting Wallet (app.js, line 3)
```javascript
wallet: 100, // Change starting amount
```

## 🐛 Troubleshooting

**Sound not working?**
- Check browser permissions for audio
- Click anywhere on the page first (browsers require user interaction)
- Toggle sound off/on in settings

**Wallet reset to 100?**
- This is intentional when wallet reaches 0 (unlimited demo mode)
- Your leaderboard scores are still saved

**Leaderboard empty?**
- Play and cash out at least once to add a score
- Check if localStorage is enabled in your browser

## 📊 Game Statistics

The game tracks:
- Total fake ETH in wallet
- Current bet amount
- Live multiplier with combo bonuses
- Potential winnings
- Tiles revealed count
- Current combo streak
- Daily play streak
- Top 10 best harvests
- Total games played
- Total lifetime winnings
- Highest multiplier achieved
- Powerup inventory (Shield, Reveal, Boost)
- Achievement progress (12 total)

## 🎯 Strategy Tips

### Basic Strategy
1. **Start Small**: Test the grid with small bets first
2. **Know When to Fold**: Cash out early on hard grids
3. **Fog Awareness**: Be extra careful after 5 reveals
4. **Risk Management**: Higher grids = more tiles but more Reapers
5. **Multiplier Stacking**: Soul tiles multiply together - 1.5x × 2.0x = 3.0x total!

### Advanced Strategy
6. **Combo Building**: Chain soul/golden tiles for massive bonuses (5% per combo)
7. **Shield Timing**: Save shields for when you're deep in a run with high multipliers
8. **Reveal Wisely**: Use reveal powerup when you're stuck or need a safe path
9. **Boost Strategy**: Activate boost after hitting several souls for maximum effect
10. **Golden Soul Hunting**: Golden souls give 20% powerup chance - worth the risk!
11. **Cursed Tile Awareness**: They break combos but won't kill you - sometimes worth it
12. **Mystery Gamble**: Mystery tiles are high risk/reward - use when desperate or confident
13. **Achievement Farming**: Focus on achievement goals to earn free powerups
14. **Streak Maintenance**: Play daily to maintain your streak and unlock the Dedicated achievement

## 📜 License

This is a demo game for entertainment purposes. Feel free to modify and share!

## 🎮 Credits

Created with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies, just pure web gaming fun!

### New in Version 2.0
- ⭐ Golden Soul tiles with mega multipliers
- 🕷️ Cursed tiles with penalty multipliers
- ❓ Mystery tiles with random outcomes
- 🎁 Power-up system (Shield, Reveal, Boost)
- 🏅 Achievement system with 12 unlockable badges
- 🔥 Combo system for consecutive soul harvests
- 📊 Enhanced statistics tracking
- 🔔 Real-time alert notifications
- 💎 Improved visual effects and animations

---

**Ready to harvest some souls? Open index.html and start playing! 💀👻⚰️**
