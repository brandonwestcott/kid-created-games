import Portal from '../entities/Portal.js';
import IsometricUtils from '../utils/IsometricUtils.js';
import { PHYSICS_CONFIG, TILE_TYPES } from '../config/GameConstants.js';

export default class PortalManager {
  constructor(scene) {
    this.scene = scene;
    this.portals = { orange: null, blue: null };
    this.nextPortal = 'orange';
    this.maxPortalDistance = PHYSICS_CONFIG.portal.maxRange;
    this.surfaceDetector = new SurfaceDetector(scene);
  }

  shootPortal(screenX, screenY) {
    if (!this.scene.tileMap) return;
    
    const validSurface = this.surfaceDetector.findValidSurface(screenX, screenY);
    
    if (!validSurface) {
      this.playInvalidSound();
      return;
    }
    
    this.createPortal(validSurface.x, validSurface.y, validSurface.normal);
  }

  createPortal(x, y, normal) {
    const portalType = this.nextPortal;
    
    if (this.portals[portalType]) {
      this.portals[portalType].destroy();
    }
    
    this.portals[portalType] = new Portal(this.scene, x, y, portalType, normal);
    
    this.linkPortals();
    this.toggleNextPortal();
    this.playPlaceSound(portalType);
  }

  linkPortals() {
    if (this.portals.orange && this.portals.blue) {
      this.portals.orange.linkTo(this.portals.blue);
    }
  }

  toggleNextPortal() {
    this.nextPortal = this.nextPortal === 'orange' ? 'blue' : 'orange';
  }

  playPlaceSound(portalType) {
    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('portal_place', {
        volume: 0.7,
        rate: portalType === 'orange' ? 1.2 : 0.8
      });
    }
  }

  playInvalidSound() {
    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('portal_place', {
        volume: 0.3,
        rate: 0.5
      });
    }
  }

  update(time, delta) {
    Object.values(this.portals).forEach(portal => {
      if (portal && portal.active) {
        portal.updateDepth();
      }
    });
  }

  getPortal(type) {
    return this.portals[type];
  }

  hasActivePortals() {
    return this.portals.orange && this.portals.blue && 
           this.portals.orange.active && this.portals.blue.active;
  }

  clearPortals() {
    Object.values(this.portals).forEach(portal => {
      if (portal) portal.destroy();
    });
    this.portals = { orange: null, blue: null };
    this.nextPortal = 'orange';
  }

  destroy() {
    this.clearPortals();
  }
}

class SurfaceDetector {
  constructor(scene) {
    this.scene = scene;
    this.minSurfaceSize = 64;
  }

  findValidSurface(screenX, screenY) {
    if (!this.scene.tileMap) return null;
    
    const worldPos = IsometricUtils.screenToIso(screenX, screenY);
    const tileX = Math.floor(worldPos.x);
    const tileY = Math.floor(worldPos.y);
    
    if (!this.isInBounds(tileX, tileY)) return null;
    
    const surfaces = this.checkAllSurfaces(tileX, tileY);
    
    return this.findBestSurface(surfaces, screenX, screenY);
  }

  isInBounds(tileX, tileY) {
    if (!this.scene.tileMap || !this.scene.tileMap.levelData) return false;
    
    const levelData = this.scene.tileMap.levelData;
    return tileX >= 0 && tileX < levelData.tiles[0].length && 
           tileY >= 0 && tileY < levelData.tiles.length;
  }

  checkAllSurfaces(tileX, tileY) {
    const surfaces = [];
    const levelData = this.scene.tileMap.levelData;
    const currentTile = levelData.tiles[tileY][tileX];
    
    if (currentTile === TILE_TYPES.WALL) {
      const neighbors = this.getNeighbors(tileX, tileY);
      
      if (neighbors.left === TILE_TYPES.VOID || neighbors.left === TILE_TYPES.FLOOR) {
        surfaces.push(this.createSurface(tileX, tileY, 'left', { x: -1, y: 0 }));
      }
      
      if (neighbors.right === TILE_TYPES.VOID || neighbors.right === TILE_TYPES.FLOOR) {
        surfaces.push(this.createSurface(tileX, tileY, 'right', { x: 1, y: 0 }));
      }
      
      if (neighbors.top === TILE_TYPES.VOID || neighbors.top === TILE_TYPES.FLOOR) {
        surfaces.push(this.createSurface(tileX, tileY, 'top', { x: 0, y: -1 }));
      }
      
      if (neighbors.bottom === TILE_TYPES.VOID || neighbors.bottom === TILE_TYPES.FLOOR) {
        surfaces.push(this.createSurface(tileX, tileY, 'bottom', { x: 0, y: 1 }));
      }
    }
    
    return surfaces;
  }

  getNeighbors(tileX, tileY) {
    const levelData = this.scene.tileMap.levelData;
    const tiles = levelData.tiles;
    
    return {
      left: tileX > 0 ? tiles[tileY][tileX - 1] : TILE_TYPES.VOID,
      right: tileX < tiles[0].length - 1 ? tiles[tileY][tileX + 1] : TILE_TYPES.VOID,
      top: tileY > 0 ? tiles[tileY - 1][tileX] : TILE_TYPES.VOID,
      bottom: tileY < tiles.length - 1 ? tiles[tileY + 1][tileX] : TILE_TYPES.VOID
    };
  }

  createSurface(tileX, tileY, face, normal) {
    const screenPos = IsometricUtils.isoToScreen(tileX, tileY);
    
    let surfaceX = screenPos.x;
    let surfaceY = screenPos.y;
    
    switch (face) {
      case 'left':
        surfaceX -= 32;
        break;
      case 'right':
        surfaceX += 32;
        break;
      case 'top':
        surfaceY -= 16;
        break;
      case 'bottom':
        surfaceY += 16;
        break;
    }
    
    return {
      x: surfaceX,
      y: surfaceY,
      face: face,
      normal: normal,
      tileX: tileX,
      tileY: tileY
    };
  }

  findBestSurface(surfaces, targetX, targetY) {
    if (surfaces.length === 0) return null;
    
    let bestSurface = surfaces[0];
    let minDistance = IsometricUtils.getDistance(
      { x: targetX, y: targetY },
      { x: bestSurface.x, y: bestSurface.y }
    );
    
    for (let i = 1; i < surfaces.length; i++) {
      const distance = IsometricUtils.getDistance(
        { x: targetX, y: targetY },
        { x: surfaces[i].x, y: surfaces[i].y }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        bestSurface = surfaces[i];
      }
    }
    
    return bestSurface;
  }

  validateSurface(surface) {
    if (!surface) return false;
    
    const hasMinimumSize = this.checkSurfaceSize(surface);
    const hasAccess = this.checkAccessPath(surface);
    const notBlocked = this.checkNotBlocked(surface);
    
    return hasMinimumSize && hasAccess && notBlocked;
  }

  checkSurfaceSize(surface) {
    return true;
  }

  checkAccessPath(surface) {
    return true;
  }

  checkNotBlocked(surface) {
    return true;
  }
}