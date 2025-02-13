import { Player } from './player.js';
import { Platform } from './platform.js';
import { Camera } from './camera.js';
import { TouchControls } from './touchControls.js';
import { Guillotine } from './guillotine.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setCanvasSize();
    
    // Create player with better initial spawn position
    this.player = new Player(100, 300);
    this.platforms = [
      // Base platforms with better spacing
      new Platform(0, 500, 800, 100),
      new Platform(-200, 500, 200, 100),
      new Platform(800, 500, 400, 100),
      
      // Middle platforms
      new Platform(300, 400, 200, 20),
      new Platform(600, 300, 200, 20),
      new Platform(100, 200, 200, 20),
      
      // Higher platforms
      new Platform(-100, 300, 150, 20),
      new Platform(900, 200, 150, 20),
      new Platform(400, 150, 150, 20),
      
      // Challenge platforms
      new Platform(700, 100, 80, 20),
      new Platform(900, 50, 80, 20),
      new Platform(1100, 0, 80, 20),
      
      // Floating islands
      new Platform(-300, 200, 120, 80),
      new Platform(-500, 300, 120, 80),
      new Platform(1200, 200, 120, 80),
      
      // Secret upper platforms
      new Platform(200, 0, 100, 20),
      new Platform(0, -100, 100, 20),
      new Platform(400, -150, 100, 20),
      
      // Lower platforms
      new Platform(-200, 700, 150, 20),
      new Platform(400, 650, 150, 20),
      new Platform(800, 750, 150, 20),
      
      // Far side platforms
      new Platform(-800, 400, 200, 20),
      new Platform(-600, 250, 200, 20),
      new Platform(1400, 400, 200, 20)
    ];
    
    // Add guillotines at strategic locations
    this.guillotines = [
      new Guillotine(300, 250),
      new Guillotine(700, 150),
      new Guillotine(-200, 350),
      new Guillotine(1000, 300),
      new Guillotine(400, 0)
    ];

    this.camera = new Camera();
    this.touchControls = new TouchControls();
    
    window.addEventListener('resize', () => this.setCanvasSize());
    this.setupControls();
  }

  setCanvasSize() {
    // Use device pixel ratio for sharp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  setupControls() {
    this.keys = {};
    window.addEventListener('keydown', (e) =>!this.keys[e.code] ? this.keys[e.code] = true : null);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);

    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  update() {
    // Handle controls
    if (!this.player.isDead) {
      if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
        this.player.moveLeft();
      }
      if (this.keys['ArrowRight'] || this.keys['KeyD']) {
        this.player.moveRight(); 
      }
      if (this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW']) {
        this.player.jump();
      }

      const touchInput = this.touchControls.getInput();
      if (touchInput.left) this.player.moveLeft();
      if (touchInput.right) this.player.moveRight();
      if (touchInput.jump) this.player.jump();
    }

    // Update player
    this.player.update();

    // Update guillotines
    this.guillotines.forEach(guillotine => {
      guillotine.update(this.player);
    });

    // Handle platform collisions
    let hasCollision = false;
    this.platforms.forEach(platform => {
      if (this.player.checkCollision(platform)) {
        this.player.handleCollision(platform);
        hasCollision = true;
      }
    });

    if (hasCollision) {
      this.player.isJumping = false;
    }

    // Update camera
    this.camera.update(this.player);
  }

  render() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.camera.apply(this.ctx);

    // Draw platforms
    this.platforms.forEach(platform => platform.draw(this.ctx));
    
    // Draw guillotines
    this.guillotines.forEach(guillotine => guillotine.draw(this.ctx));
    
    // Draw player
    this.player.draw(this.ctx);

    this.ctx.restore();

    // Draw touch controls
    this.touchControls.draw(this.ctx);
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.gameLoop();
  }
}