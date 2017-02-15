import controllerModel from "./model/controllerModel";
import appModel from "./model/appModel";
import orbModel from "./model/orbModel";
import ComponentBase from "./componentBase";

export default class ControllerManager extends ComponentBase {
  constructor(defaultHp, damage) {
    super();

    this.defaultHp = defaultHp;
    this.damageHp = damage;

    this.subscribe("oni", this.changeIsOni);
    this.subscribe("resetHp", this.resetHp);
    this.subscribe("addClient", this.addClient);
    this.subscribe("removeClient", this.removeClient);
    this.subscribe("gameState", this.updateGameState);
    this.subscribe("collision", this.damage);
    this.subscribe("availableCommandsCount", this.updateAvailableCommandsCount);
    this.subscribe("updateLink", this.updateLink);
    this.subscribe("rankingState", this.updateRankingState);
  }
  changeIsOni(name, isEnabled) {
    controllerModel.get(name).setIsOni(isEnabled);
  }
  resetHp(name) {
    controllerModel.get(name).setHp(this.defaultHp);
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
  updateGameState(state) {
    Object.keys(controllerModel.controllers).filter(key => {
      return controllerModel.get(key).client !== null;
    }).forEach(key => {
      controllerModel.get(key).client.sendCustomMessage("gameState", state);
    });
  }
  updateRankingState(state) {
    Object.keys(controllerModel.controllers).filter(key => {
      return controllerModel.get(key).client !== null;
    }).forEach(key => {
      controllerModel.get(key).client.sendCustomMessage("rankingState", state);
    });
  };
  updateRanking(ranking) {
    Object.keys(controllerModel.controllers).filter(key => {
      return controllerModel.get(key).client !== null;
    }).forEach(key => {
      controllerModel.get(key).client.sendCustomMessage("ranking", ranking);
    });
  }
  damage(orb) {
    Object.keys(controllerModel.controllers).forEach(controllerName => {
      const controller = controllerModel.get(controllerName);
      if (appModel.gameState === "active" && !controller.isOni &&
          controller.client !== null &&
          orb.linkedClients.indexOf(controller.client.key) !== -1) {
        controller.setHp(controller.hp - this.damageHp);
      }
    });
  }
  updateAvailableCommandsCount(count) {
    Object.keys(controllerModel.controllers).forEach(name => {
      const client = controllerModel.get(name).client;
      if (client !== null) {
        client.sendCustomMessage("availableCommandsCount", count);
      } else {
        console.warn("Tryed to update availableCommandsCount but client is null. name: " + name);
      }
    });
  }
  updateLink(controllerName, orbName) {
    controllerModel.get(controllerName).setLink(
      orbName !== null ? orbModel.getOrbFromSpheroWS(orbName) : null);
  }
}

