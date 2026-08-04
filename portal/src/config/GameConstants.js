export const PHYSICS_CONFIG = {
  gravity: 800,
  character: {
    speed: 120,
    jumpForce: 280,
    size: { width: 24, height: 40 },
    terminalVelocity: 600
  },
  portal: {
    radius: 32,
    maxRange: 800,
    travelTime: 200,
    momentum: {
      preservation: 1.0,
      minSpeed: 50,
      maxSpeed: 400
    }
  }
};

export const TILE_CONFIG = {
  width: 64,
  height: 32,
  worldWidth: 23,
  worldHeight: 25
};

export const TILE_TYPES = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
  GOAL: 3
};

export const PORTAL_COLORS = {
  ORANGE: '#FF6B35',
  BLUE: '#4A90E2'
};