import ComponentBase from "./componentBase";
import VirtualSphero from "sphero-ws-virtual-plugin";
import controllerModel from "./model/controllerModel";

export default class VirtualSpheroManager extends ComponentBase {
  constructor(port) {
    super();
    this.virtualSphero = new VirtualSphero(port);

    this.subscribe("named", this.addSphero);
    this.subscribe("removedController", this.removeSphero);
    this.subscribe("command", this.command);
  }

  addSphero(key, name, isNewName) {
    this.virtualSphero.addSphero(name);
  }

  removeSphero(key) {
    const name = controllerModel.toName(key);
    this.virtualSphero.removeSphero(name);
  }

  command(key, commandName, args) {
    const name = controllerModel.toName(key);
    this.virtualSphero.command(name, commandName, args);
  }
}
