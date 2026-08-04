import Phaser from 'phaser';
import Player from '../entities/Player.js';
import PortalManager from '../systems/PortalManager.js';
import InputManager from '../systems/InputManager.js';
import IsometricTileMap from '../graphics/IsometricTileMap.js';
import AudioManager from '../audio/AudioManager.js';
import LevelGenerator from '../generation/LevelGenerator.js';
import { PHYSICS_CONFIG } from '../config/GameConstants.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.loadAssets();
  }

  create() {
    this.setupManagers();
    this.createLevel();
    this.setupInput();
    this.setupUI();
  }

  update(time, delta) {
    if (this.inputManager) {
      this.inputManager.update();
    }
    if (this.player) {
      this.player.update(time, delta);
    }
    if (this.portalManager) {
      this.portalManager.update(time, delta);
    }
  }

  loadAssets() {
    this.createPlaceholderAssets();
  }

  createPlaceholderAssets() {
    // Create placeholder graphics instead of loading external files
    this.load.image('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    this.load.image('floor', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    this.load.image('portal_orange', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    this.load.image('portal_blue', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    
    // Create a simple character sprite immediately
    this.createPlayerSprite();
  }

  createPlayerSprite() {
    const graphics = this.add.graphics();
    
    // Create a simple character sprite
    graphics.fillStyle(0x4A90E2); // Body color
    graphics.fillRect(8, 16, 16, 24); // Body
    
    graphics.fillStyle(0xFFB84D); // Head color
    graphics.fillRect(10, 8, 12, 12); // Head
    
    graphics.fillStyle(0xFF6B35); // Accent color
    graphics.fillRect(6, 20, 4, 8); // Left arm
    graphics.fillRect(22, 20, 4, 8); // Right arm
    graphics.fillRect(12, 32, 3, 12); // Left leg
    graphics.fillRect(17, 32, 3, 12); // Right leg
    
    graphics.generateTexture('player', 32, 48);
    graphics.destroy();
  }

  setupManagers() {
    this.audioManager = new AudioManager(this);
    this.portalManager = new PortalManager(this);
    this.inputManager = new InputManager(this);
    this.levelGenerator = new LevelGenerator();
  }

  createLevel() {
    const levelData = this.levelGenerator.generateLevel(1, Date.now());
    this.tileMap = new IsometricTileMap(this, levelData);
    
    // Place player at grid position
    const playerX = (levelData.playerStart.x * 64) + 400 + 32;
    const playerY = (levelData.playerStart.y * 64) + 300 + 32;
    this.player = new Player(this, playerX, playerY);
    
    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setLerp(0.1, 0.1);
    this.cameras.main.setZoom(1.0);
  }

  setupInput() {
    this.inputManager.setupInput();
  }

  setupUI() {
    this.add.text(10, 10, 'Portal Puzzle Game', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setScrollFactor(0);

    this.add.text(10, 40, 'Player 1: WASD to move, SPACE to jump', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setScrollFactor(0);

    this.add.text(10, 60, 'Player 2: Click to place portals', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setScrollFactor(0);
  }

  onPortalShoot(x, y) {
    this.portalManager.shootPortal(x, y);
  }

  onPlayerMove(inputState) {
    if (this.player) {
      this.player.handleInput(inputState);
    }
  }

  checkLevelComplete() {
    if (this.player && this.tileMap) {
      const playerPos = this.tileMap.screenToIso(this.player.sprite.x, this.player.sprite.y);
      const goal = this.tileMap.levelData.goal;
      
      if (Math.abs(playerPos.x - goal.x) < 0.5 && Math.abs(playerPos.y - goal.y) < 0.5) {
        this.completeLevel();
      }
    }
  }

  completeLevel() {
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Level Complete!', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }
}