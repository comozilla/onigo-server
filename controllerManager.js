import ComponentBase from "./componentBase";

export default class ControllerManager extends ComponentBase {
  constructor(models, defaultHp, damage) {
    super(models);

    this.defaultHp = defaultHp;
    this.damageHp = damage;

    this.subscribe("oni", this.changeIsOni);
    this.subscribe("resetHp", this.resetHp);
    this.subscribe("color", this.changeColor);
    this.subscribe("addClient", this.addClient);
    this.subscribe("addedUnknown", this.initializeUnknown);
    this.subscribe("removeClient", this.removeClient);
    this.subscribe("gameState", this.updateGameState);
    this.subscribe("collision", this.damage);
    this.subscribe("availableCommandsCount", this.updateAvailableCommandsCount);
    this.subscribe("updateLink", this.updateLink);
    this.subscribe("rankingState", this.updateRankingState);
    this.subscribe("addedClient", this.initializeClient);
    this.subscribe("addedController", this.initializeController);
    this.subscribe("setCommands", this.setCommands);
    this.subscribe("command", this.command);
  }
  changeIsOni(name, isEnabled) {
    this.controllerModel.get(name).setIsOni(isEnabled);
  }
  resetHp(name) {
    this.controllerModel.get(name).setHp(this.defaultHp);
  }
  changeColor(name, color) {
    this.controllerModel.get(name).setColor(color);
  }
  addClient(key, client) {
    this.controllerModel.addUnknownClient(key, client);
  }
  removeClient(key) {
    if (this.controllerModel.hasInUnknownClients(key)) {
      this.controllerModel.removeUnknownClient(key);
    } else {
      const name = this.controllerModel.toName(key);
      this.controllerModel.removeClient(name);
    }
  }
  updateGameState(state) {
    for (let name in this.controllerModel.controllers) {
      if (this.controllerModel.get(name).client) {
        this.controllerModel.get(name).client.sendCustomMessage("gameState", state);
      }
    }
  }
  updateRankingState(state) {
    for (let name in this.controllerModel.controllers) {
      if (this.controllerModel.get(name).client) {
        this.controllerModel.get(name).client.sendCustomMessage("rankingState", state);
      }
    }
  };
  updateRanking(ranking) {
    for (let name in this.controllerModel.controllers) {
      if (this.controllerModel.get(name).client) {
        this.controllerModel.get(name).client.sendCustomMessage("ranking", ranking);
      }
    }
  }
  damage(orb) {
    for (let controllerName in this.controllerModel.controllers) {
      const controller = this.controllerModel.get(controllerName);
      if (this.appModel.gameState === "active" && !controller.isOni &&
          controller.client && orb.linkedClients.indexOf(controller.client.key) !== -1) {
        controller.setHp(controller.hp - this.damageHp);
      }
    }
  }
  updateAvailableCommandsCount(count) {
    for (let name in this.controllerModel.controllers) {
      const client = this.controllerModel.get(name).client;
      if (client) {
        client.sendCustomMessage("availableCommandsCount", count);
      } else {
        console.warn("Tryed to update availableCommandsCount but client is null. name: " + name);
      }
    }
  }
  updateLink(controllerName, orbName) {
    this.controllerModel.get(controllerName).setLink(
      orbName ? this.orbModel.getOrbFromSpheroWS(orbName) : null);
  }
  initializeUnknown(key, client) {
    client.on("arriveCustomMessage", (name, data, mesID) => {
      // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
      // requestNameとuseDefinedNameを分けている。
      // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
      // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
      if (name === "requestName") {
        if (this.controllerModel.has(data)) {
          client.sendCustomMessage("rejectName", null);
        } else {
          this.controllerModel.setName(key, data);
          client.sendCustomMessage("acceptName", data);
        }
      } else if (name === "useDefinedName") {
        if (!this.controllerModel.has(data)) {
          client.sendCustomMessage("rejectName", null);
        } else {
          this.controllerModel.setName(key, data);
          client.sendCustomMessage("acceptName", data);
        }
      }
    });
  }
  initializeClient(name) {
    const controller = this.controllerModel.get(name);
    const client = controller.client;

    client.sendCustomMessage("gameState", this.appModel.gameState);
    client.sendCustomMessage("rankingState", this.appModel.rankingState);
    client.sendCustomMessage("availableCommandsCount", this.appModel.availableCommandsCount);
    client.sendCustomMessage("clientKey", client.key);

    client.on("arriveCustomMessage", (messageName, data, mesID) => {
      if (messageName === "commands") {
        this.publish("setCommands", name, data);
      }
    });
  }
  initializeController(name) {
    console.log(name);
    const controller = this.controllerModel.get(name);
    controller.on("hp", hp => {
      this.publish("hp", name, hp);
    });
  }
  setCommands(name, commands) {
    const controller = this.controllerModel.get(name);
    controller.commandRunner.setCommands(commands);
  }
  command(controllerName, commandName, args) {
    const controller = this.controllerModel.get(controllerName);
    if (controller.linkedOrb) {
      if (!controller.linkedOrb.hasCommand(commandName)) {
        throw new Error(`command : ${commandName} is not valid.`);
      }
      controller.linkedOrb.command(commandName, args);
    }
  }
}

