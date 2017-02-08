import express from "express";
import io from "socket.io";
import util from "util";
import OrbMap from "./util/orbMap";
import controllerModel from "./model/controllerModel";
import appModel from "./model/appModel";
import { Server as createServer } from "http";
import socketIO from "socket.io";
import ComponentBase from "./componentBase";

const socketSubjects = [
  "gameState",
  "rankingState",
  "availableCommandsCount",
  "link",
  "addOrb",
  "removeOrb",
  "orbReconnect",
  "oni",
  "checkBattery",
  "resetHp",
  "pingall",
  "color"
];

export default class Dashboard extends ComponentBase {
  constructor(port) {
    super();

    this.app = express();
    this.server = createServer(this.app);
    this.io = socketIO(this.server);
    this.io.origins(`localhost:${port}`);

    this.socket = null;

    this.orbMap = new OrbMap();

    this.app.use(express.static("dashboard"));
    this.server.listen(port, () => {
      console.log(`dashboard is listening on port ${port}`);
    });

    this.io.on("connection", this.initializeConnection.bind(this));

    this.subscribe("addedUnnamed", (key, client) => {
      if (this.socket !== null) {
        this.socket.emit("addUnnamed", key);
      }
    });
    this.subscribe("named", (key, name) => {
      if (this.socket !== null) {
        this.socket.emit("named", key, name, controllerModel.get(name).getStates());
      }
    });
    this.subscribe("removedUnnamed", key => {
      if (this.socket !== null) {
        this.socket.emit("removeUnnamed", key);
      }
    });
    this.subscribe("removedClient", name => {
      if (this.socket !== null) {
        this.socket.emit("removeClient", name);
      }
    });

    this.subscribe("addedOrb", this.addOrb);
    this.subscribe("removedOrb", this.removeOrb);
  }
  initializeConnection(socket) {
    if (this.socket !== null) {
      this.socket.disconnect();
      console.log("a dashboard rejected.");
    } else {
      console.log("a dashboard connected.");
      this.socket = socket;
      this.log("accepted a dashboard.", "success");
      socket.emit(
        "defaultData",
        appModel.gameState,
        appModel.availableCommandsCount,
        controllerModel.getAllStates(),
        this.orbMap.toArray(),
        controllerModel.getUnnamedKeys());

      socketSubjects.forEach(subjectName => {
        this.socket.on(subjectName, (...data) => {
          this.publish(subjectName, ...data);
        });
      });

      this.socket.on("pingAll", this.publishPingAll.bind(this));
      socket.emit("updateOrbs", this.orbMap.toArray());
      socket.on("disconnect", () => {
        console.log("a dashboard removed.");
        this.socket = null;
      });
    }
  }
  publishPingAll() {
    this.publish("pingAll");
    Object.keys(this.orbMap.orbs).forEach(orbName => {
      this.orbMap.setPingState(orbName, "no reply");
    });
  }
  addOrb(name, orb) {
    if (this.orbMap.has(name)) {
      throw new Error(`追加しようとしたOrbは既に存在します。 : ${name}`);
    }
    this.orbMap.set(name, {
      orbName: name,
      port: orb.port,
      battery: null,
      link: "unlinked",
      pingState: "unchecked"
    });
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbMap.toArray());
    }
  }

  removeOrb(name) {
    if (!this.orbMap.has(name)) {
      throw new Error(`削除しようとしたOrbは存在しません。 : ${name}`);
    }
    this.orbMap.remove(name);
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbMap.toArray());
    }
  }

  updateUnlinkedOrbs(unlinkedOrbs) {
    const unlinkedOrbNames = Object.keys(unlinkedOrbs);
    this.orbMap.getNames().forEach(orbName => {
      this.orbMap.setLink(
        orbName,
        unlinkedOrbNames.indexOf(orbName) >= 0 ? "unlinked" : "linked");
    });
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbMap.toArray());
    }
  }
  updateBattery(orbName, batteryState) {
    const orbNameItem = this.orbMap.get(orbName);
    if (typeof orbNameItem === "undefined") {
      throw new Error("updateBattery しようとしましたが、orb が見つかりませんでした。 : " + orbName);
    }
    orbNameItem.battery = batteryState;
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbMap.toArray());
    }
  }
  updateHp(controllerKey, hp) {
    if (this.socket !== null) {
      this.socket.emit("hp", controllerKey, hp);
    }
  }
  log(logText, logType) {
    if (this.socket !== null) {
      this.socket.emit("log", logText, logType);
    }
  }
  updatePingState(orbName) {
    if (!this.orbMap.has(orbName)) {
      throw new Error("updatePingState しようとしましたが、orb が見つかりませんでした。 : " + orbName);
    }
    this.orbMap.setPingState(orbName, "reply");
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbMap.toArray());
    }
  }
  streamed(orbName, time) {
    if (this.socket !== null) {
      this.socket.emit("streamed", orbName, time);
    }
  }
  successReconnect(orbName) {
    if (this.socket !== null) {
      this.socket.emit("successReconnect", orbName);
    }
  }
}
