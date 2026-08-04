import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import MenuScene from './scenes/MenuScene.js';

const config = {
  type: Phaser.WEBGL,
  width: 1500,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: [MenuScene, GameScene],
  render: {
    pixelArt: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

export default game;