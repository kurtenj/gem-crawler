# Gem Crawler

Gem Crawler is a 2D platformer where players navigate a series of dungeon rooms, collecting powerful elemental gems that grant unique abilities. Each gem enhances movement, combat, or puzzle-solving, allowing players to overcome obstacles and progress deeper into the dungeon. With dynamic level design, challenging enemies, and strategic ability combinations, Gem Crawler offers an engaging adventure that rewards exploration and mastery. Whether you're harnessing fire to burn obstacles, using water to traverse gaps, or summoning earth to create platforms, every gem unlocks new ways to play.

## Technical Implementation

### Game Engine and Framework
- Built with Phaser 3.70.0, a powerful HTML5 game framework
- Uses Arcade Physics system for efficient 2D collision detection
- Implements pixel-perfect rendering for crisp retro graphics

### Core Game Mechanics

#### Player Movement System
- Responsive platforming physics with:
  - Variable jump heights (tap vs. hold jumping)
  - Coyote time (150ms grace period for jumping after leaving platforms)
  - Jump buffering (150ms window to queue jumps before landing)
  - Air control with reduced speed while airborne
  - Smooth acceleration/deceleration

#### Level Generation
- Procedurally generated levels with:
  - Multi-layered platform distribution
  - Collision detection to prevent platform overlap
  - Strategic enemy placement based on platform width
  - Guaranteed path completion checks
  - Dynamic difficulty scaling

#### Enemy AI
- Platform-aware enemy movement
- Edge detection for patrol boundaries
- State-based behavior system
- Collision-based player interaction

### Technical Features

#### Physics Configuration
```javascript
physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 600 },
        debug: false
    }
}
```

#### Movement Constants
```javascript
WALK_SPEED: 200       // Base movement speed
JUMP_VELOCITY: -460   // Initial jump force
AIR_CONTROL: 0.8      // Air movement multiplier
ACCELERATION: 1500    // Ground acceleration
AIR_ACCELERATION: 1200// Air acceleration
DRAG: 1600           // Ground friction
AIR_DRAG: 400        // Air resistance
```

### Asset Management
- Sprite-based animation system
- 16x16 pixel tile-based graphics
- Efficient sprite sheet management
- Dynamic texture loading

### Performance Optimizations
- Efficient collision groups
- Object pooling for particles and enemies
- Camera culling for off-screen entities
- Optimized physics body sizes

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/gem-crawler.git
cd gem-crawler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Project Structure
```
gem-crawler/
├── public/
│   ├── assets/
│   │   └── tilemap.png
│   ├── js/
│   │   ├── game.js
│   │   └── tileManifest.js
│   └── index.html
├── server.js
└── package.json
```

## Controls
- Arrow Keys: Movement (Left/Right)
- Up Arrow: Jump
- Variable jump height based on key press duration
- Momentum-based movement for smooth control

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.