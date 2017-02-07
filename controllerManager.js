import controllerModel from "./model/controllerModel";
import ComponentBase from "./componentBase";

export default class ControllerManager extends ComponentBase {
  constructor() {
    super();

    this.subscribe("oni", this.changeIsOni);
    this.subscribe("resetHp", this.resetHp);
    this.subscribe("addClient", this.addClient);
    this.subscribe("removeClient", this.removeClient);
  }
  changeIsOni(name, isEnabled) {
    controllerModel.get(name).setIsOni(isEnabled);
  }
  resetHp(name) {
    controllerModel.get(name).setHp(100);
  }
  changeColor(name, color) {
    controllerModel.get(name).setColor(color);
  }
  addClient(key, client) {
    controllerModel.add(key, client);
    client.on("arriveCustomMessage", (name, data, mesID) => {
      // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
      // requestNameとuseDefinedNameを分けている。
      // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
      // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
      if (name === "requestName") {
        if (controllerModel.has(data)) {
          client.sendCustomMessage("rejectName", null);
        } else {
          controllerModel.setName(key, data);
          client.sendCustomMessage("acceptName", data);
        }
      } else if (name === "useDefinedName") {
        if (!controllerModel.has(data)) {
          client.sendCustomMessage("rejectName", null);
        } else {
          controllerModel.setName(key, data);
          client.sendCustomMessage("acceptName", data);
        }
      }
    });
  }
  removeClient(key) {
    if (controllerModel.hasInUnnamedClients(key)) {
      this.publish("removedUnnamedClient", key);
      controllerModel.removeFromUnnamedClients(key);
    } else {
      this.publish("removedController", key);
      const name = controllerModel.toName(key);
      controllerModel.removeClient(name);
    }
  }
}
