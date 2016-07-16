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
        this.linkedOrb = null;
      } else {
        this.linkedOrb = this.orbSelectElement.value;
      }
      this.emit("change", this.linkedOrb);
    });

    const orbSelectTd = document.createElement("td");
    orbSelectTd.appendChild(this.orbSelectElement);
    this.element.appendChild(orbSelectTd);

    this.oniCheckboxElement = document.createElement("input");
    this.oniCheckboxElement.type = "checkbox";
    this.oniCheckboxElement.addEventListener("change", () => {
      this.emit("oni", this.oniCheckboxElement.checked);
    });

    const oniTd = document.createElement("td");
    oniTd.appendChild(this.oniCheckboxElement);
    this.element.appendChild(oniTd);

    updateOrbSelect.call(this);
    if (this.linkedOrb === null) {
      this.orbSelectElement.value = unlinkedText;
    } else {
      this.orbSelectElement.value = this.linkedOrb;
    }
  }
  updateOrbs(orbs) {
    this.orbs = orbs;
    updateOrbSelect.call(this);
  }
}

function updateOrbSelect() {
  this.orbSelectElement.innerHTML = "";
  const editedOrbs = this.orbs.slice();
  editedOrbs.unshift(unlinkedText);
  editedOrbs.forEach(orbName => {
    const item = document.createElement("option");
    item.value = orbName;
    item.textContent = orbName;
    this.orbSelectElement.appendChild(item);
  });
}

