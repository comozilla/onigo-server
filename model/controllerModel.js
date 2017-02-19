import Controller from "../controller";
import CommandRunner from "../commandRunner";
import publisher from "../publisher";
import ComponentBase from "../componentBase";

export default class ControllerModel extends ComponentBase {
  constructor() {
    super();

    // 最初、controllerはunnamedControllerに追加される。
    // name がわかると、それが controllers に移行される。
    // こうすることで、clientが異なっても、nameが同じ場合、HPなどを共有できるようになる。

    // { key: Client, ... }
    this.unknownClients = {};
    // { name: Controller, ... }
    this.controllers = {};
  }
  addUnknownClient(key, client) {
    this.unknownClients[key] = client;
    this.publish("addedUnknown", key, client);
  }
  addClient(name, key) {
    this.controllers[name].setClient(this.unknownClients[key]);
    this.removeUnknownClient(key);
    this.publish("addedClient", name);
  }
  addController(name) {
    this.controllers[name] = new Controller(name, new CommandRunner(name));
    this.publish("addedController", name);
  }
  setName(key, name) {
    if (!this.unknownClients[key]) {
      throw new Error("setNameしようとしたところ、keyに対するclientが見つかりませんでした。 key: " + key);
    }
    const isNewName = !this.controllers[name];
    if (isNewName) {
      this.addController(name);
    } else if (this.controllers[name].client !== null) {
      throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + name);
    }
    this.addClient(name, key);
  }
  removeUnknownClient(key) {
    if (this.hasInUnknownClients(key)) {
      delete this.unknownClients[key];
      this.publish("removedUnknown", key);
    }
  }
  removeClient(name) {
    if (this.has(name)) {
      this.controllers[name].setClient(null);
      this.publish("removedClient", name);
    }
  }
  hasInUnknownClients(key) {
    return typeof this.unknownClients[key] !== "undefined";
  }
  has(name) {
    return typeof this.controllers[name] !== "undefined";
  }
  get(name) {
    return this.controllers[name];
  }
  getAllStates() {
    const result = {};
    for (let name in this.controllers) {
      result[name] = this.controllers[name].getStates();
    }
    return result;
  }
  getUnnamedKeys() {
    return Object.keys(this.unknownClients);
  }
  toName(key) {
    for (let name in this.controllers) {
      if (this.controllers[name].client &&
          this.controllers[name].client.key === key) {
        return name;
      }
    }
    return null;
  }
}

