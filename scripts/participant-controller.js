import {updateHourCost} from "./projection-controller.js";

// Bookkeeping
let numParticipants = 0;
let totalHourCost = 0;

// DOM object handles
let participantListDOM;

// Internal state
let participants = [];
class Participant {
  constructor(name, position, pay) {
    this.name = name;
    this.position = position;
    this.pay = pay;
  }
}


const setupHandles = () => {
  participantListDOM = document.querySelectorAll(".participant-list-wrapper li");
}

const removeWhitespace = (string) => {
  const whitespace = ['\n', '\t', ' '];
  for(let char of whitespace) {
    string = string.replaceAll(char, '');
  }
  return string;
}

// Translate from DOM list element into participant object
const readParticipants = () => {
  participants = [];
  for(let participantListElem of participantListDOM) {
    let name =
      removeWhitespace(participantListElem.querySelector(".name").textContent);
    let position =
      removeWhitespace(participantListElem.querySelector(".position").textContent);
    let pay =
      removeWhitespace(participantListElem.querySelector(".pay").textContent);

    let curParticipant = new Participant(name, position, parseInt(pay, 10));
    participants.push(curParticipant);
  }
  numParticipants = participants.length;
}

// Scan through the list of participants, get payment, add it up
const getTotalHourPay = ()  => {
  totalHourCost = 0;
  for(let participant of participants) {
    totalHourCost += participant.pay;
  }
}


const init = (e) => {
  setupHandles();
  readParticipants();
  getTotalHourPay();
  updateHourCost(totalHourCost);
}

window.addEventListener('load', init);

