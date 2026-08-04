# Portal Puzzle Game - Detailed Implementation PRD

## Project Overview
Create a 2-player cooperative puzzle game in isometric 2.5D using Phaser.js. One player controls a character, the other shoots portals to help the character navigate procedurally generated levels.

## Technical Foundation

### Core Framework Setup
- **Engine**: Phaser 3.70+ with WebGL renderer
- **Canvas Size**: 1500x800 pixels
- **Coordinate System**: Isometric projection with 2:1 tile ratio
- **Tile Size**: 64x32 pixels (isometric diamond shape)
- **World Grid**: 23x25 tiles (1472x800 logical space)
- **Physics**: Custom portal system + Arcade Physics for character

### Isometric Math Specifications
```javascript
// Screen to isometric conversion
function screenToIso(screenX, screenY) {
  const isoX = (screenX / 32) + (screenY / 16);
  const isoY = (screenY / 16) - (screenX / 32);
  return { x: isoX, y: isoY };
}

// Isometric to screen conversion
function isoToScreen(isoX, isoY) {
  const screenX = (isoX - isoY) * 32;
  const screenY = (isoX + isoY) * 16;
  return { x: screenX, y: screenY };
}
```

## Phase 1: Core Mechanics Implementation (Detailed)

### Character Movement System
**File Structure**:
- `src/entities/Player.js` - Main character class
- `src/systems/InputManager.js` - Handle WASD/Arrow keys
- `src/systems/IsometricController.js` - Convert input to isometric movement

**Character Properties**:
```javascript
class Player {
  constructor(scene, x, y) {
    this.speed = 120; // pixels per second
    this.jumpForce = 300;
    this.gravity = 800;
    this.size = { width: 24, height: 40 };
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;
    this.inPortal = false;
  }
}
```

**Movement Implementation**:
- Smooth 8-directional movement with diagonal speed normalization
- Jump only when grounded (prevent infinite jumping)
- Separate X/Y velocity tracking for portal momentum preservation
- Collision detection against tilemap using Phaser's built-in systems

### Portal Placement System
**File Structure**:
- `src/entities/Portal.js` - Portal object class
- `src/systems/PortalManager.js` - Handles portal creation/destruction
- `src/systems/SurfaceDetector.js` - Validates portal placement surfaces

**Portal State Management**:
```javascript
class PortalManager {
  constructor() {
    this.portals = { orange: null, blue: null };
    this.nextPortal = 'orange';
    this.maxPortalDistance = 800; // pixels
  }

  shootPortal(x, y) {
    // 1. Convert screen coords to world coords
    // 2. Raycast to find wall surface
    // 3. Validate surface is portal-able
    // 4. Create/replace portal
    // 5. Update nextPortal state
  }
}
```

**Surface Validation Rules**:
- Minimum surface area: 64x64 pixels
- Surface must be vertical wall or horizontal floor/ceiling
- Cannot place on moving platforms or character spawn areas
- Must have clear access path (no obstructions within 32px)

### Portal Travel Mechanics
**Physics Preservation**:
```javascript
function teleportThroughPortal(character, entryPortal, exitPortal) {
  // Preserve velocity magnitude
  const speed = Math.sqrt(character.velocity.x² + character.velocity.y²);

  // Calculate exit direction based on portal orientations
  const exitAngle = calculateExitAngle(entryPortal.normal, exitPortal.normal, character.velocity);

  // Apply velocity in new direction
  character.velocity.x = Math.cos(exitAngle) * speed;
  character.velocity.y = Math.sin(exitAngle) * speed;

  // Position character at exit portal
  character.setPosition(exitPortal.x, exitPortal.y);
}
```

## Phase 2: Visual Implementation (Detailed)

### Isometric Rendering System
**File Structure**:
- `src/graphics/IsometricTileMap.js` - Tile rendering with depth
- `src/graphics/DepthManager.js` - Z-order sorting for sprites
- `src/graphics/PortalRenderer.js` - Portal visual effects

**Tile Rendering Specifications**:
```javascript
// Tile types and their visual properties
const TILE_TYPES = {
  WALL: {
    sprite: 'wall_iso',
    hasTop: true,
    hasLeft: true,
    hasRight: true,
    portalSurfaces: ['left', 'right']
  },
  FLOOR: {
    sprite: 'floor_iso',
    hasTop: true,
    portalSurfaces: ['top']
  },
  VOID: {
    sprite: null,
    collision: false
  }
};
```

**Depth Sorting Algorithm**:
- Sort sprites by: `(isoX + isoY) * 1000 + sprite.y`
- Characters always render above tiles at same position
- Portal effects render above both tiles and characters
- UI elements render at highest Z-index

### Portal Visual Effects
**Portal Appearance**:
- Outer ring: Glowing border (orange: #FF6B35, blue: #4A90E2)
- Inner area: Swirling particle effect rotating at 45°/second
- Edge blur: 4px gaussian blur for otherworldly effect
- Connecting line: Subtle dotted line between connected portals (optional)

**Animation Specifications**:
```javascript
// Portal creation animation
const portalCreateTween = {
  from: { scaleX: 0, scaleY: 0, alpha: 0 },
  to: { scaleX: 1, scaleY: 1, alpha: 1 },
  duration: 300,
  ease: 'Back.easeOut'
};

// Portal travel effect
const teleportEffect = {
  scaleCharacter: { from: 1, to: 0.1, duration: 150 },
  fadeCharacter: { from: 1, to: 0.3, duration: 150 },
  repositionInstant: true,
  emergeScale: { from: 0.1, to: 1, duration: 150 },
  emergeFade: { from: 0.3, to: 1, duration: 150 }
};
```

### Character Animation System
**Animation States**:
- `idle`: 4-frame breathing animation, 2 FPS
- `walk`: 8-frame walking cycle, 12 FPS
- `jump`: 3-frame sequence (crouch, jump, air)
- `fall`: 2-frame falling animation
- `portal_enter`: 4-frame sequence synced with teleport effect

**Sprite Sheet Layout**: 128x256 PNG with all animations in sequence

## Phase 3: Audio Implementation (Detailed)

### Audio Architecture
**File Structure**:
- `src/audio/AudioManager.js` - Centralized audio control
- `src/audio/SoundBank.js` - Sound effect loading and caching
- `assets/audio/sfx/` - Sound effect files (OGG + MP3 fallbacks)
- `assets/audio/music/` - Background music files

### Sound Effect Specifications
**Portal Audio**:
```javascript
const PORTAL_SOUNDS = {
  place_orange: {
    file: 'portal_place_orange.ogg',
    volume: 0.7,
    frequency: 880, // Hz
    duration: 0.4 // seconds
  },
  place_blue: {
    file: 'portal_place_blue.ogg',
    volume: 0.7,
    frequency: 660, // Hz (lower than orange)
    duration: 0.4
  },
  travel: {
    file: 'portal_travel.ogg',
    volume: 0.8,
    reverb: true,
    duration: 0.6
  },
  invalid: {
    file: 'portal_invalid.ogg',
    volume: 0.5,
    frequency: 200, // Low frequency for negative feedback
    duration: 0.2
  }
};
```

**Character Audio**:
- Footsteps: 4 variations, randomized playback, volume based on movement speed
- Jump: Single "boing" sound, pitch varies slightly with jump force
- Landing: Impact sound, volume correlates with fall velocity
- Ambient breathing: Very quiet looping for character presence

**Music System**:
- **Adaptive Soundtrack**: Music layers that add/remove based on puzzle complexity
- **Seamless Loops**: 60-90 second music loops with crossfading
- **Dynamic Mixing**: Music volume automatically reduces during important sound cues

### Audio Implementation Details
```javascript
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.6;
    this.masterVolume = 1.0;
    this.soundBank = new Map();
  }

  playSound(soundKey, options = {}) {
    const sound = this.scene.sound.add(soundKey, {
      volume: (options.volume || 1.0) * this.sfxVolume * this.masterVolume,
      rate: options.rate || 1.0,
      loop: options.loop || false
    });
    sound.play();
    return sound;
  }
}
```

## Phase 4: Procedural Generation (Comprehensive)

### Level Generation Algorithm (Detailed)
**File Structure**:
- `src/generation/LevelGenerator.js` - Main generation logic
- `src/generation/PuzzleValidator.js` - Solution verification
- `src/generation/DifficultyScaler.js` - Progressive challenge scaling
- `src/generation/templates/` - Puzzle pattern templates

### Generation Process (Step-by-Step)
```javascript
class LevelGenerator {
  generateLevel(difficulty, seed) {
    // Step 1: Create base room structure
    const room = this.createBaseRoom(difficulty);

    // Step 2: Place start and end positions
    const { start, end } = this.placeObjectives(room);

    // Step 3: Add impassable obstacles
    const obstacles = this.addObstacles(room, start, end, difficulty);

    // Step 4: Place collectibles in portal-dependent locations
    const collectibles = this.placeCollectibles(room, start, obstacles, difficulty);

    // Step 5: Validate solvability
    const solution = this.validateLevel(room, start, end, collectibles);

    // Step 6: If unsolvable, regenerate with adjustments
    if (!solution.isValid) {
      return this.generateLevel(difficulty, seed + 1);
    }

    return { room, start, end, collectibles, solution };
  }
}
```

### Puzzle Pattern Templates
**Template 1: Simple Gap Cross**
```javascript
const SIMPLE_GAP = {
  name: "simple_gap",
  difficulty: 1,
  requiredPortals: 2,
  pattern: {
    playerStart: { x: 2, y: 10 },
    gap: { start: { x: 5, y: 10 }, end: { x: 9, y: 10 } },
    goalPosition: { x: 12, y: 10 },
    portalSurfaces: [
      { x: 4, y: 9, face: 'right' },
      { x: 10, y: 9, face: 'left' }
    ]
  },
  validation: (level) => {
    // Ensure gap is unjumpable without portals
    return level.gapWidth > MAX_JUMP_DISTANCE;
  }
};
```

**Template 2: Momentum Puzzle**
```javascript
const MOMENTUM_PUZZLE = {
  name: "momentum_boost",
  difficulty: 3,
  requiredPortals: 2,
  pattern: {
    playerStart: { x: 2, y: 12 },
    dropZone: { x: 2, y: 6, height: 6 }, // Fall to build momentum
    targetPlatform: { x: 15, y: 8, height: 4 }, // Requires speed to reach
    portalSurfaces: [
      { x: 2, y: 5, face: 'top' }, // Bottom of drop
      { x: 12, y: 8, face: 'right' } // Launch toward target
    ]
  },
  validation: (level) => {
    const fallVelocity = Math.sqrt(2 * GRAVITY * level.dropHeight);
    const requiredDistance = level.gapWidth;
    return fallVelocity >= requiredDistance / TIME_TO_CROSS;
  }
};
```

### Validation Algorithm (Comprehensive)
```javascript
class PuzzleValidator {
  validateLevel(levelData) {
    // Phase 1: Basic reachability without portals
    const withoutPortals = this.pathfindAStar(levelData.start, levelData.end, levelData.tiles);
    if (withoutPortals.pathExists) {
      return { isValid: false, reason: "Solvable without portals" };
    }

    // Phase 2: Portal-based solution simulation
    const solutions = this.simulatePortalSolutions(levelData);
    if (solutions.length === 0) {
      return { isValid: false, reason: "No valid portal solutions" };
    }

    // Phase 3: Collectible accessibility check
    for (const collectible of levelData.collectibles) {
      const canReach = this.canReachWithPortals(levelData.start, collectible.position, levelData);
      if (!canReach) {
        return { isValid: false, reason: `Collectible at ${collectible.position} unreachable` };
      }
    }

    // Phase 4: Solution complexity validation
    const optimalSolution = solutions[0];
    if (optimalSolution.portalCount < levelData.minPortalCount) {
      return { isValid: false, reason: "Solution too simple" };
    }

    if (optimalSolution.portalCount > levelData.maxPortalCount) {
      return { isValid: false, reason: "Solution too complex" };
    }

    return {
      isValid: true,
      solution: optimalSolution,
      alternativeSolutions: solutions.slice(1)
    };
  }

  simulatePortalSolutions(levelData) {
    const solutions = [];
    const maxPortalPlacements = 8; // Computational limit

    // Generate all possible portal placement combinations
    const portalSurfaces = this.findAllPortalSurfaces(levelData.tiles);
    const combinations = this.generateCombinations(portalSurfaces, 2);

    for (const [surface1, surface2] of combinations) {
      const testLevel = this.createTestLevel(levelData, surface1, surface2);
      const path = this.simulatePlayerMovement(testLevel);

      if (path.reachesGoal && path.collectsAllItems) {
        solutions.push({
          portals: [surface1, surface2],
          portalCount: 2,
          steps: path.steps,
          time: path.estimatedTime
        });
      }
    }

    return solutions.sort((a, b) => a.steps - b.steps); // Sort by efficiency
  }
}
```

### Difficulty Progression System
```javascript
const DIFFICULTY_CURVES = {
  1: { // Levels 1-5
    roomSize: { width: 15, height: 10 },
    obstacleCount: { min: 2, max: 4 },
    portalCount: { min: 2, max: 2 },
    collectibles: 1,
    timeLimit: null,
    allowedMistakes: 'unlimited'
  },
  2: { // Levels 6-10
    roomSize: { width: 18, height: 12 },
    obstacleCount: { min: 3, max: 6 },
    portalCount: { min: 2, max: 4 },
    collectibles: 2,
    timeLimit: 120, // seconds
    allowedMistakes: 10
  },
  3: { // Levels 11-15
    roomSize: { width: 20, height: 15 },
    obstacleCount: { min: 5, max: 8 },
    portalCount: { min: 4, max: 6 },
    collectibles: 3,
    timeLimit: 90,
    allowedMistakes: 5,
    movingPlatforms: { min: 1, max: 2 }
  },
  4: { // Levels 16+
    roomSize: { width: 23, height: 25 },
    obstacleCount: { min: 8, max: 12 },
    portalCount: { min: 6, max: 8 },
    collectibles: 4,
    timeLimit: 60,
    allowedMistakes: 3,
    movingPlatforms: { min: 2, max: 4 },
    portalDecay: 30 // seconds before portals auto-close
  }
};
```

### Specific Implementation Tasks by Week

#### Week 1 Tasks (Core Mechanics)
1. **Day 1**: Project setup, Phaser configuration, basic isometric coordinate system
2. **Day 2**: Character sprite loading and basic WASD movement in isometric space
3. **Day 3**: Portal shooting mechanism - mouse click to world coordinate conversion
4. **Day 4**: Portal placement validation and visual portal creation
5. **Day 5**: Portal travel mechanics with basic momentum preservation
6. **Day 6-7**: Collision detection system and basic level loading from JSON

#### Week 2 Tasks (Visual Polish)
1. **Day 8**: Isometric tilemap rendering with proper depth sorting
2. **Day 9**: Portal visual effects - glowing rings, particle systems
3. **Day 10**: Character animation system - idle, walk, jump, fall states
4. **Day 11**: UI implementation - HUD, portal indicators, level info
5. **Day 12**: Camera system - smooth following with isometric constraints
6. **Day 13-14**: Visual feedback polish - hover effects, invalid placement indicators

#### Week 3 Tasks (Audio & Polish)
1. **Day 15**: Audio manager setup and basic sound effect loading
2. **Day 16**: Portal sound implementation - placement, travel, invalid sounds
3. **Day 17**: Character audio - footsteps, jump, landing with variations
4. **Day 18**: Background music system with adaptive layering
5. **Day 19**: Audio mixing and volume balancing
6. **Day 20-21**: Performance optimization and cross-browser testing

#### Week 4 Tasks (Procedural Generation)
1. **Day 22**: Level generator framework and basic room creation
2. **Day 23**: Puzzle template system implementation
3. **Day 24**: Solution validation algorithm with A* pathfinding
4. **Day 25**: Difficulty scaling system and progression curve
5. **Day 26**: Advanced puzzle patterns - momentum, multi-stage, timing
6. **Day 27**: Playtesting integration and automatic difficulty adjustment
7. **Day 28**: Final polish, edge case handling, and comprehensive testing

### Data Structures and File Organization

#### Level Data Format
```javascript
const LEVEL_SCHEMA = {
  id: "level_001",
  difficulty: 2,
  tiles: [
    // 2D array: tiles[y][x] = tileType
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 2, 2, 0, 0, 0, 1],
    // ... more rows
  ],
  playerStart: { x: 1, y: 8 },
  goal: { x: 8, y: 8 },
  collectibles: [
    { x: 4, y: 6, type: "gem", value: 10 },
    { x: 6, y: 4, type: "gem", value: 10 }
  ],
  portalSurfaces: [
    { x: 3, y: 7, face: "right", normal: { x: 1, y: 0 } },
    { x: 7, y: 7, face: "left", normal: { x: -1, y: 0 } }
  ],
  timeLimit: 60,
  solution: {
    optimalPortalCount: 2,
    estimatedTime: 15,
    keyMoves: ["portal_orange_3_7", "portal_blue_7_7", "move_to_goal"]
  }
};
```

#### Physics Constants
```javascript
const PHYSICS_CONFIG = {
  gravity: 800, // pixels/second²
  character: {
    speed: 120, // pixels/second
    jumpForce: 280, // pixels/second upward
    size: { width: 24, height: 40 }, // collision box
    terminalVelocity: 600 // maximum fall speed
  },
  portal: {
    radius: 32, // pixels
    maxRange: 800, // maximum shooting distance
    travelTime: 200, // milliseconds for teleport animation
    momentum: {
      preservation: 1.0, // 100% velocity preservation
      minSpeed: 50, // minimum speed for momentum puzzles
      maxSpeed: 400 // speed cap to prevent physics breaks
    }
  }
};
```

### Testing & Validation Criteria

#### Automated Testing
- **Unit Tests**: Portal placement validation, momentum calculations, coordinate conversions
- **Integration Tests**: Character movement through portals, level completion detection
- **Performance Tests**: 60 FPS maintenance with 4+ portals and particle effects
- **Procedural Tests**: 1000 generated levels must all be solvable within time limits

#### Manual Testing Checklist
- [ ] Character responds immediately to input in all 8 directions
- [ ] Portal placement feels precise and predictable
- [ ] Portal travel maintains speed and direction correctly
- [ ] Generated levels provide clear visual cues for solutions
- [ ] Audio feedback helps players understand game state
- [ ] UI remains readable and responsive throughout gameplay

### Performance Requirements
- **Frame Rate**: Steady 60 FPS with full effects enabled
- **Memory Usage**: Under 500MB RAM for entire game session
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Success Metrics
- **Player Retention**: 80% of players complete first 5 levels
- **Cooperation Quality**: Measurable improvement in completion times over multiple attempts
- **Technical Stability**: Less than 1% crash rate across all supported browsers
- **Procedural Quality**: 95%+ of generated levels solvable by playtesters within expected time

This comprehensive PRD should provide Claude Code with enough detail to implement every aspect of the game through all four development phases, with specific algorithms, data structures, and validation criteria for each component.
