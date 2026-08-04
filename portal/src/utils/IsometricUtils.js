import { TILE_CONFIG } from '../config/GameConstants.js';

export default class IsometricUtils {
  static screenToIso(screenX, screenY) {
    const isoX = (screenX / 32) + (screenY / 16);
    const isoY = (screenY / 16) - (screenX / 32);
    return { x: isoX, y: isoY };
  }

  static isoToScreen(isoX, isoY) {
    const screenX = (isoX - isoY) * 32;
    const screenY = (isoX + isoY) * 16;
    return { x: screenX, y: screenY };
  }

  static worldToScreen(worldX, worldY) {
    return this.isoToScreen(worldX, worldY);
  }

  static screenToWorld(screenX, screenY) {
    return this.screenToIso(screenX, screenY);
  }

  static getTileDepth(isoX, isoY) {
    return (isoX + isoY) * 1000;
  }

  static normalizeMovement(velocity) {
    const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (magnitude > 0) {
      return {
        x: velocity.x / magnitude,
        y: velocity.y / magnitude
      };
    }
    return { x: 0, y: 0 };
  }

  static getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  static radToDeg(radians) {
    return radians * 180 / Math.PI;
  }
}