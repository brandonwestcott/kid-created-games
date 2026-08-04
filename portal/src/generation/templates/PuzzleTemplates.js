export default class PuzzleTemplates {
  constructor() {
    this.templates = {
      1: [ // Beginner templates
        {
          name: "simple_gap",
          difficulty: 1,
          requiredPortals: 2,
          pattern: {
            type: "horizontal_gap",
            gapWidth: 5,
            gapHeight: 2
          },
          description: "Basic portal placement across a simple gap"
        },
        {
          name: "basic_elevation",
          difficulty: 1,
          requiredPortals: 2,
          pattern: {
            type: "elevation_change",
            heightDifference: 3,
            platformSize: 4
          },
          description: "Simple elevation change requiring portal placement"
        }
      ],
      2: [ // Intermediate templates
        {
          name: "momentum_puzzle",
          difficulty: 2,
          requiredPortals: 2,
          pattern: {
            type: "momentum_based",
            dropHeight: 6,
            requiredSpeed: 200,
            targetDistance: 8
          },
          description: "Use falling momentum to cross large gaps"
        },
        {
          name: "corner_navigation",
          difficulty: 2,
          requiredPortals: 2,
          pattern: {
            type: "corner_puzzle",
            corners: 2,
            pathComplexity: "medium"
          },
          description: "Navigate around corners using portal placement"
        },
        {
          name: "sequential_portals",
          difficulty: 2,
          requiredPortals: 4,
          pattern: {
            type: "sequence_puzzle",
            stages: 2,
            portalReuse: true
          },
          description: "Multiple portal placements in sequence"
        }
      ],
      3: [ // Advanced templates
        {
          name: "multi_portal",
          difficulty: 3,
          requiredPortals: 4,
          pattern: {
            type: "multi_stage",
            stages: 3,
            collectibleGating: true
          },
          description: "Complex multi-stage puzzle with collectible gates"
        },
        {
          name: "precision_timing",
          difficulty: 3,
          requiredPortals: 2,
          pattern: {
            type: "timing_based",
            movingElements: 1,
            timingWindow: 3
          },
          description: "Precise timing required for portal placement"
        },
        {
          name: "vertical_challenge",
          difficulty: 3,
          requiredPortals: 4,
          pattern: {
            type: "vertical_navigation",
            levels: 4,
            gravityPlay: true
          },
          description: "Vertical navigation using gravity and momentum"
        }
      ],
      4: [ // Expert templates
        {
          name: "master_puzzle",
          difficulty: 4,
          requiredPortals: 6,
          pattern: {
            type: "master_challenge",
            complexity: "maximum",
            allMechanics: true
          },
          description: "Ultimate challenge combining all mechanics"
        },
        {
          name: "speed_run",
          difficulty: 4,
          requiredPortals: 4,
          pattern: {
            type: "speed_challenge",
            timeLimit: 30,
            optimalPath: true
          },
          description: "Speed-focused puzzle requiring optimal execution"
        },
        {
          name: "puzzle_maze",
          difficulty: 4,
          requiredPortals: 8,
          pattern: {
            type: "maze_puzzle",
            deadEnds: 3,
            portalDecay: true
          },
          description: "Complex maze with portal decay mechanics"
        }
      ]
    };
  }

  getTemplatesForDifficulty(difficulty) {
    const clampedDifficulty = Math.max(1, Math.min(4, Math.floor(difficulty)));
    return [...this.templates[clampedDifficulty]];
  }

  getTemplate(name) {
    for (const difficultyLevel of Object.values(this.templates)) {
      const template = difficultyLevel.find(t => t.name === name);
      if (template) return { ...template };
    }
    return null;
  }

  getAllTemplates() {
    const allTemplates = [];
    for (const difficultyLevel of Object.values(this.templates)) {
      allTemplates.push(...difficultyLevel);
    }
    return allTemplates;
  }

  getRandomTemplate(difficulty) {
    const templates = this.getTemplatesForDifficulty(difficulty);
    return templates[Math.floor(Math.random() * templates.length)];
  }

  validateTemplate(template) {
    const required = ['name', 'difficulty', 'requiredPortals', 'pattern'];
    return required.every(field => template.hasOwnProperty(field));
  }

  createCustomTemplate(config) {
    const template = {
      name: config.name || 'custom_puzzle',
      difficulty: config.difficulty || 1,
      requiredPortals: config.requiredPortals || 2,
      pattern: config.pattern || { type: 'simple_gap' },
      description: config.description || 'Custom puzzle template'
    };

    if (this.validateTemplate(template)) {
      return template;
    }
    
    throw new Error('Invalid template configuration');
  }

  getTemplatesByMechanic(mechanic) {
    const allTemplates = this.getAllTemplates();
    return allTemplates.filter(template => {
      const patternType = template.pattern.type;
      switch (mechanic) {
        case 'momentum':
          return patternType.includes('momentum') || patternType.includes('speed');
        case 'precision':
          return patternType.includes('timing') || patternType.includes('precision');
        case 'multi_stage':
          return patternType.includes('multi') || patternType.includes('sequence');
        case 'vertical':
          return patternType.includes('vertical') || patternType.includes('elevation');
        default:
          return false;
      }
    });
  }

  generateProgressiveSequence(startDifficulty, endDifficulty, length) {
    const sequence = [];
    const difficultyStep = (endDifficulty - startDifficulty) / (length - 1);
    
    for (let i = 0; i < length; i++) {
      const currentDifficulty = startDifficulty + (difficultyStep * i);
      const template = this.getRandomTemplate(Math.ceil(currentDifficulty));
      sequence.push(template);
    }
    
    return sequence;
  }

  getTemplateStats() {
    const stats = {};
    
    for (const [difficulty, templates] of Object.entries(this.templates)) {
      stats[difficulty] = {
        count: templates.length,
        avgPortals: templates.reduce((sum, t) => sum + t.requiredPortals, 0) / templates.length,
        mechanics: [...new Set(templates.map(t => t.pattern.type))]
      };
    }
    
    return stats;
  }

  adaptTemplateForPlayers(template, playerCount) {
    const adaptedTemplate = { ...template };
    
    if (playerCount > 2) {
      adaptedTemplate.requiredPortals = Math.ceil(template.requiredPortals * 1.2);
      adaptedTemplate.pattern = {
        ...template.pattern,
        complexity: 'increased',
        cooperationRequired: true
      };
    }
    
    return adaptedTemplate;
  }
}