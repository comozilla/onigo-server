import express from "express";
import io from "socket.io";
import util from "util";
import { Server as createServer } from "http";
import socketIO from "socket.io";
import ComponentBase from "./componentBase";

const socketSubjects = [
  "gameState",
  "rankingState",
  "availableCommandsCount",
  "addOrb",
  "removeOrb",
  "oni",
  "checkBattery",
  "resetHp",
  "pingall",
  "color"
];

export default class Dashboard extends ComponentBase {
  constructor(models, port) {
    super(models);

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

    this.subscribe("addedUnknown", (key, client) => {
      if (this.socket !== null) {
        this.socket.emit("addUnnamed", key);
      }
    });
    this.subscribe("addedClient", (name) => {
      if (this.socket !== null) {
        const controller = this.controllerModel.get(name);
        this.socket.emit("named", controller.client.key, name, controller.getStates());
      }
    });
    this.subscribe("removedUnknown", key => {
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
    this.subscribe("log", this.logAsClientMessage);
    this.subscribe("streamed", this.streamed);
    this.subscribe("updateLink", this.updateUnlinkedOrbs);
    this.subscribe("addOrb", this.updateUnlinkedOrbs);
    this.subscribe("hp", this.updateHp);
  }
  initializeConnection(socket) {
    if (this.socket !== null) {
      this.socket.disconnect();
      console.log("a dashboard rejected.");
    } else {
      console.log("a dashboard connected.");
      this.socket = socket;
      this.logAsClientMessage("accepted a dashboard.", "success");
      socket.emit(
        "defaultData",
        this.appModel.gameState,
        this.appModel.availableCommandsCount,
        this.controllerModel.getAllStates(),
        this.orbModel.toArray(),
        this.controllerModel.getUnnamedKeys());

      socketSubjects.forEach(subjectName => {
        this.socket.on(subjectName, (...data) => {
          this.publish(subjectName, ...data);
        });
      });

      // 引数は渡さないので別の方法で結びつける
      this.socket.on("pingAll", () => {
        this.publishPingAll();
      });

      // link -> updateLink と名前が変わるので、別の方法で結びつける
      this.socket.on("link", (controllerName, orbName) => {
        this.publishUpdateLink(controllerName, orbName);
      });

      socket.emit("updateOrbs", this.orbModel.toArray());
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
      this.socket.emit("updateOrbs", this.orbModel.toArray());
    }
  }

  removeOrb(name) {
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbModel.toArray());
    }
  }

  updateUnlinkedOrbs() {
    const unlinkedOrbs = this.orbModel.getUnlinkedOrbs();
    this.orbModel.getNames().forEach(orbName => {
      this.orbModel.setLink(
        orbName,
        unlinkedOrbs[orbName] ? "unlinked" : "linked");
    });
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbModel.toArray());
    }
  }

  updateBattery() {
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbModel.toArray());
    }
  }
  updateHp(name, hp) {
    if (this.socket !== null) {
      this.socket.emit("hp", name, hp);
    }
  }
  logAsClientMessage(logText, logType) {
    if (this.socket !== null) {
      this.socket.emit("log", logText, logType);
    }
  }
  updatePingState(orbName) {
    if (!this.orbModel.has(orbName)) {
      throw new Error("updatePingState しようとしましたが、orb が見つかりませんでした。 : " + orbName);
    }
    if (this.socket !== null) {
      this.socket.emit("updateOrbs", this.orbModel.toArray());
    }
  }
  streamed(orbName, time) {
    if (this.socket !== null) {
      this.socket.emit("streamed", orbName, this.formatTime(time));
    }
  }
  formatTime(time) {
    return ("0" + time.getHours()).slice(-2) + ":" +
      ("0" + time.getMinutes()).slice(-2) + ":" +
      ("0" + time.getSeconds()).slice(-2);
  }
  publishUpdateLink(controllerName, orbName) {
    this.publish("updateLink", controllerName, orbName);
  }
}
