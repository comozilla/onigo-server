import Controller from "./controller";
import CommandRunner from "./commandRunner";
import { EventEmitter } from "events";

class ControllerModel extends EventEmitter {
  constructor() {
    super();

    // 最初、controllerはunnamedControllerに追加される。
    // name がわかると、それが controllers に移行される。
    // こうすることで、clientが異なっても、nameが同じ場合、HPなどを共有できるようになる。

    // { key: Client, ... }
    this.unnamedClients = {};
    // { name: Controller, ... }
    this.controllers = {};
  }
  add(key, client) {
    this.unnamedClients[key] = client;
    this.emit("add", key, client);
  }
  setName(key, name) {
    if (typeof this.unnamedClients[key] === "undefined") {
      throw new Error("setNameしようとしたところ、keyに対するclientが見つかりませんでした。 key: " + key);
    }
    let isNewName = typeof this.controllers[name] === "undefined";
    if (isNewName) {
      this.controllers[name] = new Controller(name, new CommandRunner(key));
    }
    this.controllers[name].setClient(this.unnamedClients[key]);
    delete this.unnamedClients[key];
    this.emit("named", key, name, isNewName);
  }
  removeFromUnnamedClients(key) {
    if (this.hasInUnnamedClients(key)) {
      delete this.unnamedClients[key];
      this.emit("removeUnnamed", key);
    }
  }
  removeClient(name) {
    if (this.has(name)) {
      this.controllers[name].setClient(null);
      this.emit("remove", name);
    }
  }
  hasInUnnamedClients(key) {
    return typeof this.unnamedClients[key] !== "undefined";
  }
  has(name) {
    return typeof this.controllers[name] !== "undefined";
  }
  get(name) {
    return this.controllers[name];
  }
  getAllStates() {
    const result = {};
    Object.keys(this.controllers).forEach(name => {
      result[name] = this.controllers[name].getStates();
    });
    return result;
  }
  getUnnamedKeys() {
    return Object.keys(this.unnamedClients);
  }
  toName(key) {
    const nameArray = Object.keys(this.controllers).filter(name => {
      return this.controllers[name].client !== null &&
        this.controllers[name].client.key === key;
    });
    if (nameArray.length === 1) {
      return nameArray[0];
    } else {
      return null;
    }
  }
}

export default new ControllerModel();
