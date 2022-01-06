class Point {
  static getDistance(pointA, pointB) {
    const distance = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
    return distance;
  }

  static getSumOfDistances(pointsArray, indexesArray) {
    return indexesArray.reduce( (sum, currentIndex, i, arr) => {
      if(i < arr.length - 1) {
        sum += pointsArray[currentIndex].getDistanceTo(pointsArray[arr[i + 1]]);
      }
      return sum;
    }, 0);
  }

  constructor(ctx, x, y, innerColor) {
    this.x = x;
    this.y = y;
    this.innerColor = innerColor;
    this.radius = Math.min(CANVAS_CONFIG.canvasHeight, CANVAS_CONFIG.canvasWidth) / 100;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.fillStyle = this.innerColor;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = CANVAS_CONFIG.bgColor;
  }

  drawLinkTo(otherPoint, type = 'temp') {
    if(type === 'temp' && !CANVAS_CONFIG.animateTempLinks) {
      return;
    }
    if(type === 'previousBest' && !CANVAS_CONFIG.showPreviousBest) {
      return;
    }
    let color;
    let lineWidth
    if(type === 'temp') {
      color = CANVAS_CONFIG.tempLinkColor;
      lineWidth = CANVAS_CONFIG.tempLinkWidth;
    }
    else if(type === 'bestSoFar') {
      color = CANVAS_CONFIG.bestLinkColor;
      lineWidth = CANVAS_CONFIG.bestLinkWidth;
    }
    else if(type === 'previousBest') {
      color = CANVAS_CONFIG.previousBestLinkColor;
      lineWidth = CANVAS_CONFIG.previousBestLinkWidth;
    }
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(otherPoint.x, otherPoint.y);
    this.ctx.stroke();
  }

  getDistanceTo(otherPoint) {
    const distance = Point.getDistance(this, otherPoint);
    return distance;
  }
}