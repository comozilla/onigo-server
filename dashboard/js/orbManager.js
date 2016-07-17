import eventPublisher from "./publisher";

export default class OrbManager {
  constructor(element) {
    this.element = element;
    // { <name>: { orbName, port }, ... }
    this.orbs = {};
    // [name, name, name, ...]
    this.unlinkedOrbs = [];
    eventPublisher.on("orbs", orbs => {
      this.orbs = {};
      orbs.forEach(orb => {
        this.orbs[orb.orbName] = orb;
      });
      this.update();
    });
    eventPublisher.on("unlinkedOrbs", unlinkedOrbs => {
      const newUnlinkedOrbs = unlinkedOrbs.map(unlinkedOrb => unlinkedOrb.orbName);
      for (let i = 0; i < Math.max(newUnlinkedOrbs.length, this.unlinkedOrbs.length); i++) {
        if (i >= this.unlinkedOrbs.length) {
          this.unlinkedOrbs.push(newUnlinkedOrbs[i]);
          this.updateRow(newUnlinkedOrbs[i]);
        } else if (i >= newUnlinkedOrbs.length) {
          const orbName = this.unlinkedOrbs.splice(i, 1);
          this.updateRow(orbName[0]);
        } else if (this.unlinkedOrbs[i] !== orbName) {
          this.unlinkedOrbs[i] = newUnlinkedOrbs[i];
          this.updateRow(this.unlinkedOrbs[i]);
        }
      };
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
    this.updateRow(orbName);
  }
  updateRow(orbName) {
    const isLinked = this.unlinkedOrbs.indexOf(orbName) === -1;
    const trElement = document.querySelector(`[data-row-name="${orbName}"]`);
    if (trElement === null) {
      throw new Error("update しようとした Row は存在しませんでした。 : " + orbName);
    }
    const unlinkedTd = trElement.childNodes[2];
    unlinkedTd.textContent = isLinked ? "linked" : "unlinked";
    const disconnectButton = trElement.childNodes[3].childNodes[0];
    disconnectButton.disabled = isLinked;
  }
}
