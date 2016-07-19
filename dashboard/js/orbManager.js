import eventPublisher from "./publisher";

export default class OrbManager {
  constructor(element) {
    this.element = element;
    // { <name>: { orbName, port }, ... }
    this.orbs = {};

    eventPublisher.on("orbs", orbs => {
      const afterOrbNames = orbs.map(orb => orb.orbName);
      const diff = getDiff(Object.keys(this.orbs), afterOrbNames);
      diff.added.forEach(diffDetails => {
        this.orbs[diffDetails.item] = orbs[afterOrbNames.indexOf(diffDetails.item)];
        this.orbs[diffDetails.item].index = diffDetails.index;
        this.addRow(diffDetails.item);
      });
      diff.removed.forEach(diffDetails => {
        this.removeRow(diffDetails.item);
      });
      diff.noChanged.forEach(orbName => {
        const beforeOrb = this.orbs[orbName];
        const afterOrb = orbs[afterOrbNames.indexOf(orbName)];
        if (beforeOrb.battery !== afterOrb.battery) {
          this.orbs[orbName].battery = afterOrb.battery;
          this.updateBatteryForRow(orbName);
        }
        if (beforeOrb.link !== afterOrb.link) {
          this.orbs[orbName].link = afterOrb.link;
          this.updateLinkForRow(orbName);
        }
      });
    });
  }
  addRow(orbName) {
    const orb = this.orbs[orbName];

    const trElement = document.createElement("tr");
    trElement.dataset.rowName = orbName;
    this.element.insertBefore(trElement, this.element.childNodes[orb.index + 2]);
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
    unlinkedTd.textContent = this.orbs[orbName].link;
    const disconnectButton = trElement.childNodes[4].childNodes[0];
    disconnectButton.disabled = this.orbs[orbName].link === "linked";
  }
  updateBatteryForRow(orbName) {
    const trElement = document.querySelector(`[data-row-name="${orbName}"]`);
    if (trElement === null) {
      throw new Error("updateBattery しようとした Row は存在しませんでした。 : " + orbName);
    }
    if (typeof this.orbs[orbName] === "undefined") {
      throw new Error("updateBattery しようとした Orb は存在しませんでした。 : " + orbName);
    }
    const batteryTd = trElement.childNodes[2];
    batteryTd.textContent =
      this.orbs[orbName].battery === null ? "unchecked" : this.orbs[orbName].battery;
  }
}

function getDiff(before, after) {
  const getAddedItem = (before, after) => {
    const addedIndexes = [];
    return after.filter((item, index) => {
      const isLeave = before.indexOf(item) === -1;
      if (isLeave) {
        addedIndexes.push(index);
      }
      return isLeave;
    }).map((item, index) => { return { index: addedIndexes[index], item } });
  };
  const added = getAddedItem(before, after);
  const removed = getAddedItem(after, before);
  return {
    added,
    removed,
    noChanged: before.filter(item => after.indexOf(item) >= 0)
  };
}
