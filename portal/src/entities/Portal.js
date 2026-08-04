import Phaser from 'phaser';
import { PHYSICS_CONFIG, PORTAL_COLORS } from '../config/GameConstants.js';
import IsometricUtils from '../utils/IsometricUtils.js';

export default class Portal {
  constructor(scene, x, y, type, normal = { x: 0, y: 1 }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type; // 'orange' or 'blue'
    this.normal = normal; // Surface normal vector
    this.radius = PHYSICS_CONFIG.portal.radius;
    this.active = false;
    this.linkedPortal = null;
    
    this.createVisuals();
    this.createPhysics();
    this.setupEffects();
  }

  createVisuals() {
    const color = this.type === 'orange' ? PORTAL_COLORS.ORANGE : PORTAL_COLORS.BLUE;
    
    this.container = this.scene.add.container(this.x, this.y);
    
    this.outerRing = this.scene.add.circle(0, 0, this.radius, parseInt(color.replace('#', '0x')));
    this.outerRing.setStrokeStyle(4, parseInt(color.replace('#', '0x')));
    this.outerRing.setAlpha(0.8);
    
    this.innerArea = this.scene.add.circle(0, 0, this.radius - 8, 0x000000);
    this.innerArea.setAlpha(0.6);
    
    this.container.add([this.innerArea, this.outerRing]);
    
    this.updateDepth();
    this.playCreateAnimation();
  }

  createPhysics() {
    this.trigger = this.scene.physics.add.staticGroup();
    const triggerBody = this.scene.add.circle(this.x, this.y, this.radius);
    triggerBody.setVisible(false);
    this.trigger.add(triggerBody);
    
    if (this.scene.player && this.scene.player.sprite) {
      this.scene.physics.add.overlap(
        this.scene.player.sprite,
        this.trigger,
        this.onPlayerEnter.bind(this),
        null,
        this.scene
      );
    }
  }

  setupEffects() {
    this.rotationTween = this.scene.tweens.add({
      targets: this.container,
      rotation: Math.PI * 2,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });

    this.pulseGroup = this.scene.add.group();
    this.createPulseEffect();
  }

  createPulseEffect() {
    const color = this.type === 'orange' ? PORTAL_COLORS.ORANGE : PORTAL_COLORS.BLUE;
    
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.active) {
          const pulse = this.scene.add.circle(this.x, this.y, this.radius, parseInt(color.replace('#', '0x')));
          pulse.setAlpha(0.3);
          pulse.setDepth(this.container.depth - 1);
          this.pulseGroup.add(pulse);
          
          this.scene.tweens.add({
            targets: pulse,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              pulse.destroy();
            }
          });
        }
      },
      loop: true
    });
  }

  playCreateAnimation() {
    this.container.setScale(0);
    this.container.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.active = true;
      }
    });
  }

  onPlayerEnter(player, trigger) {
    if (!this.active || !this.linkedPortal || player.inPortal) return;
    
    const playerVelocity = {
      x: player.body.velocity.x,
      y: player.body.velocity.y
    };
    
    const speed = Math.sqrt(playerVelocity.x * playerVelocity.x + playerVelocity.y * playerVelocity.y);
    
    if (speed < PHYSICS_CONFIG.portal.momentum.minSpeed) {
      return;
    }
    
    this.transportPlayer(player, playerVelocity);
  }

  transportPlayer(player, velocity) {
    if (!this.linkedPortal || !this.linkedPortal.active) return;
    
    const exitVelocity = this.calculateExitVelocity(velocity);
    const exitPosition = this.getExitPosition();
    
    if (player.teleportTo) {
      player.teleportTo(exitPosition.x, exitPosition.y, exitVelocity);
    }
  }

  calculateExitVelocity(entryVelocity) {
    const speed = Math.sqrt(entryVelocity.x * entryVelocity.x + entryVelocity.y * entryVelocity.y);
    
    const clampedSpeed = IsometricUtils.clamp(
      speed * PHYSICS_CONFIG.portal.momentum.preservation,
      PHYSICS_CONFIG.portal.momentum.minSpeed,
      PHYSICS_CONFIG.portal.momentum.maxSpeed
    );
    
    const exitDirection = this.linkedPortal.normal;
    
    return {
      x: exitDirection.x * clampedSpeed,
      y: exitDirection.y * clampedSpeed
    };
  }

  getExitPosition() {
    if (!this.linkedPortal) return { x: this.x, y: this.y };
    
    const offset = {
      x: this.linkedPortal.normal.x * (this.radius + 10),
      y: this.linkedPortal.normal.y * (this.radius + 10)
    };
    
    return {
      x: this.linkedPortal.x + offset.x,
      y: this.linkedPortal.y + offset.y
    };
  }

  linkTo(otherPortal) {
    this.linkedPortal = otherPortal;
    if (otherPortal) {
      otherPortal.linkedPortal = this;
    }
  }

  updateDepth() {
    if (this.container) {
      const worldPos = IsometricUtils.screenToIso(this.x, this.y);
      this.container.setDepth(IsometricUtils.getTileDepth(worldPos.x, worldPos.y) + 0.5);
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    
    if (this.container) {
      this.container.setPosition(x, y);
    }
    
    if (this.trigger) {
      this.trigger.children.entries.forEach(child => {
        child.setPosition(x, y);
      });
    }
    
    this.updateDepth();
  }

  destroy() {
    this.active = false;
    
    if (this.linkedPortal) {
      this.linkedPortal.linkedPortal = null;
    }
    
    if (this.rotationTween) {
      this.rotationTween.destroy();
    }
    
    if (this.pulseGroup) {
      this.pulseGroup.destroy(true);
    }
    
    if (this.trigger) {
      this.trigger.destroy();
    }
    
    if (this.container) {
      this.container.destroy();
    }
  }
}