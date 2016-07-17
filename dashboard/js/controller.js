import {EventEmitter} from "events";

const unlinkedText = "-- unlinked --";

export default class Controller extends EventEmitter {
  constructor(controllerKey, orbs, defaultLinkedOrb) {
    super();

    this.controllerKey = controllerKey;
    this.orbs = orbs;
    this.linkedOrb = defaultLinkedOrb;

    this.element = document.createElement("tr");

    this.controllerElement = document.createElement("td");
    this.controllerElement.textContent = this.controllerKey;
    this.element.appendChild(this.controllerElement);

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
  this.orbSelectElement.value = this.linkedOrb === null ? unlinkedText : this.linkedOrb;
}

