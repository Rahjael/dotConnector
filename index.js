const mainCanvas = /** @type {HTMLCanvasElement} */ document.querySelector('#main-canvas');
const ctx = mainCanvas.getContext('2d');

// Debug stuff
let stopAnimation = false;
let stopCalculations = true;
let debugMode = true;
const initialPoints = 4;



//
//  DATA:
//

// hardcoded because calculations involve factorials. Things get crazy very quickly
const MAX_MIDDLE_POINTS = 1000000;

const POINTER = {
  x: null,
  y: null,
  isDown: false
}
const CANVAS_CONFIG = {
  bgColor: '#2596be',
  pointColor: '#F6F83C',
  tempLinkColor: '#FFFFFF',
  animateTempLinks: true,
  showPreviousBest: true,
  bestLinkColor: '#D11406',
  previousBestLinkColor: '#FFD29A',
  tempLinkWidth: 1,
  bestLinkWidth: 5,
  previousBestLinkWidth: 3,
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight - mainCanvas.offsetTop,
  pointsPadding: 10,
  msIntervalBetweeAnimationFrames: 2000
}
const DATA = {
  middlePoints: [],
  startingPoint: new Point(ctx, 10, 10, 'black'),
  endingPoint: new Point(ctx, CANVAS_CONFIG.canvasWidth - CANVAS_CONFIG.pointsPadding, CANVAS_CONFIG.canvasHeight - CANVAS_CONFIG.pointsPadding, 'black'),
  allPoints: [],
  currentOrder: [],
  bestOrderSoFar: [],
  previousBest: [],
  bestDistanceSoFar: Number.POSITIVE_INFINITY,
  currentAlgorithm: 'absoluteRandom'
}

const INSTANCED_ALGORITHMS = {};

const hud = new HUD(ctx);

//
// DATA END
//


//
// FUNCTION DEFINITIONS
//

function buttonPressed(buttonName) {
  // buttonName can be:
  // - randomize
  // - clearAll
  // - start

  if(buttonName === 'randomize') {
    const numOfDotsToGenerate = document.querySelector('#dots-to-generate').value;
    randomizePoints(numOfDotsToGenerate);
  }
  else if(buttonName === 'clearAll') {
    DATA.middlePoints.splice(0);
    DATA.allPoints.splice(0);
    resetIndexesArrays();
  }
  else if(buttonName === 'start') {
    // if(stopAnimation) {
    //   // stopAnimation = false;
    //   animate();
    // }
    stopCalculations = false;
    selectAlgorithm(document.querySelector('#select-algorithm').value);
    
  }
  else if(buttonName === 'pause') {
    // stopAnimation = true;
    stopCalculations = true;
  }
  else if(buttonName === 'help') {
    window.alert(`Instructions:
    start/pause: start/pause animation
    num/randomize: inserts that number of randomly placed dots
    
    You can tap/click on the animation field to customly add points. If you add more than X dots, the oldest added will be removed.
    `);
  }
  else if(buttonName === 'flag-animate-tempLinks') {
    CANVAS_CONFIG.animateTempLinks = document.querySelector('#flag-animate-tempLinks').checked;
  }
  else if(buttonName === 'flag-show-previous-best') {
    CANVAS_CONFIG.showPreviousBest = document.querySelector('#flag-show-previous-best').checked;
  }

}
function addPoint(x, y) {
  // Add a point to the canvas.
  // The array is a FIFO queue. Oldest pushed will be removed 
  // when MAX_MIDDLE_POINTS is reached
  DATA.middlePoints.push(new Point(ctx, x, y, CANVAS_CONFIG.pointColor));
  if(DATA.middlePoints.length > MAX_MIDDLE_POINTS) {
    DATA.middlePoints.shift();
  }
  // DATA.allPoints = [DATA.startingPoint].concat(DATA.middlePoints, DATA.endingPoint);

  resetIndexesArrays();
}
function randomizePoints(num) {
  DATA.middlePoints.splice(0);
  DATA.bestOrderSoFar.splice(0);
  DATA.previousBest.splice(0);
  DATA.bestDistanceSoFar = Number.POSITIVE_INFINITY;

  for(let i = 0; i < num; i++) {
    addPoint(...getRandomXY());
  }
}
function getRandomXY() {
  let x = Math.floor(Math.random() * CANVAS_CONFIG.canvasWidth);
  let y = Math.floor(Math.random() * CANVAS_CONFIG.canvasHeight);

  // Avoid random points being generated outside starting and ending point margins
  if(x < CANVAS_CONFIG.pointsPadding) x += CANVAS_CONFIG.pointsPadding;
  if(x > CANVAS_CONFIG.canvasWidth - CANVAS_CONFIG.pointsPadding) x -= CANVAS_CONFIG.pointsPadding;
  if(y < CANVAS_CONFIG.pointsPadding) y += CANVAS_CONFIG.pointsPadding;
  if(y > CANVAS_CONFIG.canvasHeight - CANVAS_CONFIG.pointsPadding) y -= CANVAS_CONFIG.pointsPadding;

  return [x, y];
}
function resetIndexesArrays() {
  DATA.currentOrder = UTILS.getRange(DATA.middlePoints.length + 2);
  // console.log('currentOrder reset: ', DATA.currentOrder.length, ...DATA.currentOrder);
  DATA.bestOrderSoFar = [...DATA.currentOrder];
  DATA.previousBest.splice(0);
  DATA.bestDistanceSoFar = Number.POSITIVE_INFINITY;
  reseedInstancedAlgorithms(INSTANCED_ALGORITHMS);
}
function reseedInstancedAlgorithms(instancesContainer) {
  instancesContainer.absoluteRandom = new AlgoAbsoluteRandom(DATA.middlePoints, DATA.currentOrder);
  instancesContainer.closestFirst = new AlgoClosestFirst(DATA.middlePoints, DATA.currentOrder);

  for(const algo in INSTANCED_ALGORITHMS) {
    INSTANCED_ALGORITHMS[algo].restart();
  }
}
function selectAlgorithm(selected) {
  // algoAbsoluteRandom
  // algoClosestFirst
  DATA.currentAlgorithm = selected;
  resetIndexesArrays();
}
function drawAllPoints() {  
  // Draw every point
  DATA.allPoints.forEach( point => point.draw());
}
function drawCurrentLinks() {
  // Draw links in current order
  DATA.currentOrder.forEach( (currentIndex, i, arr) => {
    if(i < DATA.allPoints.length - 1) {
      DATA.allPoints[currentIndex].drawLinkTo(DATA.allPoints[arr[i + 1]]);
    }
  });
}
function drawBestLinks() {
  // Draw links for best configuration so far
  DATA.bestOrderSoFar.forEach( (currentIndex, i, arr) => {
    if(i < DATA.allPoints.length - 1) {
      DATA.allPoints[currentIndex].drawLinkTo(DATA.allPoints[arr[i + 1]], 'bestSoFar');
    }
  });
}
function drawPreviousBestLinks() {
  // Draw links for best configuration so far
  DATA.previousBest.forEach( (currentIndex, i, arr) => {
    if(i < DATA.allPoints.length - 1) {
      DATA.allPoints[currentIndex].drawLinkTo(DATA.allPoints[arr[i + 1]], 'previousBest');
    }
  });
}


function animate() {
  ctx.fillStyle = CANVAS_CONFIG.bgColor;
  ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
  let dt = Date.now() - LAST_FRAME_TIME;

  // update allPoints with starting and ending point and draw them
  DATA.allPoints = [DATA.startingPoint, ...DATA.middlePoints, DATA.endingPoint];
  drawAllPoints();


  if(!stopCalculations) {
    // Get next computation and compare it with previous order
    DATA.currentOrder = [...INSTANCED_ALGORITHMS[DATA.currentAlgorithm].getNextOrder()];
    
    let currentTotalDistance = Point.getSumOfDistances(DATA.allPoints, DATA.currentOrder);
    if(currentTotalDistance < DATA.bestDistanceSoFar) {
      DATA.bestDistanceSoFar = currentTotalDistance;
      DATA.previousBest = [...DATA.bestOrderSoFar];
      DATA.bestOrderSoFar = [...DATA.currentOrder];
    }
    
    drawCurrentLinks();
    drawPreviousBestLinks();
    drawBestLinks();
  }
  


  if(dt > CANVAS_CONFIG.msIntervalBetweeAnimationFrames) {
    // drawBestLinks();
    LAST_FRAME_TIME = Date.now();
    // console.log('looping...')
  }

  
  if(!stopAnimation) {
    // hud.draw();
    requestAnimationFrame(animate);
  }
}



//
// FUNCTION DEFINITIONS END
//










// 
// SCRIPT START
//

// Setting up canvas and listeners
mainCanvas.width = CANVAS_CONFIG.canvasWidth;
mainCanvas.height = CANVAS_CONFIG.canvasHeight;

window.addEventListener('resize', () => {  
  CANVAS_CONFIG.canvasWidth = window.innerWidth,
  CANVAS_CONFIG.canvasHeight = window.innerHeight - mainCanvas.offsetTop
  mainCanvas.width = CANVAS_CONFIG.canvasWidth;
  mainCanvas.height = CANVAS_CONFIG.canvasHeight;
});

mainCanvas.addEventListener('mousedown', (e) => {
  POINTER.x = e.x;
  POINTER.y = e.y - mainCanvas.offsetTop;
  POINTER.isDown = true;

  addPoint(POINTER.x, POINTER.y);
});

mainCanvas.addEventListener('mouseup', (e) => {
  POINTER.isDown = false;
});

mainCanvas.addEventListener('mousemove', (e) => {
  POINTER.x = e.x;
  POINTER.y = e.y - mainCanvas.offsetTop;
});

mainCanvas.addEventListener('keydown', (e) => {
  if(e.key == 'p') {
    if(!stopAnimation) {
      stopAnimation = true;
      console.log('Pause');
    }
    else {
      stopAnimation = false;
      console.log('Unpause');
      requestAnimationFrame(animate);
    }
  }

  if(e.key == 'v') {
    debugMode = debugMode == true ? false : true;
  }
}, false);

mainCanvas.addEventListener('keyup', (e) => {
  // For keys where you need to detect both pressing and depressing:
  // if(e.key == 'f') {
  //   FkeyDown = false;
  // }

}, false);




// Start script
let LAST_FRAME_TIME = Date.now();
randomizePoints(initialPoints);
DATA.allPoints = [DATA.startingPoint, ...DATA.middlePoints, DATA.endingPoint];
reseedInstancedAlgorithms(INSTANCED_ALGORITHMS);

animate();



// Testing grounds:

// let a = new Point(ctx, 100, 200, CANVAS_CONFIG.pointColor);
// let b = new Point(ctx, 160, 300, CANVAS_CONFIG.pointColor);
// let c = new Point(ctx, 10, 420, CANVAS_CONFIG.pointColor);
// let d = new Point(ctx, 530, 27, CANVAS_CONFIG.pointColor);

// let testArray = [a, b, c, d];

// console.log(Point.getSumOfDistances(testArray));