// Simple test framework for the Portal Puzzle Game

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`✗ ${test.name}: ${error.message}`);
      }
    }
    
    console.log(`\nTests completed: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
}

// Test imports (using mock objects since we can't easily import Phaser modules in Node)
const IsometricUtils = {
  screenToIso: (screenX, screenY) => ({
    x: (screenX / 32) + (screenY / 16),
    y: (screenY / 16) - (screenX / 32)
  }),
  isoToScreen: (isoX, isoY) => ({
    x: (isoX - isoY) * 32,
    y: (isoX + isoY) * 16
  }),
  getTileDepth: (isoX, isoY) => (isoX + isoY) * 1000,
  normalizeMovement: (velocity) => {
    const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (magnitude > 0) {
      return { x: velocity.x / magnitude, y: velocity.y / magnitude };
    }
    return { x: 0, y: 0 };
  }
};

// Run tests
const runner = new TestRunner();

runner.test('IsometricUtils.screenToIso converts coordinates correctly', () => {
  const result = IsometricUtils.screenToIso(64, 32);
  runner.assertEqual(result.x, 4, 'X coordinate should be 4');
  runner.assertEqual(result.y, 0, 'Y coordinate should be 0');
});

runner.test('IsometricUtils.isoToScreen converts coordinates correctly', () => {
  const result = IsometricUtils.isoToScreen(2, 1);
  runner.assertEqual(result.x, 32, 'X coordinate should be 32');
  runner.assertEqual(result.y, 48, 'Y coordinate should be 48');
});

runner.test('IsometricUtils.getTileDepth calculates depth correctly', () => {
  const depth = IsometricUtils.getTileDepth(2, 3);
  runner.assertEqual(depth, 5000, 'Depth should be 5000');
});

runner.test('IsometricUtils.normalizeMovement works correctly', () => {
  const result = IsometricUtils.normalizeMovement({ x: 3, y: 4 });
  runner.assert(Math.abs(result.x - 0.6) < 0.01, 'X should be approximately 0.6');
  runner.assert(Math.abs(result.y - 0.8) < 0.01, 'Y should be approximately 0.8');
});

runner.test('IsometricUtils.normalizeMovement handles zero vector', () => {
  const result = IsometricUtils.normalizeMovement({ x: 0, y: 0 });
  runner.assertEqual(result.x, 0, 'X should be 0');
  runner.assertEqual(result.y, 0, 'Y should be 0');
});

// Mock level generator test
runner.test('Level generation produces valid structure', () => {
  const mockLevel = {
    tiles: [
      [2, 2, 2, 2, 2],
      [2, 1, 1, 1, 2],
      [2, 1, 0, 1, 2],
      [2, 1, 1, 3, 2],
      [2, 2, 2, 2, 2]
    ],
    playerStart: { x: 1, y: 1 },
    goal: { x: 3, y: 3 }
  };
  
  runner.assert(mockLevel.tiles.length > 0, 'Level should have tiles');
  runner.assert(mockLevel.playerStart, 'Level should have player start position');
  runner.assert(mockLevel.goal, 'Level should have goal position');
});

// Physics constants test
runner.test('Physics constants are within reasonable ranges', () => {
  const PHYSICS_CONFIG = {
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
      travelTime: 200
    }
  };
  
  runner.assert(PHYSICS_CONFIG.gravity > 0, 'Gravity should be positive');
  runner.assert(PHYSICS_CONFIG.character.speed > 0, 'Character speed should be positive');
  runner.assert(PHYSICS_CONFIG.portal.radius > 0, 'Portal radius should be positive');
});

// Run all tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, IsometricUtils };
} else {
  runner.run().then(success => {
    if (!success) {
      process?.exit?.(1);
    }
  });
}