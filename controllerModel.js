import Controller from "./controller";
import CommandRunner from "./commandRunner";

class ControllerModel {
  constructor() {
    this.controllers = {};
  }
  add(key, client) {
    this.controllers[key] = new Controller(client, new CommandRunner(key));
  }
  remove(key) {
    if (this.has(key)) {
      delete this.controllers[key];
    }
  }
  has(key) {
    return typeof this.controllers[key] !== "undefined";
  }
  get(key) {
    return this.controllers[key];
  }
  getAllStates() {
    const result = {};
    Object.keys(this.controllers).forEach(key => {
      result[key] = this.controllers[key].getStates();
    });
    return result;
  }
}

export default new ControllerModel();
