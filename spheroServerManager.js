import controllerModel from "./controllerModel";
import spheroWebSocket from "sphero-websocket";
import ComponentBase from "./componentBase";

export default class SpheroServerManager extends ComponentBase {
  constructor(spheroWS, isTestMode) {
    super();

    this.isTestMode = isTestMode;
    this.spheroWS = spheroWS;
    this.spheroServer = this.spheroWS.spheroServer;

    this.spheroServer.events.on("addClient", this.addClient.bind(this));
    this.spheroServer.events.on("removeClient", this.removeClient.bind(this));
    this.spheroServer.events.on("addOrb", this.publishAddedOrb.bind(this));
    this.spheroServer.events.on("removeOrb", this.publishRemovedOrb.bind(this));

    this.subscribe("removeOrb", this.removeOrb);
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

  initializeOrb(orb) {
    const rawOrb = orb.instance;
    rawOrb.color("white");
    rawOrb.detectCollisions();
    rawOrb.on("collision", () => {
      this.publishCollision(orb);
    });
  }

  publishAddedOrb(name, orb) {
    if (!this.isTestMode) {
      this.initializeOrb(orb);
    }
    this.publish("addedOrb", name, orb);
  }

  publishRemovedOrb(name) {
    this.publish("removeOrb", name);
  }

  publishCollision(orb) {
    this.publish("collision", orb);
  }

  removeOrb(name) {
    console.log("removing...");
    this.spheroServer.removeOrb(name);
  }
}
