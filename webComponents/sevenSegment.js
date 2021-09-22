'use strict'

//  0-9 initally
class SevenSegmentDigit extends HTMLElement {

  // index 0 is the number 0, index 1 is the number 1 etc
  // Light mapping is as follows
  //  0000
  // 1    2
  // 1    2
  //  3333
  // 4    5
  // 4    5
  //  6666
  // Least significant bit in pattern bit string sets light 0,
  // second light 1 etc.
  
  
  static lightPatterns =
    [
      0b1110111, //0
      0b0100100, //1
      0b1011101, //2
      0b1101101, //3
      0b0101110, //4
      0b1101011, //5
      0b1111011, //6
      0b0100101, //7
      0b1111111, //8
      0b1101111  //9
    ];
  
  //*** Setup ***
  constructor() {
    super();
    this.attachShadow({mode: 'open'}); 

    // Actual state of lights
    // reflected to visuals on a call to render()
    this.lightState = 0b0000000;

    // The colors used for the display
    this.onColor = "red";
    this.offColor = "#3d0f04";

    
    // Run setup and render inital state
    this.setupState();
    this.setupDOM();
    this.render();
  }
  
  setupState() {
    // This method is called before document load
    this.value = 0;
    this.disable = false;    
  }

  // Optimisation: avoid transforms
  setupDOM() {
    let svgNS = "http://www.w3.org/2000/svg";
    let svgRoot = document.createElementNS(svgNS, "svg");
    svgRoot.setAttributeNS(null,"id","svgRoot");
    svgRoot.setAttributeNS(null,"height","60");
    svgRoot.setAttributeNS(null,"width","32");
    
    
    let wrapperGroup = document.createElementNS(svgNS, "g");
    wrapperGroup.setAttributeNS(null,"id", "lightsGroup");

    // Create svg for number in off-state
    // Avoids transforms for faster rendering
    let light0 = document.createElementNS(svgNS, "polygon");
    light0.setAttributeNS(null, "id", "light0");
    light0.setAttributeNS(null, "points", "4 2, 6 0, 26 0, 28 2, 26 4, 6 4");
    light0.setAttributeNS(null, "fill", this.offColor);

    let light1 = document.createElementNS(svgNS, "polygon");
    light1.setAttributeNS(null, "id", "light1");
    light1.setAttributeNS(null, "points", "2 4, 4 6, 4 26, 2 28, 0 26, 0 6");
    light1.setAttributeNS(null, "fill", this.offColor);

    let light2 = document.createElementNS(svgNS, "polygon");
    light2.setAttributeNS(null, "id", "light2");
    light2.setAttributeNS(null, "points", "30 4, 32 6, 32 26, 30 28, 28 26, 28 6 ");
    light2.setAttributeNS(null, "fill", this.offColor);

    let light3 = document.createElementNS(svgNS, "polygon");
    light3.setAttributeNS(null, "id", "light3");
    light3.setAttributeNS(null, "points", "4 30, 6 28, 26 28, 28 30, 26 32, 6 32");
    light3.setAttributeNS(null, "fill", this.offColor);
   
    let light4 = document.createElementNS(svgNS, "polygon");
    light4.setAttributeNS(null, "id", "light4");
    light4.setAttributeNS(null, "points", "2 32, 4 34, 4 54, 2 56, 0 54, 0 34");
    light4.setAttributeNS(null, "fill", this.offColor);

    let light5 = document.createElementNS(svgNS, "polygon");
    light5.setAttributeNS(null, "id", "light5");
    light5.setAttributeNS(null, "points", "30 32, 32 34, 32 54, 30 56, 28 54, 28 34");
    light5.setAttributeNS(null, "fill", this.offColor);

    let light6 = document.createElementNS(svgNS, "polygon");
    light6.setAttributeNS(null, "id", "light6");
    light6.setAttributeNS(null, "points", "4 58, 6 56, 26 56, 28 58, 26 60, 6 60");
    light6.setAttributeNS(null, "fill", this.offColor);
    
    // Glue together the wrapper
    wrapperGroup.appendChild(light0);
    wrapperGroup.appendChild(light1);
    wrapperGroup.appendChild(light2);
    wrapperGroup.appendChild(light3);
    wrapperGroup.appendChild(light4);
    wrapperGroup.appendChild(light5);
    wrapperGroup.appendChild(light6);
    
    // Glue top level elements
    //svgRoot.appendChild(backgroundRect);
    svgRoot.appendChild(wrapperGroup);
    
    // Deep copy the constructed svg for later
    // use as a rendering buffer 
    this.svgBuffer = svgRoot;//.cloneNode(true);

    // Finally attach constructed svg to render tree
    this.shadowRoot.appendChild(svgRoot);
  }

  static get observedAttributes(){
    return ["value", "disable"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Only update on actual change
    if(oldValue != newValue) {
      // TODO: permit bitstring input for manual light controll?
      if(name == "value") {
	this.value =
	  parseInt(newValue, 10);
	
	if (isNaN(this.value)) {
	  if(newValue === "-") {
	    this.value = -1;
	  }
	  else {
	    this.value = 0;
	  }
	}
	else {
	  // Clamp to a single digit
	  if(this.value > 9) {this.value = 9;}
	  if(this.value < 0) {this.value = 0;}
	}
	// Render new value of this.value
	this.render();
      }

      if(name == "disable") {
	if(newValue == "true") {
	  this.disable = true;
	}
	else {
	  this.disable = false;
	}
	this.render();
      }
    }
  }

  // Boilerplate
  disconnectedCallback() {}
  adoptedCallback() {}
  teardownDOM() {}
  
  //*** Render ***
  // Update buffer, then swap currently displayed SVG tree with buffer
  render() {
    let newPattern;
    if(this.disable) {
      newPattern = 0b0000000;
    }
    else if(this.value === -1) {
      newPattern = 0b0001000;
    }
    else {
      newPattern = SevenSegmentDigit.lightPatterns[this.value];
    }
    let isOn = 0;
    // Check bits of new pattern. If 1 turn light on, if 0 turn light off
    let bufferLights = this.svgBuffer.querySelector("g").childNodes;
    for(let i = 0; i < 7; i++) {
      isOn = (newPattern >> i) & 1;
      if(isOn) {
	bufferLights[i].setAttributeNS(null, "fill", this.onColor);
      }
      else {
	bufferLights[i].setAttributeNS(null, "fill", this.offColor);
      }
    }
    

    // Swap buffers
    //let oldSvgRoot = this.shadowRoot.querySelector("#svgRoot");
    //this.shadowRoot.replaceChild(this.svgBuffer, oldSvgRoot);
    //this.svgBuffer = oldSvgRoot;
    
  }
}
customElements.define("seven-segment-digit", SevenSegmentDigit);


// ***** DISPLAY *****
// Stores display value as string
class SevenSegmentDisplay extends HTMLElement {

  // *** Setup ***
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    // Set up svg prototypes for '.' and ':' that can be cloned and
    // inserted into the display if requested by format string
    this.onColor = "red";
    this.offColor = "#3d0f04";

    // Setup svg templates for colon and dot
    this.createTemplates();
  }
  
  // If we want to read attributes or the outside DOM in general,
  // we must wait for the custom element to be connected
  connectedCallback() {
    this.loaded = true;
    this.setupState();
    this.setupDOM();
  }

  // Optimisation: avoid transforms
  createTemplates() {
    let svgNS = "http://www.w3.org/2000/svg";
    let svgColonRoot = document.createElementNS(svgNS, "svg");
    let svgDotRoot = document.createElementNS(svgNS, "svg");
    let svgDot = document.createElementNS(svgNS, "circle");

    svgDot.setAttributeNS(null, "r", "3");
    svgDot.setAttributeNS(null, "cx", "3");
    svgDot.setAttributeNS(null, "cy", "3");
    svgDot.setAttributeNS(null, "fill", this.onColor); // lit by default

    let colonDot1 = svgDot.cloneNode(true);
    let colonDot2 = svgDot.cloneNode(true);
    let dotDot = svgDot.cloneNode(true);
    
    svgColonRoot.setAttributeNS(null,"id","svgColonRoot");
    svgColonRoot.setAttributeNS(null,"height","60");
    svgColonRoot.setAttributeNS(null,"width","16");

    colonDot1.setAttributeNS(null, "cx", "8");
    colonDot1.setAttributeNS(null, "cy", "16");
    colonDot2.setAttributeNS(null, "cx", "8");
    colonDot2.setAttributeNS(null, "cy", "44");
    svgColonRoot.appendChild(colonDot1);
    svgColonRoot.appendChild(colonDot2);
    
    svgDotRoot.setAttributeNS(null,"id","svgDotRoot");
    svgDotRoot.setAttributeNS(null,"height","60");
    svgDotRoot.setAttributeNS(null,"width","16");

    dotDot.setAttributeNS(null, "cx", "8");
    dotDot.setAttributeNS(null, "cy", "56");
    
    svgDotRoot.appendChild(dotDot);

    // make templates visible
    this.colon = svgColonRoot;
    this.dot = svgDotRoot;
  }

  setupState() {
    this.value =
      this.hasAttribute("value") ?
      this.getAttribute("value") :
      "0";
    
    let tmpFormat = ""
    if(this.hasAttribute("format")) {
      tmpFormat = this.getAttribute("format");
    }
    else {
      // If no format is specified, fill with enough digits to display value
      for(let i = 0; i < this.value.length; i++) {
	tmpFormat += "d"
      }
    }
    this.format = tmpFormat;
  }


  // Two steps:
  // 1. add DOM nodes to match given format
  // 2. fill in digits at digit slots, matching digit slots and digits ltr
  //    For instance, format="dd:dd" and value="12345" should render 12:34.
  setupDOM() {
    // First create component tree to match format string
    let wrapperElem = document.createElement("div");
    wrapperElem.setAttribute("id", "displayWrapper");

    let newWidth = this.getWidthFromFormat(this.format);
    wrapperElem.style.width = (newWidth + "px");
    wrapperElem.style.height = (60 + "px"); 


    // Parse format string and create DOM nodes
    // Count number of digits added. This is needed for update logic
    let bufferStart = 0;
    let digitCount = 0;

    // Add margin style to all children
    while(bufferStart < this.format.length) {
      let curChar = this.format[bufferStart];
   
      if(curChar == "d" || curChar == "D") {
	let digit = document.createElement("seven-segment-digit");
	digit.style.margin = "0px 2px 0px 2px";
	wrapperElem.appendChild(digit);
	bufferStart += 1;
	digitCount += 1;
      }

      // Create ':' in off state if alone, or on state if followed by '*'
      else if(curChar == ':') {
	if((bufferStart + 1) < this.format.length
	   && this.format[bufferStart+1] == '*') {
	  // Create lit ':'
	  let newLitColon = this.colon.cloneNode(true);
	  wrapperElem.appendChild(newLitColon);
	  bufferStart += 2;
	}
	else {
	  // Create unlit ':'
	  let newUnlitColon = this.colon.cloneNode(true);
	  let unlitCircles = newUnlitColon.querySelectorAll("circle");
	  
	  unlitCircles[0].setAttributeNS(null, "fill", this.offColor);
	  unlitCircles[1].setAttributeNS(null, "fill", this.offColor);

	  wrapperElem.appendChild(newUnlitColon);
	  bufferStart += 1;
	}
      }

      else if(curChar == '.') {
	if((bufferStart + 1) < this.format.length
	   && this.format[bufferStart+1] == '*') {
	  // Create lit '.'
	  let newLitDot = this.dot.cloneNode(true);
	  wrapperElem.appendChild(newLitDot);
	  bufferStart += 2;
	}
	else {
	  // Create unlit '.'
	  let newUnlitDot = this.dot.cloneNode(true);
	  newUnlitDot.childNodes[0].setAttributeNS(null, "fill", this.offColor);
	  wrapperElem.appendChild(newUnlitDot);
	  bufferStart += 1;
	}
      }
    }
    
    // Fill available seven segment digits with as much of this.value as possible
    // Digits without value remain zero. As all digits are initalised as 0,
    // this happens automaticly in this case
    let digitNodes = wrapperElem.querySelectorAll("seven-segment-digit");
    let numDigitNodes = digitNodes.length;
    for(let i = 0; i < this.value.length; i++) {
      if(i < numDigitNodes) {
	digitNodes[i].setAttribute("value", this.value[i]);
      }
    }

    // Update buffer *before* inserting into live DOM tree to reduce redraws
    // The buffer is only the wrapper element, to save memory
    // Nodes that can be kept between format changes are transplanted to the buffer
    this.displayBuffer = wrapperElem.cloneNode();
    
    this.shadowRoot.appendChild(wrapperElem);
    // Size dictated by content
    this.style = "display: inline-block; background-color: black;"
  }

  static get observedAttributes(){
    return ["value", "format"];
  }
  
  // *** Update ***
  attributeChangedCallback(name, oldValue, newValue) {
    // Only update on actual change
    if(oldValue != newValue) {
      if(name == "value") {
	this.value = newValue;
	this.renderValue();
      }
      if(name == "format") {
	this.format = newValue;
	this.renderFormat(oldValue); // Pass old format for easier diffing
      }
    }
  }

  disconnectedCallback() {
    this.teardownDOM();
  }

  adoptedCallback() {
    console.log("Adopted display");
  }

  teardownDOM() {
    console.log("Teardown");
    let wrapperNode = this.shadowRoot.querySelector("#displayWrapper");
    console.log(wrapperNode);
    if(wrapperNode) {
      wrapperNode.remove(true);
    }
  }
  
  // This method only alters the value of the digit elements
  // Render screen not strictly needed, as the size does not change.
  // If rerendering calls are a bottleneck, a render screen might help,
  // Assumption is that few digits are altered at once in most updates
  renderValue() {
    // No rendering before the element is actually loaded
    if(!this.loaded) {
      return;
    }

    // TODO: if no format is specified, the display
    // should grow and shrink to accomodate all digits in this.value
    
    // No buffering, under the assumption that few digits change at once
    let curDigits = this.shadowRoot.querySelectorAll("seven-segment-digit");
    let numDigits = curDigits.length;

    // Any digit might need an update. We have to iterate over all
    for(let i = 0; i < numDigits; i++) {
      let curDigit = curDigits[i];
      let curDigitValue = curDigit.getAttribute("value");

      // If we have more display digits than digits in the input value, set
      // the unspecified digit to 0.
      // Othewise, set it to the corrseponding input value digit
      let curInputDigit = 0;
      if(i < this.value.length) {
	curInputDigit = this.value[i];
      }
      // Compare digit in value to the digit already written
      if(curDigitValue !== this.value[i]) {
	if(this.value[i] === "_") {
	  curDigit.setAttribute("disable", "true");
	}
	else {
	  curDigit.setAttribute("disable", "false");
	  curDigit.setAttribute("value", curInputDigit);
	}
      }
    }
  }

  // We know something changed in the format string when this
  // method is called. The question is what
  renderFormat(oldFormat) {
    // No rendering before the element is actually loaded
    if(!this.loaded) {
      return;
    }

    // 1. Count how many of each child node we've currently got
    // lit/unlit does not matter in this case
    // Note at what index they exist by pushing to a queue
    // push adds to back, shift removes from front

    // Stores indexes
    let digits = [];
    let colons = [];
    let dots = [];

    // Ignore '*', as they represent the state of the colon/dot preceeding
    // and not a DOM node by themselves
    let curChar = ''
    for(let i = 0; i < oldFormat.length; i++) {
      curChar = oldFormat[i];
      if(curChar === 'd' || curChar === 'D') {
	digits.push[i];
      }
      else if(curChar === '.') {
	dots.push[i];
      }
      else if(curChar === ':') {
	colons.push[i];
      }
      // In all other cases, we either have a '*' or some invalid character.
      // in either case, these characters are ignored
    }

    // 2. Create a new DOM tree by reusing as much as possible
    // If no old elements are available, create new.
    // Render element for element, left to right 

    // 2a Replace current view with rendering screen
    // Set the screen size to the size of the new display format
    let newWidth = this.getWidthFromFormat(this.format);
    this.displayBuffer.style.width = (newWidth + "px");
    this.displayBuffer.style.height = (60 + "px"); 
    let screen = this.displayBuffer.cloneNode();
    let newDisplayTree = this.displayBuffer.cloneNode();
    
    // Swap old display tree with screen 
    let oldDisplayTree = this.shadowRoot.querySelector("#displayWrapper");
    this.shadowRoot.replaceChild(screen, oldDisplayTree);

    // 2b, construct the new display format, reusing as much as possible
    // The old display tree looses all references and is garbage collected
    // When leaving this scope, AKA the not reused nodes are tossed in the garbage.
    
    let oldChildNodes = oldDisplayTree.children;
    let newNode;
    for(let i = 0; i < this.format.length; i++) {
      newNode = undefined; // We don't yet know if this format character is valid
      curChar = this.format[i];
      if(curChar === 'd' || curChar === 'D') {
	// Reuse
	if(digits.length > 1) {
	  newNode = oldChildNodes[digits.shift()];
	  newNode.setAttribute("disable", "false");	  
	}
	// Create new
	else {
	  newNode = document.createElement("seven-segment-digit");
	  newNode.style.margin = "0px 2px 0px 2px";
	  newNode.setAttribute("disable", "false");
	}
      }
      else if(curChar === '.') {
	// Should the dot be lit?
	if((i+1) < this.format.length
	   && this.format[i+1] === '*') {
	  // Reuse
	  if(dots.length > 1) {
	    newNode = oldChildNodes[dots.shift()];
	    // We don't know if this old dot is lit, must light
	    newNode.childNodes[0].setAttributeNS(null, "fill", this.onColor);
	  }
	  // Create new
	  else {
	    // New dots and colons are lit by default
	    newNode = this.dot.cloneNode(true);
	  }
	  
	  i++; //Skip over the '*', as it has just been parsed
	}
	// Unlit dot
	else {
	  // Reuse
	  if(dots.length > 1) {
	    newNode = oldChildNodes[dots.shift()];
	  }
	  // Create new
	  else {
	    newNode = this.dot.cloneNode(true);
	  }
	  // Set lighting
	  newNode.childNodes[0].setAttributeNS(null, "fill", this.offColor);
	}
      }
      else if(curChar === ':') {
	// Should the colon be lit?
	if((i+1) < this.format.length
	   && this.format[i+1] === '*') {
	  // Reuse
	  if(colons.length > 1) {
	    newNode = oldChildNodes(colons.shift());
	    // Set lighting
	    newNode.childNodes[0].setAttributeNS(null, "fill", this.onColor);
	    newNode.childNodes[1].setAttributeNS(null, "fill", this.onColor);

	  }
	  // Create new
	  else {
	    // New dots and colons are lit by default
	    newNode = this.colon.cloneNode(true);
	  }

	  i++; //Skip over the '*', as it has just been parsed
	}
	// Unlit colon
	else {
	  // Reuse
	  if(colons.length > 1) {
	    newNode = oldChildNodes(colons.shift());
	  }
	  // Create new
	  else {
	    newNode = this.colon.cloneNode(true);
	  }

	  // Set lighting
	  newNode.childNodes[0].setAttributeNS(null, "fill", this.offColor);
	  newNode.childNodes[1].setAttributeNS(null, "fill", this.offColor);

	}
      }

      // Only add new node if the current format character was valid
      if(newNode !== undefined) {
	// Finaly, add the new child to the DOM tree under construction
	newDisplayTree.appendChild(newNode);
      }
    }

    // Swap screen out for new display tree
    this.shadowRoot.replaceChild(newDisplayTree, screen);
    
    // 4. Render values into new format
    this.renderValue();

  }
  //*** UTILS ***
  getWidthFromFormat(formatString) {
    let width = 0;
    let curChar = '';
    let digitWidth = 32;
    let separatorWidth = 16;
    let margin = 2;
    for(let i = 0; i < formatString.length; i++) {
      curChar = formatString[i];
      if(curChar === 'd' || curChar == 'D') {
	width += (margin + digitWidth + margin);
      }
      else if(curChar === ':' || curChar === '.') {
	width += (separatorWidth);
      }
    }
    return width;
  }
}

customElements.define("seven-segment-display", SevenSegmentDisplay);
