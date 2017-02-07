import controllerModel from "./model/controllerModel";
import spheroWebSocket from "sphero-websocket";
import ComponentBase from "./componentBase";

export default class SpheroServerManager extends ComponentBase {
  constructor(spheroWS, isTestMode) {
    super();

    this.isTestMode = isTestMode;
    this.spheroWS = spheroWS;
    this.spheroServer = this.spheroWS.spheroServer;

    this.spheroServer.events.on("addClient", this.publishAddClient.bind(this));
    this.spheroServer.events.on("removeClient", this.publishRemoveClient.bind(this));
    this.spheroServer.events.on("addOrb", this.publishAddedOrb.bind(this));
    this.spheroServer.events.on("removeOrb", this.publishRemovedOrb.bind(this));

    this.subscribe("removeOrb", this.removeOrb);
  }

  publishAddClient(key, client) {
    this.publish("addClient", key, client);
  }

  publishRemoveClient(key) {
    this.publish("removeClient", key);
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
