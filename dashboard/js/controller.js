import {EventEmitter} from "events";

const unlinkedText = "-- unlinked --";
const colors = [
  "red",
  "coral",
  "green",
  "yellow",
  "blue",
  "purple",
  "skyblue"
];

export default class Controller extends EventEmitter {
  constructor(controllerKey, controllerName, orbs, controllerDetails) {
    super();

    this.controllerKey = controllerKey;
    this.controllerName = controllerName;
    this.orbs = orbs;
    this.linkedOrb = controllerDetails.link;

    this.element = document.createElement("tr");

    const controllerNameTd = document.createElement("td");
    controllerNameTd.textContent = this.controllerName;
    this.element.appendChild(controllerNameTd);

    this.keyTd = document.createElement("td");
    this.keyTd.textContent = this.controllerKey;
    this.element.appendChild(this.keyTd);

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
    this.oniCheckboxElement.checked = controllerDetails.isOni;

    const oniTd = document.createElement("td");
    oniTd.appendChild(this.oniCheckboxElement);
    this.element.appendChild(oniTd);

    this.hpTd = document.createElement("td");
    this.element.appendChild(this.hpTd);

    this.resetHpButton = document.createElement("button");
    this.resetHpButton.textContent = "set HP to 100";
    this.resetHpButton.addEventListener("click", () => {
      this.emit("resetHp");
    });

    const resetHpTd = document.createElement("td");
    resetHpTd.appendChild(this.resetHpButton);
    this.element.appendChild(resetHpTd);

    this.colorSelectElement = document.createElement("select");
    colors.forEach(color => {
      const item = document.createElement("option");
      item.value = color;
      item.textContent = color;
      this.colorSelectElement.appendChild(item);
    });
    this.colorSelectElement.value = controllerDetails.color;
    this.colorSelectElement.addEventListener("change", () => {
      this.emit("color", this.colorSelectElement.value);
    });

    const colorTd = document.createElement("td");
    colorTd.appendChild(this.colorSelectElement);
    this.element.appendChild(colorTd);

    updateOrbSelect.call(this);
    this.updateHp(controllerDetails.hp);
  }
  updateOrbs(orbs) {
    this.orbs = orbs;
    updateOrbSelect.call(this);
  }
  updateHp(hp) {
    this.hpTd.textContent = hp;
  }
  updateKey(key) {
    this.keyTd.textContent = key;
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

