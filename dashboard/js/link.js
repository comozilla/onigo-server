import {EventEmitter} from "events";

const unlinkedText = "-- unlinked --";

export default class Link extends EventEmitter {
  constructor(clientKey, orbs, defaultLinkedOrb) {
    super();

    this.clientKey = clientKey;
    this.orbs = orbs;
    this.linkedOrb = defaultLinkedOrb;

    this.element = document.createElement("tr");

    this.clientElement = document.createElement("td");
    this.clientElement.textContent = this.clientKey;
    this.element.appendChild(this.clientElement);

    this.orbSelectElement = document.createElement("select");
    this.orbSelectElement.addEventListener("change", () => {
      if (this.orbSelectElement.value === unlinkedText) {
        this.emit("change", null);
      } else {
        this.emit("change", this.orbSelectElement.value);
      }
    });

    const orbSelectTd = document.createElement("td");
    orbSelectTd.appendChild(this.orbSelectElement);
    this.element.appendChild(orbSelectTd);

    updateOrbSelect.call(this);
  }
  updateOrbs(orbs) {
    this.orbs = orbs;
    updateOrbSelect.call(this);
  }
}

function updateOrbSelect() {
  this.orbSelectElement.innerHTML = "";
  let editedOrbs = this.orbs.slice();
  editedOrbs.unshift(unlinkedText);
  editedOrbs.forEach(orbName => {
    const item = document.createElement("option");
    item.value = orbName;
    item.textContent = orbName;
    this.orbSelectElement.appendChild(item);
  });
}

