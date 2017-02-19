import ComponentBase from "../componentBase";

export default class UUIDModel extends ComponentBase {
  constructor(models) {
    super(models);

    this.nameAndUUIDs = {};

    if (!this.appModel.isTestMode) {
      // noble は、非対応環境だと、import した直後にエラーが発生してしまう
      // そのため、require を使ってこのタイミングで読み込むしかない
      // SystemJS とか使うともっとかっこいいかも

      const noble = require("noble");
      noble.on("stateChange", state => {
        if (state === "poweredOn") {
          noble.startScanning();
        }
      });
      noble.on("discover", peripheral => {
        this.setName(peripheral.uuid, peripheral.advertisement.localName);
      });
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

