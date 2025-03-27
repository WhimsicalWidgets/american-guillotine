export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.targetScale = 1;
    this.lookAheadX = 0; 
    this.lookAheadAmount = 50;
  }

  update(target, observerMode = false) {
    if (observerMode) {
      // Center on full scene
      const sceneBounds = {
        minX: -800,
        maxX: 1400,
        minY: -150,
        maxY: 1000
      };
      
      const sceneWidth = sceneBounds.maxX - sceneBounds.minX;
      const sceneHeight = sceneBounds.maxY - sceneBounds.minY;
      
      // Calculate scale to fit scene
      const horizontalScale = window.innerWidth / (sceneWidth + 200); // Add padding
      const verticalScale = window.innerHeight / (sceneHeight + 200);
      this.targetScale = Math.min(horizontalScale, verticalScale, 1);
      
      // Center on scene
      const centerX = (sceneBounds.minX + sceneBounds.maxX) / 2;
      const centerY = (sceneBounds.minY + sceneBounds.maxY) / 2;
      
      this.x += (-centerX + window.innerWidth/2 - this.x) * 0.05;
      this.y += (-centerY + window.innerHeight/2 - this.y) * 0.05;
    } else {
      this.targetScale = 1;
      const targetLookAhead = target.velocityX * this.lookAheadAmount;
      this.lookAheadX += (targetLookAhead - this.lookAheadX) * 0.1;

      const targetX = -target.x - this.lookAheadX + window.innerWidth/2;
      const targetY = -target.y + window.innerHeight/2;
      
      this.x += (targetX - this.x) * 0.05;
      this.y += (targetY - this.y) * 0.05;
    }

    // Smoothly interpolate scale
    this.scale += (this.targetScale - this.scale) * 0.05;
    this.rotation = observerMode ? 0 : target.velocityX * 0.0002;
  }

  apply(ctx) {
    ctx.translate(window.innerWidth/2, window.innerHeight/2);
    
    ctx.rotate(this.rotation);
    
    ctx.scale(this.scale, this.scale);
    
    ctx.translate(-window.innerWidth/2 + this.x, -window.innerHeight/2 + this.y);
  }
}