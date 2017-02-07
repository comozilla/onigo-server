import ComponentBase from "./componentBase";
import VirtualSphero from "sphero-ws-virtual-plugin";
import controllerModel from "./model/controllerModel";

export default class VirtualSpheroManager extends ComponentBase {
  constructor(port) {
    super();
    this.virtualSphero = new VirtualSphero(port);

    this.subscribe("removedController", this.removeSphero);
  }

  removeSphero(key) {
    const name = controllerModel.toName(key);
    this.virtualSphero.removeSphero(name);
  }
}
