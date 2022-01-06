class HUD {
  constructor(ctx) {
    this.currentRadius = 20;
    this.x = CANVAS_CONFIG.canvasWidth - this.currentRadius * 2;
    this.y = this.currentRadius * 2;
    this.ctx = ctx;

    this.colors = ['#000000', '#FFFFFF'];
    this.currentColor = 0;
  }


  draw() {
    this.drawPlayingMarker();
  }


  drawPlayingMarker() {
    this.currentColor = this.currentColor === 0 ? 1 : 0;
    this.ctx.fillStyle = this.colors[this.currentColor];
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.currentRadius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = CANVAS_CONFIG.bgColor;

  }
}