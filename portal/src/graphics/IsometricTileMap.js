import Phaser from 'phaser';
import { TILE_CONFIG, TILE_TYPES } from '../config/GameConstants.js';
import IsometricUtils from '../utils/IsometricUtils.js';

export default class IsometricTileMap {
  constructor(scene, levelData) {
    this.scene = scene;
    this.levelData = levelData;
    this.tileWidth = TILE_CONFIG.width;
    this.tileHeight = TILE_CONFIG.height;
    this.worldWidth = TILE_CONFIG.worldWidth;
    this.worldHeight = TILE_CONFIG.worldHeight;
    
    this.tileSprites = [];
    this.collisionGroup = null;
    
    this.createTiles();
    this.setupCollisions();
    this.setupDepthSorting();
  }

  createTiles() {
    this.tileContainer = this.scene.add.container(400, 300); // Center the tile container
    this.tileSprites = [];
    
    for (let y = 0; y < this.levelData.tiles.length; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < this.levelData.tiles[y].length; x++) {
        const tileType = this.levelData.tiles[y][x];
        
        if (tileType !== TILE_TYPES.VOID) {
          const tile = this.createTile(x, y, tileType);
          if (tile) {
            this.tileSprites[y][x] = tile;
            this.tileContainer.add(tile);
          }
        }
      }
    }
    
    console.log(`Created ${this.tileContainer.list.length} tiles`);
  }

  createTile(x, y, tileType) {
    // Use simple grid positioning for now instead of isometric
    const gridX = x * 64;
    const gridY = y * 64;
    let tileSprite;
    
    switch (tileType) {
      case TILE_TYPES.FLOOR:
        tileSprite = this.createFloorTile(gridX, gridY);
        break;
      case TILE_TYPES.WALL:
        tileSprite = this.createWallTile(gridX, gridY);
        break;
      case TILE_TYPES.GOAL:
        tileSprite = this.createGoalTile(gridX, gridY);
        break;
      default:
        return null;
    }
    
    if (tileSprite) {
      tileSprite.setOrigin(0, 0);
      tileSprite.setDepth(y * 100 + x);
      tileSprite.tileX = x;
      tileSprite.tileY = y;
      tileSprite.tileType = tileType;
    }
    
    return tileSprite;
  }

  createFloorTile(x, y) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x888888);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(2, 0xaaaaaa);
    graphics.strokeRect(0, 0, 64, 64);
    
    const texture = graphics.generateTexture('floor_' + Math.random(), 64, 64);
    graphics.destroy();
    
    return this.scene.add.image(x, y, texture.key);
  }

  createWallTile(x, y) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x444444);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(3, 0x666666);
    graphics.strokeRect(0, 0, 64, 64);
    
    const texture = graphics.generateTexture('wall_' + Math.random(), 64, 64);
    graphics.destroy();
    
    return this.scene.add.image(x, y, texture.key);
  }

  createGoalTile(x, y) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(3, 0x00aa00);
    graphics.strokeRect(0, 0, 64, 64);
    
    const texture = graphics.generateTexture('goal_' + Math.random(), 64, 64);
    graphics.destroy();
    
    return this.scene.add.image(x, y, texture.key);
  }

  setupCollisions() {
    this.collisionGroup = this.scene.physics.add.staticGroup();
    
    for (let y = 0; y < this.levelData.tiles.length; y++) {
      for (let x = 0; x < this.levelData.tiles[y].length; x++) {
        const tileType = this.levelData.tiles[y][x];
        
        if (tileType === TILE_TYPES.WALL) {
          this.createCollisionBody(x, y);
        }
      }
    }
    
    if (this.scene.player && this.scene.player.sprite) {
      this.scene.physics.add.collider(this.scene.player.sprite, this.collisionGroup);
    }
  }

  createCollisionBody(x, y) {
    const screenPos = IsometricUtils.isoToScreen(x, y);
    const collisionBody = this.scene.add.rectangle(
      screenPos.x, 
      screenPos.y, 
      this.tileWidth, 
      this.tileHeight
    );
    
    collisionBody.setVisible(false);
    this.collisionGroup.add(collisionBody);
    
    return collisionBody;
  }

  setupDepthSorting() {
    this.scene.children.sort('depth');
  }

  getTileAt(x, y) {
    if (y >= 0 && y < this.levelData.tiles.length && 
        x >= 0 && x < this.levelData.tiles[y].length) {
      return this.levelData.tiles[y][x];
    }
    return TILE_TYPES.VOID;
  }

  getTileSprite(x, y) {
    if (this.tileSprites[y] && this.tileSprites[y][x]) {
      return this.tileSprites[y][x];
    }
    return null;
  }

  worldToTile(worldX, worldY) {
    return {
      x: Math.floor(worldX),
      y: Math.floor(worldY)
    };
  }

  tileToWorld(tileX, tileY) {
    return {
      x: tileX + 0.5,
      y: tileY + 0.5
    };
  }

  screenToIso(screenX, screenY) {
    return IsometricUtils.screenToIso(screenX, screenY);
  }

  isoToScreen(isoX, isoY) {
    return IsometricUtils.isoToScreen(isoX, isoY);
  }

  isWalkable(x, y) {
    const tileType = this.getTileAt(x, y);
    return tileType === TILE_TYPES.FLOOR || tileType === TILE_TYPES.GOAL;
  }

  isPortalSurface(x, y, face) {
    const tileType = this.getTileAt(x, y);
    if (tileType !== TILE_TYPES.WALL) return false;
    
    const neighborX = x + (face === 'left' ? -1 : face === 'right' ? 1 : 0);
    const neighborY = y + (face === 'top' ? -1 : face === 'bottom' ? 1 : 0);
    const neighborType = this.getTileAt(neighborX, neighborY);
    
    return neighborType === TILE_TYPES.VOID || neighborType === TILE_TYPES.FLOOR;
  }

  findPath(startX, startY, endX, endY) {
    return this.aStar(
      { x: Math.floor(startX), y: Math.floor(startY) },
      { x: Math.floor(endX), y: Math.floor(endY) }
    );
  }

  aStar(start, goal) {
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    gScore.set(`${start.x},${start.y}`, 0);
    fScore.set(`${start.x},${start.y}`, this.heuristic(start, goal));
    
    while (openSet.length > 0) {
      let current = openSet.reduce((a, b) => {
        const aKey = `${a.x},${a.y}`;
        const bKey = `${b.x},${b.y}`;
        return (fScore.get(aKey) || Infinity) < (fScore.get(bKey) || Infinity) ? a : b;
      });
      
      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(cameFrom, current);
      }
      
      openSet.splice(openSet.indexOf(current), 1);
      
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!this.isWalkable(neighbor.x, neighbor.y)) continue;
        
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const tentativeGScore = (gScore.get(`${current.x},${current.y}`) || Infinity) + 1;
        
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goal));
          
          if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    return [];
  }

  getNeighbors(node) {
    return [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 }
    ];
  }

  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = `${current.x},${current.y}`;
    
    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      path.unshift(current);
      currentKey = `${current.x},${current.y}`;
    }
    
    return path;
  }

  addHighlight(x, y, color = 0xff0000) {
    const screenPos = IsometricUtils.isoToScreen(x, y);
    const highlight = this.scene.add.rectangle(screenPos.x, screenPos.y, 
      this.tileWidth, this.tileHeight, color, 0.3);
    highlight.setDepth(999);
    return highlight;
  }

  destroy() {
    if (this.tileContainer) {
      this.tileContainer.destroy();
    }
    if (this.collisionGroup) {
      this.collisionGroup.destroy();
    }
  }
}