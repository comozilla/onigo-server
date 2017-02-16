import Controller from "../controller";
import CommandRunner from "../commandRunner";
import publisher from "../publisher";
import ComponentBase from "../componentBase";

class ControllerModel extends ComponentBase {
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
    this.publish("addedUnnamed", key, client);
  }
  setName(key, name) {
    if (!this.unnamedClients[key]) {
      throw new Error("setNameしようとしたところ、keyに対するclientが見つかりませんでした。 key: " + key);
    }
    let isNewName = !this.controllers[name];
    if (isNewName) {
      this.controllers[name] = new Controller(name, new CommandRunner(name));
    } else if (this.controllers[name].client !== null) {
      throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + name);
    }
    this.controllers[name].setClient(this.unnamedClients[key]);
    delete this.unnamedClients[key];
    this.publish("named", key, name, isNewName);
  }
  removeFromUnnamedClients(key) {
    if (this.hasInUnnamedClients(key)) {
      delete this.unnamedClients[key];
      this.publish("removedUnnamed", key);
    }
  }
  removeClient(name) {
    if (this.has(name)) {
      this.controllers[name].setClient(null);
      this.publish("removedClient", name);
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
