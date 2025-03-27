export class Guillotine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 120;
    this.bladeHeight = 40;
    this.bladeY = y;
    this.bladeSpeed = 15;
    this.isDropping = false;
    this.resetTimer = 2000; // Time before blade resets
    this.triggerDistance = 100; // Distance at which blade drops
    
    // Add blade image
    this.bladeImage = new Image();
    this.bladeImage.src = 'guillotine-blade.png';
  }

  update(player) {
    // Check if player is nearby to trigger blade
    const distance = Math.abs((this.x + this.width/2) - (player.x + player.width/2));
    
    if (distance < this.triggerDistance && !this.isDropping && this.bladeY === this.y) {
      this.isDropping = true;
    }

    // Update blade position
    if (this.isDropping) {
      this.bladeY += this.bladeSpeed;
      
      // Check if blade has reached bottom
      if (this.bladeY >= this.y + this.height - this.bladeHeight) {
        this.bladeY = this.y + this.height - this.bladeHeight;
        
        // Reset blade after delay
        setTimeout(() => {
          this.isDropping = false;
          this.bladeY = this.y;
        }, this.resetTimer);
      }
    }

    // Check for collision with player
    if (!player.isDead && this.checkPlayerCollision(player)) {
      player.die();
    }
  }

  checkPlayerCollision(player) {
    // Check if player's head is in blade area
    return (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.bladeY + this.bladeHeight &&
      player.y + player.headHeight > this.bladeY &&
      this.isDropping
    );
  }

  draw(ctx) {
    // Draw frame
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(this.x, this.y, 10, this.height); // Left post
    ctx.fillRect(this.x + this.width - 10, this.y, 10, this.height); // Right post
    ctx.fillRect(this.x, this.y, this.width, 10); // Top beam

    // Draw blade image if loaded
    if (this.bladeImage.complete) {
      ctx.save();
      ctx.translate(this.x, this.bladeY);
      ctx.drawImage(this.bladeImage, 0, 0, this.width, this.bladeHeight);
      ctx.restore();
    } else {
      // Fallback if image not loaded
      ctx.fillStyle = '#silver';
      ctx.fillRect(this.x, this.bladeY, this.width, this.bladeHeight);
    }
  }
}