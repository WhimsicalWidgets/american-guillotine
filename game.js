import { Player } from './player.js';
import { Platform } from './platform.js';
import { Camera } from './camera.js';
import { TouchControls } from './touchControls.js';
import { Guillotine } from './guillotine.js';

export class Game {
  constructor(canvas, hairStyle) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setCanvasSize();
    
    // Initialize multiplayer
    this.initializeMultiplayer();
    
    this.player = new Player(100, 300, hairStyle);
    this.otherPlayers = new Map(); // Store other players
    
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

  async initializeMultiplayer() {
    this.room = new WebsimSocket();
    await this.room.initialize();

    // Subscribe to presence changes (player positions)
    this.room.subscribePresence((presence) => {
      // Update other players
      for (const [clientId, playerState] of Object.entries(presence)) {
        if (clientId === this.room.clientId) continue; // Skip own player
        
        if (!this.otherPlayers.has(clientId)) {
          // Create new player instance for newcomer
          const newPlayer = new Player(playerState.x, playerState.y);
          newPlayer.name = this.room.peers[clientId].username;
          this.otherPlayers.set(clientId, newPlayer);
        }
        
        // Update other player state
        const player = this.otherPlayers.get(clientId);
        Object.assign(player, playerState);
      }

      // Remove disconnected players
      for (const [clientId] of this.otherPlayers) {
        if (!presence[clientId]) {
          this.otherPlayers.delete(clientId);
        }
      }
    });
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
    
    // Send player state to other clients
    if (this.room) {
      this.room.updatePresence({
        x: this.player.x,
        y: this.player.y,
        velocityX: this.player.velocityX,
        velocityY: this.player.velocityY,
        isDead: this.player.isDead,
        headOffset: this.player.headOffset,
        hairSwirl: this.player.hairSwirl
      });
    }

    // Update guillotines and check collisions for all players
    this.guillotines.forEach(guillotine => {
      guillotine.update(this.player);
      
      // Check guillotine collisions for other players
      for (const otherPlayer of this.otherPlayers.values()) {
        guillotine.update(otherPlayer);
      }
    });

    // Handle platform collisions
    let hasCollision = false;
    this.platforms.forEach(platform => {
      if (this.player.checkCollision(platform)) {
        this.player.handleCollision(platform);
        hasCollision = true;
      }
      
      // Check platform collisions for other players
      for (const otherPlayer of this.otherPlayers.values()) {
        if (otherPlayer.checkCollision(platform)) {
          otherPlayer.handleCollision(platform);
        }
      }
    });

    if (hasCollision) {
      this.player.isJumping = false;
    }

    // Update camera - now follows local player only
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
    
    // Draw all players
    this.player.draw(this.ctx);
    for (const otherPlayer of this.otherPlayers.values()) {
      otherPlayer.draw(this.ctx);
    }

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