class Player {
  constructor(game) {
    this.game = game;
    this.width = 150;
    this.height = 80;
    this.x = 100;
    this.y = this.game.canvas.height / 2;
    this.image = document.getElementById('player-img');

    // Mouse tracking
    this.game.canvas.addEventListener('mousemove', (e) => {
      if (!this.game.isGameOver) {
        // Adjust to center on the shark model
        this.x = e.clientX - this.width / 2;
        this.y = e.clientY - this.height / 2;

        // Keep within bounds
        this.x = Math.max(0, Math.min(this.game.canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(this.game.canvas.height - this.height, this.y));
      }
    });
  }

  draw (ctx) {
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = 'gray';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class Entity {
  constructor(game, type) {
    this.game = game;
    this.type = type; // 'food' or 'obstacle'

    this.width = type === 'food' ? 60 : 120;
    this.height = type === 'food' ? 40 : 60;

    // Spawn off-screen to the right
    this.x = this.game.canvas.width + 50;
    this.y = Math.random() * (this.game.canvas.height - this.height);

    // Speed varies slightly
    this.speed = this.game.scrollSpeed + (Math.random() * 2 + 1);

    this.image = document.getElementById(type === 'food' ? 'food-img' : 'eel-img');
    this.markedForDeletion = false;

    // Hitbox adjustments (make them slightly smaller than the image for forgiving gameplay)
    this.hitboxMargin = type === 'food' ? 10 : 15;
  }

  update () {
    this.x -= this.speed;
    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
  }

  draw (ctx) {
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.type === 'food' ? 'lightblue' : 'green';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreDisplay = document.getElementById('score-value');
    this.gameOverScreen = document.getElementById('game-over');
    this.finalScoreDisplay = document.getElementById('final-score');
    this.restartBtn = document.getElementById('restart-btn');

    // Game Settings
    this.score = 0;
    this.isGameOver = false;
    this.scrollSpeed = 4;

    // Background Tracking
    this.bgX1 = 0;
    this.bgX2 = 0; // Will be set after resize

    // Bindings
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.restart = this.restart.bind(this);

    this.restartBtn.addEventListener('click', this.restart);
    window.addEventListener('resize', this.resize);

    // Assets
    this.coralImg = document.getElementById('coral-img');

    // Init
    this.resize();
    this.start();
  }

  resize () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    if (this.bgX2 === 0) {
      this.bgX2 = this.canvas.width;
    }
  }

  start () {
    this.score = 0;
    this.isGameOver = false;
    this.scoreDisplay.innerText = this.score;
    this.gameOverScreen.classList.add('hidden');

    this.player = new Player(this);
    this.entities = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1000; // spawn every 1s

    this.bgX1 = 0;
    this.bgX2 = this.canvas.width;

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  restart () {
    this.start();
  }

  checkCollision (rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  handleCollisions () {
    // Player hitbox (slightly smaller than image)
    const playerHitbox = {
      x: this.player.x + 20,
      y: this.player.y + 20,
      width: this.player.width - 40,
      height: this.player.height - 40
    };

    this.entities.forEach(entity => {
      const entityHitbox = {
        x: entity.x + entity.hitboxMargin,
        y: entity.y + entity.hitboxMargin,
        width: entity.width - (entity.hitboxMargin * 2),
        height: entity.height - (entity.hitboxMargin * 2)
      };

      if (this.checkCollision(playerHitbox, entityHitbox)) {
        entity.markedForDeletion = true;

        if (entity.type === 'food') {
          this.score += 10;
          this.scoreDisplay.innerText = this.score;
        } else if (entity.type === 'obstacle') {
          this.score -= 20;
          if (this.score < 0) this.score = 0; // Prevent negative scores maybe? Optional.
          this.scoreDisplay.innerText = this.score;

          // Add screen flash effect for damage
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }
    });
  }

  spawnEntities (dt) {
    if (this.spawnTimer > this.spawnInterval) {
      // Randomly spawn food or obstacle
      const type = Math.random() > 0.4 ? 'food' : 'obstacle';
      this.entities.push(new Entity(this, type));
      this.spawnTimer = 0;

      // Slightly speed up game over time
      if (this.spawnInterval > 400) {
        this.spawnInterval -= 5;
      }
      this.scrollSpeed += 0.01;
    } else {
      this.spawnTimer += dt;
    }
  }

  update (dt) {
    if (this.isGameOver) return;

    // Scroll Background
    this.bgX1 -= this.scrollSpeed;
    this.bgX2 -= this.scrollSpeed;

    if (this.bgX1 <= -this.canvas.width) {
      this.bgX1 = this.canvas.width;
    }
    if (this.bgX2 <= -this.canvas.width) {
      this.bgX2 = this.canvas.width;
    }

    this.spawnEntities(dt);

    this.entities.forEach(entity => entity.update());

    this.handleCollisions();

    // Remove off-screen or eaten entities
    this.entities = this.entities.filter(entity => !entity.markedForDeletion);
  }

  draw () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Background
    if (this.coralImg.complete) {
      // add 1px width overlap to prevent seams
      this.ctx.drawImage(this.coralImg, this.bgX1, 0, this.canvas.width + 1, this.canvas.height);
      this.ctx.drawImage(this.coralImg, this.bgX2, 0, this.canvas.width + 1, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#0b1d3d';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw Entities
    this.entities.forEach(entity => entity.draw(this.ctx));

    // Draw Player
    this.player.draw(this.ctx);
  }

  loop (timestamp) {
    if (this.isGameOver) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  }
}

window.onload = () => {
  new Game();
};
