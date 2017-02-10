import ComponentBase from "./componentBase";
import orbModel from "./model/orbModel";

export default class OrbController extends ComponentBase {
  constructor() {
    super();

    this.subscribeModel("addedOrb", this.addOrb);
    this.subscribeModel("removedOrb", this.removeOrb);
    this.subscribeModel("pingAll", this.setPingStateAll);
    this.subscribeModel("updateBattery", this.updateBattery);
    this.subscribeModel("replyPing", this.updatePingState);
  }

  addOrb(name, orb) {
    if (orbModel.has(name)) {
      throw new Error(`追加しようとしたOrbは既に存在します。 : ${name}`);
    }
    orbModel.add(name, {
      orbName: name,
      port: orb.port,
      battery: null,
      link: "unlinked",
      pingState: "unchecked"
    });
  }

  removeOrb(name) {
    if (!orbModel.has(name)) {
      throw new Error(`削除しようとしたOrbは存在しません。 : ${name}`);
    }
    orbModel.remove(name);
  }

  setPingStateAll() {
    Object.keys(orbModel.orbs).forEach(orbName => {
      orbModel.setPingState(orbName, "no reply");
    });
  }

  updateBattery(name, batteryState) {
    if (!orbModel.has(name)) {
      throw new Error("updateBattery しようとしましたが、orb が見つかりませんでした。 : " + name);
    }
    orbModel.setBattery(name, batteryState);
  }

  updatePingState(name) {
    if (!orbModel.has(name)) {
      throw new Error("updatePingState しようとしましたが、orb が見つかりませんでした。 : " + name);
    }
    orbModel.setPingState(name, "reply");
  }
}
