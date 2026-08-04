import Phaser from 'phaser';

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.mousePressed = false;
    this.inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false
    };
  }

  setupInput() {
    this.setupKeyboard();
    this.setupMouse();
  }

  setupKeyboard() {
    this.keys = this.scene.input.keyboard.addKeys({
      'W': Phaser.Input.Keyboard.KeyCodes.W,
      'A': Phaser.Input.Keyboard.KeyCodes.A,
      'S': Phaser.Input.Keyboard.KeyCodes.S,
      'D': Phaser.Input.Keyboard.KeyCodes.D,
      'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
      'UP': Phaser.Input.Keyboard.KeyCodes.UP,
      'LEFT': Phaser.Input.Keyboard.KeyCodes.LEFT,
      'DOWN': Phaser.Input.Keyboard.KeyCodes.DOWN,
      'RIGHT': Phaser.Input.Keyboard.KeyCodes.RIGHT
    });
  }

  setupMouse() {
    this.scene.input.on('pointerdown', this.onMouseDown.bind(this));
    this.scene.input.on('pointerup', this.onMouseUp.bind(this));
  }

  onMouseDown(pointer) {
    if (!this.mousePressed) {
      this.mousePressed = true;
      const worldPos = this.getWorldPosition(pointer.x, pointer.y);
      
      if (this.scene.onPortalShoot) {
        this.scene.onPortalShoot(worldPos.x, worldPos.y);
      }
    }
  }

  onMouseUp(pointer) {
    this.mousePressed = false;
  }

  getWorldPosition(screenX, screenY) {
    const camera = this.scene.cameras.main;
    const worldX = screenX + camera.scrollX;
    const worldY = screenY + camera.scrollY;
    return { x: worldX, y: worldY };
  }

  update() {
    this.updateInputState();
    this.sendInputToPlayer();
  }

  updateInputState() {
    this.inputState.left = this.keys.A.isDown || this.keys.LEFT.isDown;
    this.inputState.right = this.keys.D.isDown || this.keys.RIGHT.isDown;
    this.inputState.up = this.keys.W.isDown || this.keys.UP.isDown;
    this.inputState.down = this.keys.S.isDown || this.keys.DOWN.isDown;
    this.inputState.jump = Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }

  sendInputToPlayer() {
    if (this.scene.onPlayerMove) {
      this.scene.onPlayerMove(this.inputState);
    }
  }

  isMoving() {
    return this.inputState.left || this.inputState.right || 
           this.inputState.up || this.inputState.down;
  }

  getMovementVector() {
    const vector = { x: 0, y: 0 };
    
    if (this.inputState.left) vector.x -= 1;
    if (this.inputState.right) vector.x += 1;
    if (this.inputState.up) vector.y -= 1;
    if (this.inputState.down) vector.y += 1;
    
    return vector;
  }

  destroy() {
    if (this.scene.input) {
      this.scene.input.off('pointerdown');
      this.scene.input.off('pointerup');
    }
  }
}