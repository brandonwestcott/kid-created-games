import Phaser from 'phaser';

export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.6;
    this.masterVolume = 1.0;
    this.soundBank = new Map();
    this.currentMusic = null;
    this.musicLayers = [];
  }

  playSound(soundKey, options = {}) {
    if (!this.scene.sound) return null;
    
    try {
      const sound = this.scene.sound.add(soundKey, {
        volume: (options.volume || 1.0) * this.sfxVolume * this.masterVolume,
        rate: options.rate || 1.0,
        loop: options.loop || false,
        delay: options.delay || 0
      });
      
      if (options.fade) {
        sound.setVolume(0);
        this.scene.tweens.add({
          targets: sound,
          volume: (options.volume || 1.0) * this.sfxVolume * this.masterVolume,
          duration: options.fade
        });
      }
      
      sound.play();
      
      if (options.autoDestroy !== false) {
        sound.once('complete', () => {
          sound.destroy();
        });
      }
      
      return sound;
    } catch (error) {
      console.warn(`Could not play sound: ${soundKey}`, error);
      return null;
    }
  }

  playRandomSound(soundKeys, options = {}) {
    if (!Array.isArray(soundKeys) || soundKeys.length === 0) return null;
    
    const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
    return this.playSound(randomKey, options);
  }

  playMusic(musicKey, options = {}) {
    if (this.currentMusic) {
      this.stopMusic();
    }
    
    try {
      this.currentMusic = this.scene.sound.add(musicKey, {
        volume: options.volume || this.musicVolume * this.masterVolume,
        loop: options.loop !== false,
        rate: options.rate || 1.0
      });
      
      if (options.fadeIn) {
        this.currentMusic.setVolume(0);
        this.currentMusic.play();
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: options.volume || this.musicVolume * this.masterVolume,
          duration: options.fadeIn
        });
      } else {
        this.currentMusic.play();
      }
      
      return this.currentMusic;
    } catch (error) {
      console.warn(`Could not play music: ${musicKey}`, error);
      return null;
    }
  }

  stopMusic(fadeOut = 0) {
    if (!this.currentMusic) return;
    
    if (fadeOut > 0) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeOut,
        onComplete: () => {
          if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
          }
        }
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
  }

  pauseMusic() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  resumeMusic() {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateAllVolumes();
  }

  setSfxVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }

  updateAllVolumes() {
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }

  preloadSounds() {
    const soundEffects = {
      portal_place: {
        files: ['assets/audio/portal_place.ogg', 'assets/audio/portal_place.mp3'],
        config: { volume: 0.7 }
      },
      portal_travel: {
        files: ['assets/audio/portal_travel.ogg', 'assets/audio/portal_travel.mp3'],
        config: { volume: 0.8 }
      },
      footstep: {
        files: ['assets/audio/footstep.ogg', 'assets/audio/footstep.mp3'],
        config: { volume: 0.3 }
      },
      jump: {
        files: ['assets/audio/jump.ogg', 'assets/audio/jump.mp3'],
        config: { volume: 0.5 }
      },
      level_complete: {
        files: ['assets/audio/level_complete.ogg', 'assets/audio/level_complete.mp3'],
        config: { volume: 0.8 }
      },
      ambient: {
        files: ['assets/audio/ambient.ogg', 'assets/audio/ambient.mp3'],
        config: { volume: 0.4, loop: true }
      }
    };

    Object.keys(soundEffects).forEach(key => {
      const sound = soundEffects[key];
      this.scene.load.audio(key, sound.files);
      this.soundBank.set(key, sound.config);
    });
  }

  createSpatialSound(soundKey, sourceX, sourceY, listenerX, listenerY, maxDistance = 800) {
    const distance = Math.sqrt(
      Math.pow(sourceX - listenerX, 2) + Math.pow(sourceY - listenerY, 2)
    );
    
    if (distance > maxDistance) return null;
    
    const volume = Math.max(0, 1 - (distance / maxDistance));
    const pan = Phaser.Math.Clamp((sourceX - listenerX) / (maxDistance / 2), -1, 1);
    
    return this.playSound(soundKey, {
      volume: volume,
      pan: pan
    });
  }

  playPortalSound(portalType, x, y) {
    const listenerPos = this.getListenerPosition();
    
    const baseFrequency = portalType === 'orange' ? 1.2 : 0.8;
    
    return this.createSpatialSound('portal_place', x, y, listenerPos.x, listenerPos.y, 600, {
      rate: baseFrequency + (Math.random() - 0.5) * 0.1,
      volume: 0.7
    });
  }

  playTravelSound(x, y) {
    const listenerPos = this.getListenerPosition();
    
    return this.createSpatialSound('portal_travel', x, y, listenerPos.x, listenerPos.y, 800, {
      volume: 0.8,
      rate: 0.9 + Math.random() * 0.2
    });
  }

  getListenerPosition() {
    if (this.scene.player && this.scene.player.sprite) {
      return {
        x: this.scene.player.sprite.x,
        y: this.scene.player.sprite.y
      };
    }
    
    const camera = this.scene.cameras.main;
    return {
      x: camera.scrollX + camera.width / 2,
      y: camera.scrollY + camera.height / 2
    };
  }

  duckMusic(duration = 1000, duckVolume = 0.3) {
    if (!this.currentMusic) return;
    
    const originalVolume = this.currentMusic.volume;
    
    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: duckVolume * this.musicVolume * this.masterVolume,
      duration: 200,
      yoyo: true,
      hold: duration,
      onComplete: () => {
        if (this.currentMusic) {
          this.currentMusic.setVolume(originalVolume);
        }
      }
    });
  }

  stopAllSounds() {
    this.scene.sound.stopAll();
    this.currentMusic = null;
  }

  destroy() {
    this.stopAllSounds();
    this.soundBank.clear();
    this.musicLayers = [];
  }
}