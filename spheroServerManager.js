import controllerModel from "./model/controllerModel";
import spheroWebSocket from "sphero-websocket";
import ComponentBase from "./componentBase";

export default class SpheroServerManager extends ComponentBase {
  constructor(spheroWS) {
    super();

    this.spheroWS = spheroWS;
    this.spheroServer = this.spheroWS.spheroServer;

    this.spheroServer.events.on("addClient", this.publishAddClient.bind(this));
    this.spheroServer.events.on("removeClient", this.publishRemoveClient.bind(this));
    this.spheroServer.events.on("addOrb", this.publishAddedOrb.bind(this));
    this.spheroServer.events.on("removeOrb", this.publishRemovedOrb.bind(this));

  }

  publishAddClient(key, client) {
    this.publish("addClient", key, client);
  }

  publishRemoveClient(key) {
    this.publish("removeClient", key);
  }

  publishAddedOrb(name, orb) {
    this.publish("addedOrb", name, orb);
  }

  publishRemovedOrb(name) {
    this.publish("removedOrb", name);
  }

  publishCollision(orb) {
    this.publish("collision", orb);
  }

}
