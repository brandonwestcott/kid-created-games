import { TILE_TYPES, PHYSICS_CONFIG } from '../config/GameConstants.js';
import PuzzleValidator from './PuzzleValidator.js';
import DifficultyScaler from './DifficultyScaler.js';
import PuzzleTemplates from './templates/PuzzleTemplates.js';

export default class LevelGenerator {
  constructor() {
    this.validator = new PuzzleValidator();
    this.difficultyScaler = new DifficultyScaler();
    this.templates = new PuzzleTemplates();
    this.maxGenerationAttempts = 10;
  }

  generateLevel(difficulty, seed = Date.now()) {
    this.seed = seed;
    this.random = this.createSeededRandom(seed);
    
    const difficultyConfig = this.difficultyScaler.getConfig(difficulty);
    
    for (let attempt = 0; attempt < this.maxGenerationAttempts; attempt++) {
      const level = this.attemptGeneration(difficultyConfig, attempt);
      
      if (level) {
        return level;
      }
    }
    
    return this.generateFallbackLevel(difficultyConfig);
  }

  attemptGeneration(config, attempt) {
    const room = this.createBaseRoom(config);
    const { start, end } = this.placeObjectives(room, config);
    const template = this.selectTemplate(config, attempt);
    
    const levelData = this.applyTemplate(room, start, end, template, config);
    const validation = this.validator.validateLevel(levelData);
    
    if (validation.isValid) {
      return {
        ...levelData,
        solution: validation.solution,
        difficulty: config.difficulty,
        seed: this.seed
      };
    }
    
    return null;
  }

  createBaseRoom(config) {
    const { width, height } = config.roomSize;
    const room = [];
    
    for (let y = 0; y < height; y++) {
      room[y] = [];
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          room[y][x] = TILE_TYPES.WALL;
        } else {
          room[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }
    
    return room;
  }

  placeObjectives(room, config) {
    const width = room[0].length;
    const height = room.length;
    
    const start = {
      x: 2,
      y: Math.floor(height / 2)
    };
    
    const end = {
      x: width - 3,
      y: Math.floor(height / 2)
    };
    
    room[start.y][start.x] = TILE_TYPES.FLOOR;
    room[end.y][end.x] = TILE_TYPES.GOAL;
    
    return { start, end };
  }

  selectTemplate(config, attempt) {
    const availableTemplates = this.templates.getTemplatesForDifficulty(config.difficulty);
    
    if (attempt < availableTemplates.length) {
      return availableTemplates[attempt];
    }
    
    return availableTemplates[Math.floor(this.random() * availableTemplates.length)];
  }

  applyTemplate(room, start, end, template, config) {
    const levelData = {
      tiles: JSON.parse(JSON.stringify(room)),
      playerStart: start,
      goal: end,
      collectibles: [],
      portalSurfaces: [],
      timeLimit: config.timeLimit,
      allowedMistakes: config.allowedMistakes,
      minPortalCount: template.requiredPortals,
      maxPortalCount: template.requiredPortals + 2
    };
    
    this.applyTemplatePattern(levelData, template);
    this.addObstacles(levelData, config);
    this.placeCollectibles(levelData, config);
    this.findPortalSurfaces(levelData);
    
    return levelData;
  }

  applyTemplatePattern(levelData, template) {
    const pattern = template.pattern;
    
    switch (template.name) {
      case 'simple_gap':
        this.createSimpleGap(levelData, pattern);
        break;
      case 'momentum_puzzle':
        this.createMomentumPuzzle(levelData, pattern);
        break;
      case 'elevation_change':
        this.createElevationChange(levelData, pattern);
        break;
      case 'multi_portal':
        this.createMultiPortalPuzzle(levelData, pattern);
        break;
      default:
        this.createSimpleGap(levelData, pattern);
    }
  }

  createSimpleGap(levelData, pattern) {
    const gapStart = Math.floor(levelData.tiles[0].length * 0.4);
    const gapEnd = Math.floor(levelData.tiles[0].length * 0.6);
    const gapY = Math.floor(levelData.tiles.length / 2);
    
    for (let x = gapStart; x <= gapEnd; x++) {
      levelData.tiles[gapY][x] = TILE_TYPES.VOID;
      if (gapY + 1 < levelData.tiles.length) {
        levelData.tiles[gapY + 1][x] = TILE_TYPES.VOID;
      }
    }
    
    levelData.tiles[gapY - 1][gapStart - 1] = TILE_TYPES.WALL;
    levelData.tiles[gapY - 1][gapEnd + 1] = TILE_TYPES.WALL;
  }

  createMomentumPuzzle(levelData, pattern) {
    const centerX = Math.floor(levelData.tiles[0].length / 2);
    const bottomY = levelData.tiles.length - 3;
    const topY = 3;
    
    for (let y = topY; y <= bottomY; y++) {
      levelData.tiles[y][centerX] = TILE_TYPES.VOID;
      levelData.tiles[y][centerX - 1] = TILE_TYPES.VOID;
    }
    
    for (let x = centerX + 2; x < levelData.tiles[0].length - 2; x++) {
      levelData.tiles[topY + 2][x] = TILE_TYPES.WALL;
    }
    
    levelData.tiles[topY][centerX + 3] = TILE_TYPES.WALL;
    levelData.tiles[topY + 1][centerX + 3] = TILE_TYPES.WALL;
  }

  createElevationChange(levelData, pattern) {
    const midX = Math.floor(levelData.tiles[0].length / 2);
    const midY = Math.floor(levelData.tiles.length / 2);
    
    for (let x = midX - 2; x <= midX + 2; x++) {
      for (let y = midY - 1; y <= midY + 1; y++) {
        if (x >= 0 && x < levelData.tiles[0].length && 
            y >= 0 && y < levelData.tiles.length) {
          levelData.tiles[y][x] = TILE_TYPES.WALL;
        }
      }
    }
    
    levelData.tiles[midY][midX] = TILE_TYPES.FLOOR;
  }

  createMultiPortalPuzzle(levelData, pattern) {
    const width = levelData.tiles[0].length;
    const height = levelData.tiles.length;
    
    for (let section = 0; section < 3; section++) {
      const sectionX = Math.floor(width * (section + 1) / 4);
      const wallY = Math.floor(height / 2);
      
      for (let y = 2; y < height - 2; y++) {
        if (y !== wallY) {
          levelData.tiles[y][sectionX] = TILE_TYPES.WALL;
        }
      }
    }
  }

  addObstacles(levelData, config) {
    const obstacleCount = this.randomBetween(config.obstacleCount.min, config.obstacleCount.max);
    
    for (let i = 0; i < obstacleCount; i++) {
      this.placeRandomObstacle(levelData);
    }
  }

  placeRandomObstacle(levelData) {
    const maxAttempts = 20;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = this.randomBetween(2, levelData.tiles[0].length - 3);
      const y = this.randomBetween(2, levelData.tiles.length - 3);
      
      if (levelData.tiles[y][x] === TILE_TYPES.FLOOR && 
          !this.isNearObjective(x, y, levelData)) {
        
        levelData.tiles[y][x] = TILE_TYPES.WALL;
        break;
      }
    }
  }

  isNearObjective(x, y, levelData) {
    const startDist = Math.abs(x - levelData.playerStart.x) + Math.abs(y - levelData.playerStart.y);
    const goalDist = Math.abs(x - levelData.goal.x) + Math.abs(y - levelData.goal.y);
    
    return startDist < 3 || goalDist < 3;
  }

  placeCollectibles(levelData, config) {
    const collectibleCount = config.collectibles || 1;
    
    for (let i = 0; i < collectibleCount; i++) {
      const position = this.findCollectiblePosition(levelData);
      if (position) {
        levelData.collectibles.push({
          x: position.x,
          y: position.y,
          type: 'gem',
          value: 10
        });
      }
    }
  }

  findCollectiblePosition(levelData) {
    const maxAttempts = 30;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = this.randomBetween(1, levelData.tiles[0].length - 2);
      const y = this.randomBetween(1, levelData.tiles.length - 2);
      
      if (levelData.tiles[y][x] === TILE_TYPES.FLOOR && 
          !this.isNearObjective(x, y, levelData) &&
          !this.hasCollectibleNearby(x, y, levelData)) {
        return { x, y };
      }
    }
    
    return null;
  }

  hasCollectibleNearby(x, y, levelData) {
    return levelData.collectibles.some(collectible => {
      const dist = Math.abs(x - collectible.x) + Math.abs(y - collectible.y);
      return dist < 3;
    });
  }

  findPortalSurfaces(levelData) {
    levelData.portalSurfaces = [];
    
    for (let y = 0; y < levelData.tiles.length; y++) {
      for (let x = 0; x < levelData.tiles[y].length; x++) {
        if (levelData.tiles[y][x] === TILE_TYPES.WALL) {
          const surfaces = this.getWallSurfaces(x, y, levelData);
          levelData.portalSurfaces.push(...surfaces);
        }
      }
    }
  }

  getWallSurfaces(x, y, levelData) {
    const surfaces = [];
    const neighbors = this.getNeighbors(x, y, levelData);
    
    if (neighbors.left === TILE_TYPES.FLOOR) {
      surfaces.push({
        x: x,
        y: y,
        face: 'left',
        normal: { x: -1, y: 0 }
      });
    }
    
    if (neighbors.right === TILE_TYPES.FLOOR) {
      surfaces.push({
        x: x,
        y: y,
        face: 'right',
        normal: { x: 1, y: 0 }
      });
    }
    
    if (neighbors.top === TILE_TYPES.FLOOR) {
      surfaces.push({
        x: x,
        y: y,
        face: 'top',
        normal: { x: 0, y: -1 }
      });
    }
    
    if (neighbors.bottom === TILE_TYPES.FLOOR) {
      surfaces.push({
        x: x,
        y: y,
        face: 'bottom',
        normal: { x: 0, y: 1 }
      });
    }
    
    return surfaces;
  }

  getNeighbors(x, y, levelData) {
    const tiles = levelData.tiles;
    return {
      left: x > 0 ? tiles[y][x - 1] : TILE_TYPES.WALL,
      right: x < tiles[0].length - 1 ? tiles[y][x + 1] : TILE_TYPES.WALL,
      top: y > 0 ? tiles[y - 1][x] : TILE_TYPES.WALL,
      bottom: y < tiles.length - 1 ? tiles[y + 1][x] : TILE_TYPES.WALL
    };
  }

  generateFallbackLevel(config) {
    const { width, height } = config.roomSize;
    const tiles = [];
    
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          tiles[y][x] = TILE_TYPES.WALL;
        } else if (y === Math.floor(height / 2) && x > 3 && x < width - 4) {
          tiles[y][x] = TILE_TYPES.VOID;
        } else {
          tiles[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }
    
    const gapY = Math.floor(height / 2);
    tiles[gapY - 1][2] = TILE_TYPES.WALL;
    tiles[gapY - 1][width - 3] = TILE_TYPES.WALL;
    
    return {
      tiles: tiles,
      playerStart: { x: 1, y: Math.floor(height / 2) },
      goal: { x: width - 2, y: Math.floor(height / 2) },
      collectibles: [{ x: Math.floor(width / 2), y: 2, type: 'gem', value: 10 }],
      portalSurfaces: [
        { x: 2, y: gapY - 1, face: 'right', normal: { x: 1, y: 0 } },
        { x: width - 3, y: gapY - 1, face: 'left', normal: { x: -1, y: 0 } }
      ],
      timeLimit: config.timeLimit,
      allowedMistakes: config.allowedMistakes,
      difficulty: config.difficulty,
      seed: this.seed
    };
  }

  createSeededRandom(seed) {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    
    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    };
  }

  randomBetween(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}