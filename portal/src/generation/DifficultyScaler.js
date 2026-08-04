export default class DifficultyScaler {
  constructor() {
    this.difficultyConfigs = {
      1: {
        difficulty: 1,
        roomSize: { width: 15, height: 10 },
        obstacleCount: { min: 2, max: 4 },
        portalCount: { min: 2, max: 2 },
        collectibles: 1,
        timeLimit: null,
        allowedMistakes: 'unlimited'
      },
      2: {
        difficulty: 2,
        roomSize: { width: 18, height: 12 },
        obstacleCount: { min: 3, max: 6 },
        portalCount: { min: 2, max: 4 },
        collectibles: 2,
        timeLimit: 120,
        allowedMistakes: 10
      },
      3: {
        difficulty: 3,
        roomSize: { width: 20, height: 15 },
        obstacleCount: { min: 5, max: 8 },
        portalCount: { min: 4, max: 6 },
        collectibles: 3,
        timeLimit: 90,
        allowedMistakes: 5,
        movingPlatforms: { min: 1, max: 2 }
      },
      4: {
        difficulty: 4,
        roomSize: { width: 23, height: 25 },
        obstacleCount: { min: 8, max: 12 },
        portalCount: { min: 6, max: 8 },
        collectibles: 4,
        timeLimit: 60,
        allowedMistakes: 3,
        movingPlatforms: { min: 2, max: 4 },
        portalDecay: 30
      }
    };
  }

  getConfig(difficulty) {
    const clampedDifficulty = Math.max(1, Math.min(4, Math.floor(difficulty)));
    return { ...this.difficultyConfigs[clampedDifficulty] };
  }

  scaleDifficulty(baseDifficulty, playerPerformance) {
    let adjustedDifficulty = baseDifficulty;
    
    if (playerPerformance.averageTime < playerPerformance.expectedTime * 0.7) {
      adjustedDifficulty += 0.5;
    }
    
    if (playerPerformance.mistakeCount < 2) {
      adjustedDifficulty += 0.3;
    }
    
    if (playerPerformance.averageTime > playerPerformance.expectedTime * 1.5) {
      adjustedDifficulty -= 0.3;
    }
    
    if (playerPerformance.mistakeCount > 8) {
      adjustedDifficulty -= 0.5;
    }
    
    return Math.max(1, Math.min(4, adjustedDifficulty));
  }

  getProgressionCurve(level) {
    const baseDifficulty = Math.floor((level - 1) / 5) + 1;
    const subLevel = ((level - 1) % 5) + 1;
    
    const progressionModifier = {
      1: 0,
      2: 0.1,
      3: 0.2,
      4: 0.4,
      5: 0.5
    };
    
    return Math.min(4, baseDifficulty + progressionModifier[subLevel]);
  }

  adjustForCooperativePlay(config, playerCount = 2) {
    const adjustedConfig = { ...config };
    
    if (playerCount > 1) {
      adjustedConfig.timeLimit = adjustedConfig.timeLimit ? adjustedConfig.timeLimit * 1.2 : null;
      adjustedConfig.allowedMistakes = adjustedConfig.allowedMistakes === 'unlimited' ? 
        'unlimited' : adjustedConfig.allowedMistakes + 2;
      
      adjustedConfig.obstacleCount.max += 1;
      adjustedConfig.collectibles += 1;
    }
    
    return adjustedConfig;
  }

  generateAdaptiveDifficulty(recentPerformance, targetDifficulty) {
    const performanceScore = this.calculatePerformanceScore(recentPerformance);
    
    let adaptiveDifficulty = targetDifficulty;
    
    if (performanceScore > 0.8) {
      adaptiveDifficulty += 0.5;
    } else if (performanceScore > 0.6) {
      adaptiveDifficulty += 0.2;
    } else if (performanceScore < 0.3) {
      adaptiveDifficulty -= 0.5;
    } else if (performanceScore < 0.5) {
      adaptiveDifficulty -= 0.2;
    }
    
    return Math.max(1, Math.min(4, adaptiveDifficulty));
  }

  calculatePerformanceScore(performance) {
    if (!performance || performance.length === 0) return 0.5;
    
    const recentGames = performance.slice(-5);
    let totalScore = 0;
    
    for (const game of recentGames) {
      let gameScore = 0;
      
      if (game.completed) gameScore += 0.5;
      
      if (game.timeRatio && game.timeRatio <= 1) {
        gameScore += (1 - game.timeRatio) * 0.3;
      }
      
      if (game.mistakeRatio && game.mistakeRatio <= 1) {
        gameScore += (1 - game.mistakeRatio) * 0.2;
      }
      
      totalScore += Math.min(1, gameScore);
    }
    
    return totalScore / recentGames.length;
  }

  getHints(difficulty, puzzleType) {
    const hints = {
      1: [
        "Try placing portals on opposite walls",
        "Walk through one portal to exit the other",
        "Look for flat wall surfaces to place portals"
      ],
      2: [
        "Build momentum by falling through portals",
        "Use portal placement order strategically",
        "Some gaps require speed to cross"
      ],
      3: [
        "Chain multiple portal jumps together",
        "Consider vertical momentum for high platforms",
        "Portal angles affect exit direction"
      ],
      4: [
        "Master advanced portal techniques",
        "Think several moves ahead",
        "Optimize your portal placement sequence"
      ]
    };
    
    const difficultyLevel = Math.min(4, Math.max(1, Math.floor(difficulty)));
    return hints[difficultyLevel] || hints[1];
  }
}