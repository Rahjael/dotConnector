class AlgoClosestFirst {
  constructor(middlePointsHook, orderHook){
    this.middlePointsHook = middlePointsHook;
    this.orderHook = orderHook;

    this.currentStep = 0;
    this.biggestIndex = this.orderHook.length - 1;
  }

  // Common methods
  getNextOrder() {
    if(this.currentStep >= this.biggestIndex - 1) {
      this.restart();
      console.log('max currentStep reached')
      return this.orderHook;
    }


    // What we do here is use the currentStep as an index to the order array (which is an array of indexes itself).
    // We look for the next closest point, ignoring currentStep and previousIndex (obviously, otherwise it would loop back and forth the two current closest points

    // IMPORTANT: due to the structure of the program, we assume that currentOrder/orderHook ALWAYS starts with a 0 index and ALWAYS ends with the biggest index. this is due to:
    // const DATA = {
    //   middlePoints: [],
    //   startingPoint: new Point(ctx, 10, 10, 'black'),
    //   endingPoint: new Point(ctx, CANVAS_CONFIG.canvasWidth - CANVAS_CONFIG.pointsPadding, CANVAS_CONFIG.canvasHeight - CANVAS_CONFIG.pointsPadding, 'black'),
    // ... other properties...
    // }
    //
    // which is defined in index.js


    // So we find the index of the point closest to the currentStep
    let closestNextIndex = this.getClosestNext();
    // Then we swap the index at currentStep with the index we found
    [this.orderHook[this.currentStep + 1], this.orderHook[closestNextIndex]] = [this.orderHook[closestNextIndex], this.orderHook[this.currentStep + 1]];

    // DEBUG: throw if any undefined value is spotted in the array:
    this.orderHook.forEach( element => {
      if(element === undefined) {
        console.log('orderHook: ', this.orderHook);
        console.log('closestNextIndex: ', closestNextIndex);
        console.log('currentStep', this.currentStep)
        throw Error('UNDEFINED SPOTTED')
      }
    })

    // We can now increment the currentStep (for the next call)
    // and return the order so far    
    this.currentStep++;

    return this.orderHook;
  }

  restart() {
    this.currentStep = 0;
    this.biggestIndex = this.orderHook.length - 1;
  }


  // Methods specific to this algorithm

  getClosestNext() {
    let shortestDistanceSoFar = Number.POSITIVE_INFINITY;
    let indexOfClosestPointSoFarInOrderHook;
    for(let i = this.currentStep + 1; i < this.orderHook.length - 1; i++) {
      const pointA = DATA.allPoints[this.orderHook[this.currentStep]];
      const pointB = DATA.allPoints[this.orderHook[i]];

      if(pointB === undefined) {
        console.log(DATA, this, this.currentStep, i);
      }

      const distance = Point.getDistance(pointA, pointB);
      if(distance < shortestDistanceSoFar) {
        shortestDistanceSoFar = distance;
        indexOfClosestPointSoFarInOrderHook = i;
      }
    }
    return indexOfClosestPointSoFarInOrderHook;
  }
}