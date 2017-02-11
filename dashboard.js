import express from "express";
import io from "socket.io";
import util from "util";
import controllerModel from "./model/controllerModel";
import appModel from "./model/appModel";
import orbModel from "./model/orbModel";
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
    this.subscribe("updateBattery", this.updateBattery);
    this.subscribe("replyPing", this.updatePingState);
    this.subscribe("log", this.log);
    this.subscribe("streamed", this.streamed);
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
        orbModel.toArray(),
        controllerModel.getUnnamedKeys());

      socketSubjects.forEach(subjectName => {
        this.socket.on(subjectName, (...data) => {
          this.publish(subjectName, ...data);
        });
      });

      this.socket.on("pingAll", this.publishPingAll.bind(this));
      socket.emit("updateOrbs", orbModel.toArray());
      socket.on("disconnect", () => {
        console.log("a dashboard removed.");
        this.socket = null;
      });
    }
  }
  publishPingAll() {
    this.publish("pingAll");
  }
  addOrb(name, orb) {
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", orbModel.toArray());
    }
  }

  removeOrb(name) {
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", orbModel.toArray());
    }
  }

  updateUnlinkedOrbs(unlinkedOrbs) {
    // タイミングがいろいろ難しいので、修正は後回し
    const unlinkedOrbNames = Object.keys(unlinkedOrbs);
    orbModel.getNames().forEach(orbName => {
      orbModel.setLink(
        orbName,
        unlinkedOrbNames.indexOf(orbName) >= 0 ? "unlinked" : "linked");
    });
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", orbModel.toArray());
    }
  }

  updateBattery() {
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", orbModel.toArray());
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
    if (!orbModel.has(orbName)) {
      throw new Error("updatePingState しようとしましたが、orb が見つかりませんでした。 : " + orbName);
    }
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", orbModel.toArray());
    }
  }
  streamed(orbName, time) {
    if (this.socket !== null) {
      this.socket.emit("streamed", orbName, this.formatTime(time));
    }
  }
  successReconnect(orbName) {
    if (this.socket !== null) {
      this.socket.emit("successReconnect", orbName);
    }
  }
  formatTime(time) {
    return ("0" + time.getHours()).slice(-2) + ":" +
      ("0" + time.getMinutes()).slice(-2) + ":" +
      ("0" + time.getSeconds()).slice(-2);
  }
}
