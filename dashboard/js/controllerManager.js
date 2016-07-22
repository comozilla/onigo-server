import eventPublisher from "./publisher";
import Controller from "./controller";

export default class ControllerManager {
  constructor(element) {
    this.element = element;
    this.controllers = [];

    this.orbNames = [];

    eventPublisher.on("defaultControllers", controllers => {
      console.log(controllers);
      Object.keys(controllers).forEach(controllerKey => {
        this.addController(controllerKey, controllers[controllerKey]);
      });
    });
    eventPublisher.on("addController", (key, controllerDetails) => {
      this.addController(key, controllerDetails);
    });
    eventPublisher.on("removeController", key => {
      this.removeController(key);
    });
    eventPublisher.on("orbs", orbs => {
      this.orbNames = orbs.map(orb => orb.orbName);
      this.controllers.forEach(controller => {
        controller.updateOrbs(this.orbNames);
      });
    });
    eventPublisher.on("hp", (key, hp) => {
      this.controllers.forEach(controller => {
	if (controller.controllerKey === key) {
	  controller.updateHp(hp);
	}
      });
    });
  }
  addController(controllerKey, controllerDetails) {
    const controller = new Controller(controllerKey, this.orbNames, controllerDetails);
    controller.on("change", orbName => {
      eventPublisher.emit("link", controllerKey, orbName);
    });
    controller.on("oni", isEnabled => {
      eventPublisher.emit("oni", controllerKey, isEnabled);
    });
    controller.on("resetHp", () => {
      eventPublisher.emit("resetHp", controllerKey);
    });
    this.element.appendChild(controller.element);
    this.controllers.push(controller);
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

