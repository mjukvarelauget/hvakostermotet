export { Participants }

/*
 * Component listing all participants
 * TODO Need a way to create new participants 
 */

class Participants extends HTMLElement {

  static attributeNames = [];

  constructor() {
    super();
    this.setupState();
    this.setupDom();
  }
  
  setupState() {

    let participantCardTemplate =
      this.querySelector("template.participant-card");

    this.removeChild(participantCardTemplate);

    this.participantCardWrapper = document.createElement("div")
    this.participantCardWrapper.appendChild(participantCardTemplate.content)
    this.participantCardWrapper.className = participantCardTemplate.className
    
    
  }
  setupDom(){
    this.appendChild(
      this.participantCardWrapper
    );

    this.appendChild(
      this.participantCardWrapper.cloneNode(true)
    );
  }
  render(){}
  update(){}

  // **** BUILT-INS ****

  // Returns a list of names of attributes
  // that trigger attributeChangedCallback on change
  static get observedAttributes() { return Participants.attributeNames; }
  
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


customElements.define("participant-list", Participants);

