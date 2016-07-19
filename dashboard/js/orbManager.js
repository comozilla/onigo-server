import eventPublisher from "./publisher";
import OrbMap from "./orbMap";

export default class OrbManager {
  constructor(element) {
    this.element = element;
    // { <name>: { orbName, port }, ... }
    this.orbMap = new OrbMap();

    eventPublisher.on("orbs", orbs => {
      const afterOrbMap = new OrbMap(orbs);
      const diff = this.orbMap.getDiff(afterOrbMap);
      diff.added.forEach(orbName => {
        this.orbMap.set(orbName, afterOrbMap.get(orbName));
        this.addRow(orbName);
      });
      diff.removed.forEach(orbName => {
        this.orbMap.remove(orbName);
        this.removeRow(orbName);
      });
      diff.noChanged.forEach(orbName => {
        const beforeOrb = this.orbMap.get(orbName);
        const afterOrb = afterOrbMap.get(orbName);
        if (beforeOrb.battery !== afterOrb.battery) {
          this.orbMap.setBattery(orbName, afterOrb.battery);
          this.updateBatteryForRow(orbName);
        }
        if (beforeOrb.link !== afterOrb.link) {
          this.orbMap.setLink(orbName, afterOrb.link);
          this.updateLinkForRow(orbName);
        }
      });
    });
  }
  addRow(orbName) {
    const trElement = document.createElement("tr");
    trElement.dataset.rowName = orbName;
    this.element.appendChild(trElement);
    const orbNameTd = document.createElement("td");
    orbNameTd.textContent = orbName;
    trElement.appendChild(orbNameTd);
    const portTd = document.createElement("td");
    portTd.textContent = this.orbMap.get(orbName).port;
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
  removeRow(orbName) {
    const row = document.querySelector(`[data-row-name="${orbName}"]`);
    this.element.removeChild(row);
  }
  updateLinkForRow(orbName) {
    const trElement = document.querySelector(`[data-row-name="${orbName}"]`);
    if (trElement === null) {
      throw new Error("update しようとした Row は存在しませんでした。 : " + orbName);
    }
    const unlinkedTd = trElement.childNodes[3];
    unlinkedTd.textContent = this.orbMap.get(orbName).link;
    const disconnectButton = trElement.childNodes[4].childNodes[0];
    disconnectButton.disabled = this.orbMap.get(orbName).link === "linked";
  }
  updateBatteryForRow(orbName) {
    const trElement = document.querySelector(`[data-row-name="${orbName}"]`);
    if (trElement === null) {
      throw new Error("updateBattery しようとした Row は存在しませんでした。 : " + orbName);
    }
    if (!this.orbMap.has(orbName)) {
      throw new Error("updateBattery しようとした Orb は存在しませんでした。 : " + orbName);
    }
    const batteryTd = trElement.childNodes[2];
    batteryTd.textContent =
      this.orbMap.get(orbName).battery === null ? "unchecked" : this.orbMap.get(orbName).battery;
  }
}

