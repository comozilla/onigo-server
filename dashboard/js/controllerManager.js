import eventPublisher from "./publisher";
import Controller from "./controller";

export default class ControllerManager {
  constructor(element) {
    this.element = element;
    this.controllers = [];

    this.orbNames = [];

    eventPublisher.on("defaultControllers", controllers => {
      Object.keys(controllers).forEach(name => {
        this.addController(controllers[name].key !== null ? controllers[name].key : "no client",
          name, controllers[name]);
      });
    });
    eventPublisher.on("named", (key, name, controllerDetails) => {
      if (this.has(name)) {
        this.get(name).updateKey(key);
      } else {
        this.addController(key, name, controllerDetails);
      }
    });
    eventPublisher.on("removeClient", name => {
      if (this.has(name)) {
        this.get(name).updateKey("no client");
      }
    });
    eventPublisher.on("orbs", orbs => {
      this.orbNames = orbs.map(orb => orb.orbName);
      this.controllers.forEach(controller => {
        controller.updateOrbs(this.orbNames);
      });
    });
    eventPublisher.on("hp", (name, hp) => {
      if (this.has(name)) {
        this.get(name).updateHp(hp);
      }
    });
  }
  addController(controllerKey, controllerName, controllerDetails) {
    const controller = new Controller(controllerKey, controllerName, this.orbNames, controllerDetails);
    controller.on("change", orbName => {
      eventPublisher.emit("link", controllerName, orbName);
    });
    controller.on("oni", isEnabled => {
      eventPublisher.emit("oni", controllerName, isEnabled);
    });
    controller.on("resetHp", () => {
      eventPublisher.emit("resetHp", controllerName);
    });
    controller.on("color", color => {
      eventPublisher.emit("color", controllerName, color);
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
  has(name) {
    return this.controllers
      .map(controller => controller.controllerName)
      .indexOf(name) >= 0
  }
  get(name) {
    if (!this.has(name)) {
      throw new Error("getしようとしたcontrollerは存在しません : " + name);
    }
    return this.controllers.filter(controller => controller.controllerName === name)[0];
  }
}

