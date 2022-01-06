class AlgoAbsoluteRandom {
  constructor(middlePoints){
    this.points = middlePoints;
    this.order = UTILS.getRange(1, middlePoints.length);
  }

  getNextOrder() {
    UTILS.shuffleArray(this.order);
    return [0].concat(this.order, this.order.length + 1);
  }
}