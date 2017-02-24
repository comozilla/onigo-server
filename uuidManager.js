import ComponentBase from "./componentBase";

export default class UUIDManager extends ComponentBase {
  constructor(models, noble) {
    super(models);
    this.noble = noble;

    if (!this.appModel.isTestMode && this.noble) {
      this.noble.on("stateChange", state => {
        if (state === "poweredOn") {
          this.noble.startScanning();
        }
      });
      this.noble.on("discover", peripheral => {
        this.publish("setNameOfUUID", peripheral.uuid, peripheral.advertisement.localName);
      });
    }
  }
}

