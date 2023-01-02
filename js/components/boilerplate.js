export { CustomComponent }

/*
 * Template for a new custom component. Contains all lifecylce methods,
 * declaration of attributes, and some placeholder methods for common use patterns.
 * 
 * To use, copy this file, replace all occurences of CustomComponent with your own 
 * (capitalised) name, and "custom-component" with a lower case, hyphen separated
 * name. This is the name used for the HTML tag.
 * 
 * Finally, include the file as a script in the HTML-document you
 * want to use the component in.
 *
 * More documentation at: https://developer.mozilla.org/en-US/docs/Web/Web_Components
 */

class CustomComponent extends HTMLElement { // Might extend other components as well

  // Replace these with the attributes you wish to listen to changes for
  static attributeNames = ['attribute1', 'attribute2'];

  // The constructor runs before the element is created and inserted into the DOM
  // Use it for setup
  // NB: super() MUST be called before anything else in the constructor
  constructor() {
    super();
  }

  // **** COMMON PATTERNS ****
  // Setup correct inital state (can also be used for reset)
  // It is recomended to declare any object variables (this.<variableName>)
  // in this method, to make it easier to see what variables exist at a glance
  setupState() {}

  // Initialise DOM elements needed for rendering
  setupDOM(){}

  // Create DOM representation based on internal state
  render(){}

  // State update based on for instance attributes
  update(){}

  // **** BUILT-INS ****

  // Returns a list of names of attributes
  // that trigger attributeChangedCallback on change
  static get observedAttributes() { return CustomComponent.attributeNames; }
  
  // Lifecycle
  connectedCallback() {}
  disconnectedCallback() {}
  adoptedCallback() {}

  // This method is triggered when an attribute in the list attributeNames is updated
  attributeChangedCallback(name, oldValue, newValue) {
     if(oldValue === newValue) {
       return;
     }
  }
}


customElements.define('custom-component', CustomComponent);

