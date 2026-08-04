import Phaser from 'phaser';
import { PHYSICS_CONFIG } from '../config/GameConstants.js';
import IsometricUtils from '../utils/IsometricUtils.js';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = PHYSICS_CONFIG.character.speed;
    this.jumpForce = PHYSICS_CONFIG.character.jumpForce;
    this.size = PHYSICS_CONFIG.character.size;
    this.terminalVelocity = PHYSICS_CONFIG.character.terminalVelocity;
    
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;
    this.inPortal = false;
    this.lastPosition = { x: x, y: y };

    this.createSprite(x, y);
    this.createAnimations();
    this.setupPhysics();
  }

  createSprite(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, 'player');
    this.sprite.setSize(this.size.width, this.size.height);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(1000);
  }

  createAnimations() {
    // Skip complex animations for placeholder graphics
    // Just use simple color changes to indicate state
    this.animationState = 'idle';
    this.sprite.setTint(0x4A90E2); // Default blue color
  }

  setupPhysics() {
    this.sprite.body.setGravityY(0); // Disable gravity for now to debug
    this.sprite.body.setMaxVelocity(this.speed * 2, this.terminalVelocity);
    this.sprite.body.setDragX(400);
    this.sprite.body.setVelocity(0, 0); // Start with no velocity
  }

  handleInput(input) {
    if (this.inPortal) return;

    const moveVector = { x: 0, y: 0 };

    if (input.left) moveVector.x -= 1;
    if (input.right) moveVector.x += 1;
    if (input.up) moveVector.y -= 1;
    if (input.down) moveVector.y += 1;

    const normalized = IsometricUtils.normalizeMovement(moveVector);
    
    this.velocity.x = normalized.x * this.speed;
    this.sprite.setVelocityX(this.velocity.x);

    if (input.jump && this.isGrounded) {
      this.jump();
    }

    this.updateAnimation(normalized);
  }

  jump() {
    this.sprite.setVelocityY(-this.jumpForce);
    this.isGrounded = false;
    this.sprite.play('player_jump');
    
    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('jump', { volume: 0.5 });
    }
  }

  updateAnimation(moveVector) {
    if (!this.isGrounded) {
      this.animationState = 'jump';
      this.sprite.setTint(0xFF6B35); // Orange when jumping
    } else if (Math.abs(moveVector.x) > 0.1 || Math.abs(moveVector.y) > 0.1) {
      this.animationState = 'walk';
      this.sprite.setTint(0x00FF00); // Green when walking
      this.sprite.setFlipX(moveVector.x < 0);
    } else {
      this.animationState = 'idle';
      this.sprite.setTint(0x4A90E2); // Blue when idle
    }
  }

  update(time, delta) {
    this.checkGrounded();
    this.updateDepth();
    this.checkMovement();
    
    if (this.scene.checkLevelComplete) {
      this.scene.checkLevelComplete();
    }
  }

  checkGrounded() {
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.sprite.body.touching.down;
    
    if (!wasGrounded && this.isGrounded) {
      this.onLanding();
    }
  }

  onLanding() {
    if (this.scene.audioManager) {
      const fallSpeed = Math.abs(this.sprite.body.velocity.y);
      const volume = IsometricUtils.clamp(fallSpeed / 200, 0.2, 0.8);
      this.scene.audioManager.playSound('footstep', { volume });
    }
  }

  updateDepth() {
    const worldPos = IsometricUtils.screenToIso(this.sprite.x, this.sprite.y);
    this.sprite.setDepth(IsometricUtils.getTileDepth(worldPos.x, worldPos.y) + 1);
  }

  checkMovement() {
    const currentPos = { x: this.sprite.x, y: this.sprite.y };
    const distance = IsometricUtils.getDistance(currentPos, this.lastPosition);
    
    if (distance > 5 && this.isGrounded) {
      this.playFootstepSound();
    }
    
    this.lastPosition = { ...currentPos };
  }

  playFootstepSound() {
    if (this.scene.audioManager && Math.random() < 0.3) {
      this.scene.audioManager.playSound('footstep', { 
        volume: 0.3,
        rate: 0.8 + Math.random() * 0.4
      });
    }
  }

  teleportTo(x, y, velocity = null) {
    this.inPortal = true;
    
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0.3,
      duration: 150,
      onComplete: () => {
        this.sprite.setPosition(x, y);
        
        if (velocity) {
          this.sprite.setVelocity(velocity.x, velocity.y);
        }
        
        this.scene.tweens.add({
          targets: this.sprite,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration: 150,
          onComplete: () => {
            this.inPortal = false;
          }
        });
      }
    });

    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('portal_travel', { volume: 0.8 });
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}