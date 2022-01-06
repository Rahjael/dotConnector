const UTILS = {  
  getRange: (start, howMany = 0) => {
    // If only one argument is provided, assume it's an end value and set start at 1
    if(howMany === 0) {
      howMany = start;
      start = 0;
    }
    // Make sure we are dealing with integers
    start = Math.floor(start);
    howMany = Math.floor(howMany);
    
    console.log('inside getrange', start, howMany)
    if(start === howMany || howMany < 1) return [];
    const array = Array(howMany - start);
    for(let i = 0; i < howMany; i++) {
      array[i] = i + start;
    }
    return array;
  },

  shuffleArray: (array) => {
    // Taken from this SO post: https://stackoverflow.com/a/2450976

    let currentIndex = array.length
    let randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  },
}