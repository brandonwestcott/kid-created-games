# Portal Puzzle Game

A 2-player cooperative puzzle game built with Phaser.js featuring isometric 2.5D graphics and portal-based mechanics.

## Overview

This game implements the full specification from the PRD, including:
- **Two-player cooperative gameplay**: One player controls character movement, the other places portals
- **Isometric 2.5D graphics**: Professional-grade visual presentation with depth sorting
- **Portal mechanics**: Physics-accurate momentum preservation and teleportation
- **Procedural level generation**: Algorithm-generated puzzles with validation
- **Progressive difficulty**: Adaptive challenge scaling based on player performance
- **Complete audio system**: Spatial audio with dynamic music layering

## Features Implemented

### Core Mechanics (Week 1)
- ✅ Character movement with WASD controls
- ✅ Portal shooting with mouse clicks
- ✅ Portal travel with momentum preservation
- ✅ Collision detection and physics
- ✅ Isometric coordinate system

### Visual Systems (Week 2)
- ✅ Isometric tile rendering with depth sorting
- ✅ Portal visual effects and animations
- ✅ Character animation states (idle, walk, jump)
- ✅ Dynamic camera following
- ✅ Professional UI system

### Audio Systems (Week 3)
- ✅ Comprehensive audio manager
- ✅ Portal placement and travel sounds
- ✅ Character movement audio
- ✅ Spatial audio positioning
- ✅ Dynamic music mixing

### Procedural Generation (Week 4)
- ✅ Advanced level generator with templates
- ✅ Solution validation using A* pathfinding
- ✅ Difficulty progression system
- ✅ Multiple puzzle patterns
- ✅ Adaptive difficulty scaling

## Technical Architecture

### Core Systems
- **Game Engine**: Phaser 3.70+ with WebGL rendering
- **Canvas**: 1500x800 pixels with responsive scaling
- **Coordinates**: Custom isometric projection (2:1 ratio)
- **Physics**: Arcade Physics + custom portal system
- **Audio**: Multi-layered spatial audio system

### File Structure
```
src/
├── main.js                 # Game entry point
├── scenes/
│   ├── MenuScene.js        # Main menu
│   └── GameScene.js        # Primary gameplay scene
├── entities/
│   ├── Player.js           # Character controller
│   └── Portal.js           # Portal entity
├── systems/
│   ├── InputManager.js     # Input handling
│   └── PortalManager.js    # Portal management
├── graphics/
│   └── IsometricTileMap.js # Rendering system
├── audio/
│   └── AudioManager.js     # Audio system
├── generation/
│   ├── LevelGenerator.js   # Procedural generation
│   ├── PuzzleValidator.js  # Solution validation
│   ├── DifficultyScaler.js # Adaptive difficulty
│   └── templates/
│       └── PuzzleTemplates.js # Puzzle patterns
├── utils/
│   └── IsometricUtils.js   # Math utilities
└── config/
    └── GameConstants.js    # Game configuration
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens development server at http://localhost:3000

### Building
```bash
npm run build
```
Generates production build in `dist/` directory

### Testing
```bash
npm run test
npm run lint
npm run validate  # Runs lint, test, and build
```

## Gameplay Instructions

### Player 1 (Character Control)
- **WASD** or **Arrow Keys**: Move character
- **Spacebar**: Jump

### Player 2 (Portal Control)
- **Mouse Click**: Place portals on valid surfaces
- **Portal Colors**: Orange and blue portals alternate automatically

### Game Rules
- Walk through one portal to exit the other
- Momentum is preserved through portal travel
- Collect all gems to unlock the goal
- Reach the green goal tile to complete the level

## Development Features

### Level Generation
The game includes a sophisticated procedural generation system:

```javascript
// Generate a level with specific difficulty
const levelData = levelGenerator.generateLevel(difficulty, seed);

// Validate solution exists
const validation = puzzleValidator.validateLevel(levelData);
```

### Difficulty Scaling
Progressive difficulty automatically adjusts based on player performance:

```javascript
// Automatic difficulty adjustment
const adjustedDifficulty = difficultyScaler.scaleDifficulty(
  baseDifficulty, 
  playerPerformance
);
```

### Audio System
Comprehensive audio with spatial positioning:

```javascript
// Play positioned sound
audioManager.createSpatialSound('portal_place', portalX, portalY, playerX, playerY);

// Dynamic music ducking
audioManager.duckMusic(1000, 0.3);
```

## Performance Targets

- **Frame Rate**: Steady 60 FPS
- **Memory**: <500MB RAM usage
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Implementation Highlights

### Isometric Math
Precise coordinate conversion for seamless gameplay:
```javascript
function screenToIso(screenX, screenY) {
  const isoX = (screenX / 32) + (screenY / 16);
  const isoY = (screenY / 16) - (screenX / 32);
  return { x: isoX, y: isoY };
}
```

### Portal Physics
Realistic momentum preservation:
```javascript
function calculateExitVelocity(entryVelocity) {
  const speed = Math.sqrt(entryVelocity.x² + entryVelocity.y²);
  const clampedSpeed = clamp(speed * MOMENTUM_PRESERVATION, MIN_SPEED, MAX_SPEED);
  return { x: exitDirection.x * clampedSpeed, y: exitDirection.y * clampedSpeed };
}
```

### Solution Validation
A* pathfinding ensures all levels are solvable:
```javascript
const solution = aStar(start, goal, tiles, usePortals, portals);
const isValid = solution.length > 0 && meetsComplexityRequirements(solution);
```

## Contributing

This implementation follows the complete PRD specification and includes all required features through Week 4. The codebase is designed for maintainability and extension.

### Code Style
- ES6+ JavaScript with modules
- Consistent naming conventions
- Comprehensive error handling
- Performance-optimized algorithms

### Testing
- Unit tests for core algorithms
- Integration tests for game systems
- Performance benchmarks
- Cross-browser validation

## License

MIT License - See LICENSE file for details