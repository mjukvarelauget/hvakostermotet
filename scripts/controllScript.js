// Must be loaded as module to keep internal state hidden. This export statement
// forces module loading
export default null;
let startTime = Date.now();
let elapsedTime = 0;
let hourCost = 1000;
let running = false;

// Displays
let hoursDisplay;
let minutesDisplay;
let secondsDisplay;
let costDisplay;

// Must match format settings declared in index.html
let hoursDigits = 2;
let minutesDigits = 2;
let secondsDigits = 2;
let costDigits = 11;

const startClock = () => {
  startTime = Date.now();
  running = true;
  window.requestAnimationFrame(updateProjection);
}

const pauseClock = () => {
  runing = false;
}

const resumeClock = () => {
  running = true;
}

const zeroPadValue = (value, numDigits) => {
  let paddedValue = value.toString();
  const valueLength = paddedValue.length;
  for(let i = valueLength; i < numDigits; i++) {
    paddedValue = "0" + paddedValue;
  }
  return paddedValue;
}

const blankPadValue = (value, numDigits) => {
  let paddedValue = value.toString();
  const valueLength = paddedValue.length;
  for(let i = valueLength; i < numDigits; i++) {
    paddedValue = "_" + paddedValue;
  }
  return paddedValue;
}

// Returns hours, minutes, seconds from milliseconds
const millisToHMS = (milliseconds) => {
  let secondsRemaining = Math.floor(milliseconds / 1000);
  let hours = Math.floor(secondsRemaining / 3600);
  secondsRemaining -= hours * 3600;

  let minutes = Math.floor(secondsRemaining / 60);
  secondsRemaining -= minutes * 60;

  let seconds = secondsRemaining;
  
  return [hours, minutes, seconds];
}

const calculateCost = (elapsedSeconds) => {
  return elapsedSeconds * (hourCost/3600);
}

// TODO only visible update is on second change,
// might want to avoid updates that do not change visual state
const updateProjection = () => {
  elapsedTime = Date.now() - startTime;
  let hours; let minutes; let seconds;

  // Update timer
  [hours, minutes, seconds] = millisToHMS(elapsedTime);
  hours = zeroPadValue(hours, hoursDigits);
  minutes = zeroPadValue(minutes, minutesDigits);
  seconds = zeroPadValue(seconds, secondsDigits);
  
  hoursDisplay.setAttribute("value", hours);
  minutesDisplay.setAttribute("value", minutes);
  secondsDisplay.setAttribute("value", seconds);

  // Update cost
  let cost = calculateCost(Math.floor(elapsedTime / 1000));
  // Two digit precision
  cost = Math.round(cost*100)/100;
  cost = cost.toFixed(2);
  let costString = cost.toString();
  
  // Remove dot
  costString = costString.replace('.', '');

  // Pad
  costString = blankPadValue(costString, costDigits);

  // Update
  costDisplay.setAttribute("value", costString);
  
  if(running === true) {
    window.requestAnimationFrame(updateProjection);
  }
}

const setupProjection = () => {
  hoursDisplay   = document.querySelector(".hours seven-segment-display");
  minutesDisplay = document.querySelector(".minutes seven-segment-display");
  secondsDisplay = document.querySelector(".seconds seven-segment-display");
  costDisplay = document.querySelector(".cost-counter seven-segment-display");
}

const init = () => {
  setupProjection();
  startClock();
}
  
window.addEventListener('load', init);

