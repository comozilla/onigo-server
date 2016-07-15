import eventPublisher from "./publisher";

export default class AddOrb {
  constructor() {
    this.nameElement = document.getElementById("new-orb-name");
    this.portElement = document.getElementById("new-orb-port");
    document.getElementById("add-orb").addEventListener("click", () => {
      eventPublisher.emit("addOrb", this.nameElement.value, this.portElement.value);
    });
  }
}

