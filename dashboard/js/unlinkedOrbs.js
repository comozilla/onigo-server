import eventPublisher from "./publisher";

export default class UnlinkedOrbs {
  constructor(element) {
    this.element = element;
    this.unlinkedOrbs = [];
    eventPublisher.on("unlinkedOrbs", (unlinkedOrbs) => {
      this.unlinkedOrbs = unlinkedOrbs;
      this.update();
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
    this.unlinkedOrbs.forEach(unlinkedOrb => {
      this.addRow(unlinkedOrb.orbName, unlinkedOrb.port);
    });
  }
  addRow(name, port) {
    const trElement = document.createElement("tr");
    this.element.appendChild(trElement);
    const orbNameTd = document.createElement("td");
    orbNameTd.textContent = name;
    trElement.appendChild(orbNameTd);
    const portTd = document.createElement("td");
    portTd.textContent = port;
    trElement.appendChild(portTd);
    const disconnectTd = document.createElement("td");
    trElement.appendChild(disconnectTd);
    const disconnectButton = document.createElement("button");
    disconnectButton.textContent = "Disconnect";
    disconnectButton.addEventListener("click", () => {
      eventPublisher.emit("disconnect", name);
    });
    disconnectTd.appendChild(disconnectButton);
  }
}
