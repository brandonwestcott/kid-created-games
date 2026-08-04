import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    this.load.image('logo', 'assets/images/logo.png');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, centerY - 100, 'PORTAL PUZZLE GAME', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY, 'Two players needed:\nPlayer 1: WASD to move\nPlayer 2: Click to shoot portals', {
      fontSize: '24px',
      fill: '#cccccc',
      fontFamily: 'Arial, sans-serif',
      align: 'center'
    }).setOrigin(0.5);

    const startButton = this.add.text(centerX, centerY + 150, 'START GAME', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#ffffff', backgroundColor: '#006600' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#00ff00', backgroundColor: '#003300' });
    });
  }
}