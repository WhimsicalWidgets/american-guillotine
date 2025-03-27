export class Player {
  constructor(x, y, hairStyle = 'curly') {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpForce = 15;
    this.gravity = 0.8;
    this.isJumping = false;
    this.isDead = false;
    this.deathTime = 0;
    this.headHeight = 20;
    this.headOffset = 0;
    this.hairStyle = hairStyle;
    this.hairImage = new Image();
    this.loadHairImage();
    this.initialX = x;
    this.initialY = y;
    this.hairStretch = 1.2; 
  }

  loadHairImage() {
    const hairMap = {
      'bald': 'bezos2.png',
      'curly': 'dtzuck.png', 
      'trump': 'thair.png',
      'bald-cap': 'bezos1.png',
      'curly-alt': 'dtzuck2.png',
      'trump-visor': 'lemming1.png',
      'felonius': 'felonius.png' 
    };
    
    this.hairImage.src = hairMap[this.hairStyle];
  }

  respawn() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isDead = false;
    this.headOffset = 0;
  }

  die() {
    if (!this.isDead) {
      this.isDead = true;
      this.deathTime = Date.now();
      setTimeout(() => this.respawn(), 1000);
    }
  }

  moveLeft() {
    if (!this.isDead) this.velocityX = -this.speed;
  }

  moveRight() {
    if (!this.isDead) this.velocityX = this.speed;
  }

  jump() {
    if (!this.isDead && !this.isJumping) {
      this.velocityY = -this.jumpForce;
      this.isJumping = true;
    }
  }

  update() {
    if (this.isDead) {
      this.headOffset += 5;
      return;
    }

    this.velocityY += this.gravity;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.velocityX *= 0.9;

    if (this.y > 1200) {
      this.respawn();
    }
  }

  checkCollision(platform) {
    return (
      this.x < platform.x + platform.width &&
      this.x + this.width > platform.x &&
      this.y < platform.y + platform.height &&
      this.y + this.height > platform.y
    );
  }

  handleCollision(platform) {
    const overlapX = Math.min(
      Math.abs((this.x + this.width) - platform.x),
      Math.abs(this.x - (platform.x + platform.width))
    );

    const overlapY = Math.min(
      Math.abs((this.y + this.height) - platform.y),
      Math.abs(this.y - (platform.y + platform.height))
    );

    if (overlapX < overlapY) {
      if (this.x < platform.x) {
        this.x = platform.x - this.width;
      } else {
        this.x = platform.x + platform.width;
      }
      this.velocityX = 0;
    } else {
      if (this.y < platform.y) {
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.isJumping = false;
      } else {
        this.y = platform.y + platform.height;
        this.velocityY = 0;
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width/2,
      1000,
      this.width/2,
      this.width/4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (this.isDead) {
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(this.x, this.y + this.headHeight, this.width, this.height - this.headHeight);
      
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(this.x, this.y + this.headOffset, this.width, this.headHeight);
      
      if (this.hairImage.complete) {
        ctx.drawImage(
          this.hairImage,
          this.x - 10,
          this.y + this.headOffset - 14,
          this.width + 20,
          (this.headHeight + 20) * this.hairStretch
        );
      }
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x, this.y + this.headHeight, this.width, 5);
    } else {
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      ctx.fillStyle = '#357abd';
      ctx.fillRect(this.x + this.width * 0.8, this.y, this.width * 0.2, this.height);
      
      if (this.hairImage.complete) {
        ctx.drawImage(
          this.hairImage,
          this.x - 10,
          this.y - 14,
          this.width + 20,
          (this.headHeight + 20) * this.hairStretch
        );
      }
      
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + this.width * 0.6, this.y + 15, 4, 4); 
      ctx.fillRect(this.x + this.width * 0.6, this.y + 25, 8, 2); 
    }
  }
}