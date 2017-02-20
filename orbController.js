import ComponentBase from "./componentBase";

export default class OrbController extends ComponentBase {
  constructor(models, connector, spheroWS, defaultColor, collisionConfig) {
    super(models);

    this.spheroWS = spheroWS;
    this.connector = connector;
    this.defaultColor = defaultColor;
    this.collisionConfig = collisionConfig;

    this.subscribeModel("addedOrb", this.addOrbToModel);
    this.subscribeModel("removedOrb", this.removeOrbFromModel);
    this.subscribeModel("pingAll", this.setPingStateAll);
    this.subscribeModel("updateBattery", this.updateBattery);
    this.subscribeModel("replyPing", this.updatePingState);
    this.subscribeModel("checkBattery", this.checkBattery);
    this.subscribeModel("addOrb", this.addOrb);
    this.subscribeModel("removeOrb", this.removeOrb);
    this.subscribeModel("pingAll", this.pingAll);
  }

  addOrbToModel(name, orb) {
    if (this.orbModel.has(name)) {
      throw new Error(`追加しようとしたOrbは既に存在します。 : ${name}`);
    }
    this.orbModel.add(name, {
      orbName: name,
      port: orb.port,
      battery: null,
      link: "unlinked",
      pingState: "unchecked"
    });
    this.initializeOrb(orb);
  }

  removeOrbFromModel(name) {
    if (!this.orbModel.has(name)) {
      throw new Error(`削除しようとしたOrbは存在しません。 : ${name}`);
    }
    this.orbModel.remove(name);
  }

  setPingStateAll() {
    for (let orbName in this.orbModel.orbs) {
      this.orbModel.setPingState(orbName, "no reply");
    }
  }

  updateBattery(name, batteryState) {
    if (!this.orbModel.has(name)) {
      throw new Error("updateBattery しようとしましたが、orb が見つかりませんでした。 : " + name);
    }
    this.orbModel.setBattery(name, batteryState);
  }

  updatePingState(name) {
    if (!this.orbModel.has(name)) {
      throw new Error("updatePingState しようとしましたが、orb が見つかりませんでした。 : " + name);
    }
    this.orbModel.setPingState(name, "reply");
  }

  checkBattery() {
    const orbs = this.spheroWS.spheroServer.getOrb();
    for (let orbName in orbs) {
      if (!this.appModel.isTestMode) {
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
    }
  }

  pingAll() {
    const orbs = this.spheroWS.spheroServer.getOrb();
    for (let orbName in orbs) {
      orbs[orbName].instance.ping((err, data) => {
        if (!err) {
          this.publish("replyPing", orbName);
        } else {
          this.publish("log", "Ping error: \n" + err.toString(), "error");
        }
      });
    }
  }

  initializeOrb(orb) {
    if (!this.appModel.isTestMode) {
      const rawOrb = orb.instance;
      rawOrb.color(this.defaultColor);
      rawOrb.on("collision", () => {
        this.publishCollision(orb);
      });
    }
  }

  addOrb(name, port) {
    if (this.appModel.containsUUID(name)) {
      port = this.appModel.getUUID(name);
      console.log("changed!", port);
    }
    const rawOrb = this.spheroWS.spheroServer.makeRawOrb(name, port);
    if (!this.appModel.isTestMode) {
      if (!this.connector.isConnecting(port)) {
        this.appModel.resetError121Count();
        this.connector.connect(port, rawOrb.instance).then(() => {
          rawOrb.instance.setInactivityTimeout(9999999, function(err, data) {
            if (err) {
              throw new Error(err);
            }
            console.log("data: " + data);
          });

          this.publish("log", "connected orb.", "success");

          rawOrb.instance.configureCollisions(this.collisionConfig, () => {
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
    console.log("removing... : " + name);
    this.spheroWS.spheroServer.removeOrb(name);
  }

  publishCollision(orb) {
    this.publish("collision", orb);
  }
}
