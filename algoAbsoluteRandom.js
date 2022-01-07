class AlgoAbsoluteRandom {
  constructor(middlePointsHook, orderHook){
    this.middlePointsHook = middlePointsHook;
    this.orderHook = orderHook;
  }

  getNextOrder() {
    let tempArray = [...this.orderHook.slice(1,this.orderHook.length - 1)];
    UTILS.shuffleArray(tempArray);
    return [0].concat(tempArray, tempArray.length + 1);
  }

  restart() {
    // nothing to do
  }  
}