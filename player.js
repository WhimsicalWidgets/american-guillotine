export class Player {
  constructor(x, y) {
    this.name = "Oligarchy";
    this.initialX = x;
    this.initialY = y;
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
    this.headHeight = 20; // Height of character's head
    this.headOffset = 0; // For death animation
    this.hairSwirl = {
      baseX: 0,
      baseY: 0,
      controlX: 0,
      controlY: -15,
      endX: 15,
      endY: -10,
      thickness: 6
    };
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
      // Animate head falling with hair
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

    // Animate hair swirl based on movement
    this.hairSwirl.controlY = -15 + Math.sin(Date.now() / 200) * 2;
    this.hairSwirl.endY = -10 + Math.cos(Date.now() / 300) * 2;
    
    // Hair follows movement direction
    if (this.velocityX > 0.5) {
      this.hairSwirl.endX = 15;
      this.hairSwirl.controlX = 0;
    } else if (this.velocityX < -0.5) {
      this.hairSwirl.endX = -15;
      this.hairSwirl.controlX = 0;
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
    // Calculate overlap on each axis
    const overlapX = Math.min(
      Math.abs((this.x + this.width) - platform.x),
      Math.abs(this.x - (platform.x + platform.width))
    );

    const overlapY = Math.min(
      Math.abs((this.y + this.height) - platform.y),
      Math.abs(this.y - (platform.y + platform.height))
    );

    // Resolve collision on axis with smallest overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      if (this.x < platform.x) {
        this.x = platform.x - this.width;
      } else {
        this.x = platform.x + platform.width;
      }
      this.velocityX = 0;
    } else {
      // Vertical collision  
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
    // Draw shadow
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
      // Draw body without head
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(this.x, this.y + this.headHeight, this.width, this.height - this.headHeight);
      
      // Draw head falling with hair
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(this.x, this.y + this.headOffset, this.width, this.headHeight);
      
      // Draw falling hair swirl
      ctx.beginPath();
      ctx.moveTo(this.x + this.width/2 + this.hairSwirl.baseX, 
                 this.y + this.headOffset + this.hairSwirl.baseY);
      ctx.quadraticCurveTo(
        this.x + this.width/2 + this.hairSwirl.controlX,
        this.y + this.headOffset + this.hairSwirl.controlY,
        this.x + this.width/2 + this.hairSwirl.endX,
        this.y + this.headOffset + this.hairSwirl.endY
      );
      ctx.lineWidth = this.hairSwirl.thickness;
      ctx.strokeStyle = '#ff7f00';
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Blood effect
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x, this.y + this.headHeight, this.width, 5);
    } else {
      // Draw normal character
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Add some shading
      ctx.fillStyle = '#357abd';
      ctx.fillRect(this.x + this.width * 0.8, this.y, this.width * 0.2, this.height);
      
      // Draw hair swirl
      ctx.beginPath();
      ctx.moveTo(this.x + this.width/2 + this.hairSwirl.baseX, 
                 this.y + this.hairSwirl.baseY);
      ctx.quadraticCurveTo(
        this.x + this.width/2 + this.hairSwirl.controlX,
        this.y + this.hairSwirl.controlY,
        this.x + this.width/2 + this.hairSwirl.endX,
        this.y + this.hairSwirl.endY
      );
      ctx.lineWidth = this.hairSwirl.thickness;
      ctx.strokeStyle = '#ff7f00';
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Draw face
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + this.width * 0.6, this.y + 15, 4, 4); // Eye
      ctx.fillRect(this.x + this.width * 0.6, this.y + 25, 8, 2); // Mouth
    }
  }
}