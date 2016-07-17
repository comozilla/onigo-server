import eventPublisher from "./publisher";
import Controller from "./controller";

export default class ControllerManager {
  constructor(element) {
    this.element = element;
    this.controllers = [];

    // this.clientLinks[clientKey] = linkedOrbName
    this.clientLinks = {};
    this.orbNames = [];

    eventPublisher.on("defaultLinks", links => {
      this.clientLinks = links;
      Object.keys(links).forEach(clientKey => {
        this.addController(clientKey);
      });
    });
    eventPublisher.on("addClient", clientKey => {
      this.clientLinks[clientKey] = null;
      this.addController(clientKey);
    });
    eventPublisher.on("removeClient", clientKey => {
      if (typeof this.clientLinks[clientKey] !== "undefined") {
        delete this.clientLinks[clientKey];
        this.removeController(clientKey);
      }
    });
    eventPublisher.on("orbs", orbs => {
      this.orbNames = orbs;
      this.controllers.forEach(controller => {
        controller.updateOrbs(this.orbNames);
      });
    });
  }
  addController(clientKey) {
    const link = new Controller(clientKey, this.orbNames, this.clientLinks[clientKey]);
    link.on("change", orbName => {
      this.clientLinks[clientKey] = orbName;
      eventPublisher.emit("link", clientKey, orbName);
    });
    link.on("oni", enable => {
      eventPublisher.emit("oni", clientKey, enable);
    });
    this.element.appendChild(link.element);
    this.controllers.push(link);
  }
  removeController(clientKey) {
    const keyIndex = this.controllers.map(instance => instance.clientKey).indexOf(clientKey);
    if (keyIndex === -1) {
      throw new Error(`removeしようとしたclientKeyは存在しませんでした。 : ${clientKey}`);
    }
    this.element.removeChild(this.controllers[keyIndex].element);
    this.controllers.splice(keyIndex, 1);
  }
}

