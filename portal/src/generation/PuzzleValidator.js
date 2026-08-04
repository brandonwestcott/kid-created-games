import { TILE_TYPES, PHYSICS_CONFIG } from '../config/GameConstants.js';

export default class PuzzleValidator {
  constructor() {
    this.maxSimulationSteps = 1000;
    this.jumpDistance = 4;
  }

  validateLevel(levelData) {
    const basicReachability = this.checkBasicReachability(levelData);
    if (basicReachability.pathExists) {
      return { 
        isValid: false, 
        reason: "Level solvable without portals",
        solution: null
      };
    }

    const portalSolutions = this.simulatePortalSolutions(levelData);
    if (portalSolutions.length === 0) {
      return { 
        isValid: false, 
        reason: "No valid portal solutions found",
        solution: null
      };
    }

    const collectibleCheck = this.validateCollectibleAccess(levelData, portalSolutions[0]);
    if (!collectibleCheck.allAccessible) {
      return { 
        isValid: false, 
        reason: `Collectible at ${collectibleCheck.inaccessible[0]} unreachable`,
        solution: null
      };
    }

    const complexityCheck = this.validateSolutionComplexity(portalSolutions[0], levelData);
    if (!complexityCheck.valid) {
      return { 
        isValid: false, 
        reason: complexityCheck.reason,
        solution: null
      };
    }

    return {
      isValid: true,
      solution: portalSolutions[0],
      alternativeSolutions: portalSolutions.slice(1, 3)
    };
  }

  checkBasicReachability(levelData) {
    const path = this.aStar(
      levelData.playerStart,
      levelData.goal,
      levelData.tiles,
      false
    );
    
    return {
      pathExists: path.length > 0,
      path: path
    };
  }

  simulatePortalSolutions(levelData) {
    const solutions = [];
    const portalCombinations = this.generatePortalCombinations(levelData.portalSurfaces, 2);
    
    for (const combination of portalCombinations) {
      const solution = this.testPortalCombination(levelData, combination);
      if (solution.valid) {
        solutions.push(solution);
      }
      
      if (solutions.length >= 5) break;
    }
    
    return solutions.sort((a, b) => a.complexity - b.complexity);
  }

  generatePortalCombinations(surfaces, count) {
    const combinations = [];
    
    for (let i = 0; i < surfaces.length; i++) {
      for (let j = i + 1; j < surfaces.length; j++) {
        combinations.push([surfaces[i], surfaces[j]]);
      }
    }
    
    return combinations;
  }

  testPortalCombination(levelData, portals) {
    const [portal1, portal2] = portals;
    const modifiedLevel = this.createTestLevel(levelData, portal1, portal2);
    
    const pathToGoal = this.aStar(
      levelData.playerStart,
      levelData.goal,
      modifiedLevel.tiles,
      true,
      modifiedLevel.portals
    );
    
    if (pathToGoal.length === 0) {
      return { valid: false };
    }
    
    const collectiblePaths = this.checkCollectiblePaths(modifiedLevel);
    
    return {
      valid: true,
      portals: [portal1, portal2],
      portalCount: 2,
      pathToGoal: pathToGoal,
      collectiblePaths: collectiblePaths,
      complexity: this.calculateComplexity(pathToGoal, portals),
      estimatedTime: this.estimateCompletionTime(pathToGoal, portals)
    };
  }

  createTestLevel(levelData, portal1, portal2) {
    return {
      tiles: JSON.parse(JSON.stringify(levelData.tiles)),
      portals: [portal1, portal2],
      playerStart: levelData.playerStart,
      goal: levelData.goal,
      collectibles: levelData.collectibles
    };
  }

  aStar(start, goal, tiles, usePortals = false, portals = []) {
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = `${start.x},${start.y}`;
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, goal));
    
    let steps = 0;
    
    while (openSet.length > 0 && steps < this.maxSimulationSteps) {
      steps++;
      
      let current = openSet.reduce((a, b) => {
        const aKey = `${a.x},${a.y}`;
        const bKey = `${b.x},${b.y}`;
        return (fScore.get(aKey) || Infinity) < (fScore.get(bKey) || Infinity) ? a : b;
      });
      
      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(cameFrom, current);
      }
      
      openSet.splice(openSet.indexOf(current), 1);
      
      const neighbors = this.getNeighbors(current, tiles, usePortals, portals);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const moveCost = neighbor.isPortalMove ? 1 : 1;
        const tentativeGScore = (gScore.get(`${current.x},${current.y}`) || Infinity) + moveCost;
        
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

  getNeighbors(node, tiles, usePortals = false, portals = []) {
    const neighbors = [];
    
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    
    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;
      
      if (this.isWalkable(newX, newY, tiles)) {
        neighbors.push({ x: newX, y: newY, isPortalMove: false });
      }
    }
    
    for (const dir of directions) {
      for (let distance = 2; distance <= this.jumpDistance; distance++) {
        const jumpX = node.x + dir.x * distance;
        const jumpY = node.y + dir.y * distance;
        
        if (this.isWalkable(jumpX, jumpY, tiles) && this.hasJumpClearance(node, { x: jumpX, y: jumpY }, tiles)) {
          neighbors.push({ x: jumpX, y: jumpY, isPortalMove: false });
          break;
        }
      }
    }
    
    if (usePortals && portals.length >= 2) {
      const portalConnections = this.getPortalConnections(node, portals, tiles);
      neighbors.push(...portalConnections);
    }
    
    return neighbors;
  }

  getPortalConnections(node, portals, tiles) {
    const connections = [];
    
    for (let i = 0; i < portals.length; i++) {
      const portal = portals[i];
      const portalDistance = Math.abs(node.x - portal.x) + Math.abs(node.y - portal.y);
      
      if (portalDistance <= 2) {
        for (let j = 0; j < portals.length; j++) {
          if (i !== j) {
            const exitPortal = portals[j];
            const exitX = exitPortal.x + exitPortal.normal.x;
            const exitY = exitPortal.y + exitPortal.normal.y;
            
            if (this.isWalkable(exitX, exitY, tiles)) {
              connections.push({
                x: exitX,
                y: exitY,
                isPortalMove: true,
                fromPortal: i,
                toPortal: j
              });
            }
          }
        }
      }
    }
    
    return connections;
  }

  hasJumpClearance(start, end, tiles) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 1; i < steps; i++) {
      const checkX = Math.round(start.x + (dx * i) / steps);
      const checkY = Math.round(start.y + (dy * i) / steps);
      
      if (!this.isWalkable(checkX, checkY, tiles)) {
        return false;
      }
    }
    
    return true;
  }

  isWalkable(x, y, tiles) {
    if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) {
      return false;
    }
    
    const tileType = tiles[y][x];
    return tileType === TILE_TYPES.FLOOR || tileType === TILE_TYPES.GOAL;
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

  checkCollectiblePaths(levelData) {
    const collectiblePaths = [];
    
    for (const collectible of levelData.collectibles) {
      const pathFromStart = this.aStar(
        levelData.playerStart,
        collectible,
        levelData.tiles,
        true,
        levelData.portals
      );
      
      const pathToGoal = this.aStar(
        collectible,
        levelData.goal,
        levelData.tiles,
        true,
        levelData.portals
      );
      
      collectiblePaths.push({
        collectible: collectible,
        accessible: pathFromStart.length > 0 && pathToGoal.length > 0,
        pathFromStart: pathFromStart,
        pathToGoal: pathToGoal
      });
    }
    
    return collectiblePaths;
  }

  validateCollectibleAccess(levelData, solution) {
    const inaccessible = [];
    
    for (const collectible of levelData.collectibles) {
      const pathToCollectible = this.aStar(
        levelData.playerStart,
        collectible,
        levelData.tiles,
        true,
        solution.portals
      );
      
      if (pathToCollectible.length === 0) {
        inaccessible.push(`${collectible.x},${collectible.y}`);
      }
    }
    
    return {
      allAccessible: inaccessible.length === 0,
      inaccessible: inaccessible
    };
  }

  validateSolutionComplexity(solution, levelData) {
    if (solution.complexity < levelData.minPortalCount) {
      return {
        valid: false,
        reason: "Solution too simple"
      };
    }
    
    if (solution.complexity > levelData.maxPortalCount) {
      return {
        valid: false,
        reason: "Solution too complex"
      };
    }
    
    if (solution.estimatedTime < 5) {
      return {
        valid: false,
        reason: "Solution too quick"
      };
    }
    
    return { valid: true };
  }

  calculateComplexity(path, portals) {
    let complexity = portals.length;
    
    complexity += Math.floor(path.length / 10);
    
    const portalUses = path.filter(step => step.isPortalMove).length;
    complexity += portalUses * 2;
    
    return complexity;
  }

  estimateCompletionTime(path, portals) {
    const baseTime = path.length * 0.5;
    const portalTime = portals.length * 2;
    const thinkingTime = Math.sqrt(portals.length) * 3;
    
    return baseTime + portalTime + thinkingTime;
  }
}