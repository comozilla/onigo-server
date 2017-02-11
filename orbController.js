import ComponentBase from "./componentBase";
import orbModel from "./model/orbModel";
import appModel from "./model/appModel";
import uuidModel from "./model/uuidModel";

export default class OrbController extends ComponentBase {
  constructor(connector, spheroWS) {
    super();

    this.spheroWS = spheroWS;
    this.connector = connector;

    this.subscribeModel("addedOrb", this.addOrbToModel);
    this.subscribeModel("removedOrb", this.removeOrbFromModel);
    this.subscribeModel("pingAll", this.setPingStateAll);
    this.subscribeModel("updateBattery", this.updateBattery);
    this.subscribeModel("replyPing", this.updatePingState);
    this.subscribeModel("checkBattery", this.checkBattery);
    this.subscribeModel("addOrb", this.addOrb);
    this.subscribeModel("removeOrb", this.removeOrb);
  }

  addOrbToModel(name, orb) {
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
    this.initializeOrb();
  }

  removeOrbFromModel(name) {
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

  checkBattery() {
    const orbs = this.spheroWS.spheroServer.getOrb();
    Object.keys(orbs).forEach(orbName => {
      if (!appModel.isTestMode) {
        orbs[orbName].instance.getPowerState((error, data) => {
          if (error) {
            throw new Error(error);
          } else {
            this.publish("updateBattery", orbName, data.batteryState);
          }
        });
      } else {
        this.publish("updateBattery", orbName, "test-battery");
      }
    });
  }

  initializeOrb(orb) {
    if (!appModel.isTestMode) {
      const rawOrb = orb.instance;
      rawOrb.color(this.defaultColor);
      rawOrb.detectCollisions();
      rawOrb.on("collision", () => {
        this.publishCollision(orb);
      });
    }
  }

  addOrb(name, port) {
    if (uuidModel.contains(name)) {
      port = uuidModel.getUUID(name);
      console.log("changed!", port);
    }
    const rawOrb = this.spheroWS.spheroServer.makeRawOrb(name, port);
    if (!appModel.isTestMode) {
      if (!this.connector.isConnecting(port)) {
        appModel.resetError121Count();
        this.connector.connect(port, rawOrb.instance).then(() => {
          rawOrb.instance.setInactivityTimeout(9999999, function(err, data) {
            if (err) {
              console.error(err);
            }
            console.log("data: " + data);
          });

          this.publish("log", "connected orb.", "success");

          rawOrb.instance.configureCollisions({
            meth: 0x01,
            xt: 0x7A,
            xs: 0xFF,
            yt: 0x7A,
            ys: 0xFF,
            dead: 100
          }, () => {
            this.publish("log", "configured orb.", "success");
            this.spheroWS.spheroServer.addOrb(rawOrb);
            rawOrb.instance.streamOdometer();
            rawOrb.instance.on("odometer", data => {
              this.publish("streamed", name, new Date());
            });
          });
        });
      } else {
        console.warn("Tryed to connect but a orb is connecting.");
      }
    } else {
      this.spheroWS.spheroServer.addOrb(rawOrb);
    }
  }

  removeOrb(name) {
    console.log("removing...");
    this.spheroWS.spheroServer.removeOrb(name);
  }
}
