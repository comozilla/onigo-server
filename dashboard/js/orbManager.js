import eventPublisher from "./publisher";

export default class OrbManager {
  constructor(element) {
    this.element = element;
    // { <name>: { orbName, port }, ... }
    this.orbs = {};
    // [name, name, name, ...]
    this.unlinkedOrbs = [];
    // { <name>: batteryState, ... }
    this.batteryStates = {};

    eventPublisher.on("orbs", orbs => {
      this.orbs = {};
      orbs.forEach(orb => {
        this.orbs[orb.orbName] = orb;
      });
      this.update();
    });
    eventPublisher.on("unlinkedOrbs", unlinkedOrbs => {
      const newUnlinkedOrbs = unlinkedOrbs.map(unlinkedOrb => unlinkedOrb.orbName);
      const addedUnlinkedOrbs =
        newUnlinkedOrbs.filter(unlinkedOrb => this.unlinkedOrbs.indexOf(unlinkedOrb) === -1);
      const removedUnlinkedOrbs =
        this.unlinkedOrbs.filter(unlinkedOrb => newUnlinkedOrbs.indexOf(unlinkedOrb) === -1);
      addedUnlinkedOrbs.forEach(unlinkedOrb => {
        this.unlinkedOrbs.push(unlinkedOrb);
        this.updateLinkForRow(unlinkedOrb);
      });
      removedUnlinkedOrbs.forEach(unlinkedOrb => {
        this.unlinkedOrbs.splice(this.unlinkedOrbs.indexOf(unlinkedOrb), 1);
        this.updateLinkForRow(unlinkedOrb);
      });
    });
    eventPublisher.on("battery", (orbName, batteryState) => {
      this.batteryStates[orbName] = batteryState;
      this.updateBatteryForRow(orbName);
    });
    this.clear();
    this.addTitle();
  }
  addTitle() {
    const trElement = document.createElement("tr");
    this.element.appendChild(trElement);
    const orbNameTh = document.createElement("th");
    orbNameTh.textContent = "Orb Name";
    trElement.appendChild(orbNameTh);
    const portTh = document.createElement("th");
    portTh.textContent = "Port";
    trElement.appendChild(portTh);
    const batteryTh = document.createElement("th");
    batteryTh.textContent = "Battery State";
    trElement.appendChild(batteryTh);
    const unlinkedTh = document.createElement("th");
    unlinkedTh.textContent = "Link Status";
    trElement.appendChild(unlinkedTh);
    const disconnectTh = document.createElement("th");
    disconnectTh.textContent = "Disconnect";
    trElement.appendChild(disconnectTh);
  }
  clear() {
    this.element.innerHTML = "";
  }
  update() {
    this.clear();
    this.addTitle();
    Object.keys(this.orbs).forEach(orbName => {
      this.addRow(orbName);
    });
  }
  addRow(orbName) {
    const orb = this.orbs[orbName];

    const trElement = document.createElement("tr");
    trElement.dataset.rowName = orbName;
    this.element.appendChild(trElement);
    const orbNameTd = document.createElement("td");
    orbNameTd.textContent = orbName;
    trElement.appendChild(orbNameTd);
    const portTd = document.createElement("td");
    portTd.textContent = orb.port;
    trElement.appendChild(portTd);
    const batteryTd = document.createElement("td");
    batteryTd.textContent = "unchecked";
    trElement.appendChild(batteryTd);
    const unlinkedTd = document.createElement("td");
    trElement.appendChild(unlinkedTd);
    const disconnectTd = document.createElement("td");
    trElement.appendChild(disconnectTd);
    const disconnectButton = document.createElement("button");
    disconnectButton.textContent = "Disconnect";
    disconnectButton.addEventListener("click", () => {
      eventPublisher.emit("disconnect", orbName);
    });
    disconnectTd.appendChild(disconnectButton);
    this.updateLinkForRow(orbName);
    this.updateBatteryForRow(orbName);
  }
  updateLinkForRow(orbName) {
    const isLinked = this.unlinkedOrbs.indexOf(orbName) === -1;
    const trElement = document.querySelector(`[data-row-name="${orbName}"]`);
    if (trElement === null) {
      throw new Error("update しようとした Row は存在しませんでした。 : " + orbName);
    }
    const unlinkedTd = trElement.childNodes[3];
    unlinkedTd.textContent = isLinked ? "linked" : "unlinked";
    const disconnectButton = trElement.childNodes[4].childNodes[0];
    disconnectButton.disabled = isLinked;
  }
  updateBatteryForRow(orbName) {
    const trElement = document.querySelector(`[data-row-name="${orbName}"]`);
    if (trElement === null) {
      throw new Error("update しようとした Row は存在しませんでした。 : " + orbName);
    }
    const batteryTd = trElement.childNodes[2];
    batteryTd.textContent =
      typeof this.batteryStates[orbName] === "undefined" ?
      "unchecked" : this.batteryStates[orbName]
  }
}
