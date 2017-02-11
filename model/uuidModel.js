import ComponentBase from "../componentBase";
//import noble from "noble";
import appModel from "./appModel";

export class UUIDModel extends ComponentBase {
  constructor() {
    super();

    this.nameAndUUIDs = {};

    if (!appModel.isTestMode) {
 /*     noble.on("stateChange", state => {
        if (state === "poweredOn") {
          noble.startScanning();
        }
      });

      noble.on("discover", peripheral => {
        this.setName(peripheral.uuid, peripheral.advertisement.localName);
      }); */
    }
  }
  setName(uuid, name) {
    console.log(`name: ${name}, uuid: ${uuid}`);
    this.nameAndUUIDs[name] = uuid;
  }
  contains(name) {
    return typeof this.nameAndUUIDs[name] !== "undefined";
  }
  getUUID(name) {
    if (!this.contains(name)) {
      throw new Error("The name's uuid was not found. name: " + name);
    }
    return this.nameAndUUIDs[name];
  }
}

export default new UUIDModel();
