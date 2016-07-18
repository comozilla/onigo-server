import eventPublisher from "./publisher";
import Controller from "./controller";

export default class ControllerManager {
  constructor(element) {
    this.element = element;
    this.controllers = [];

    // this.controllerLinks[controllerKey] = linkedOrbName
    this.controllerLinks = {};
    this.orbNames = [];

    eventPublisher.on("defaultLinks", links => {
      this.controllerLinks = links;
      Object.keys(links).forEach(controllerKey => {
        this.addController(controllerKey);
      });
    });
    eventPublisher.on("addController", key => {
      this.controllerLinks[key] = null;
      this.addController(key);
    });
    eventPublisher.on("removeController", key => {
      if (typeof this.controllerLinks[key] !== "undefined") {
        delete this.controllerLinks[key];
        this.removeController(key);
      }
    });
    eventPublisher.on("orbs", orbs => {
      this.orbNames = orbs;
      this.controllers.forEach(controller => {
        controller.updateOrbs(this.orbNames);
      });
    });
  }
  addController(controllerKey) {
    const link = new Controller(controllerKey, this.orbNames, this.controllerLinks[controllerKey]);
    link.on("change", orbName => {
      this.controllerLinks[controllerKey] = orbName;
      eventPublisher.emit("link", controllerKey, orbName);
    });
    link.on("oni", isEnabled => {
      eventPublisher.emit("oni", controllerKey, isEnabled);
    });
    this.element.appendChild(link.element);
    this.controllers.push(link);
  }
  removeController(controllerKey) {
    const keyIndex = this.controllers.map(instance => instance.controllerKey).indexOf(controllerKey);
    if (keyIndex === -1) {
      throw new Error(`removeしようとしたcontrollerKeyは存在しませんでした。 : ${controllerKey}`);
    }
    this.element.removeChild(this.controllers[keyIndex].element);
    this.controllers.splice(keyIndex, 1);
  }
}

