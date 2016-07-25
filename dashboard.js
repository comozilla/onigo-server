import express from "express";
import io from "socket.io";
import { EventEmitter } from "events";
import util from "util";
import OrbMap from "./util/orbMap";
import controllerModel from "./controllerModel";

let instance = null;

function Dashboard(port) {
  EventEmitter.call(this);

  if (instance !== null) {
    return instance;
  }

  this.app = express();
  this.server = require("http").Server(this.app);
  this.io = require("socket.io")(this.server);
  this.io.origins(`localhost:${port}`);

  this.socket = null;

  this.gameState = "inactive";
  this.availableCommandsCount = 1;

  this.orbMap = new OrbMap();

  this.app.use(express.static("dashboard"));
  this.server.listen(port, () => {
    console.log(`dashboard is listening on port ${port}`);
  });

  this.io.on("connection", socket => {
    if (this.socket !== null) {
      socket.disconnect();
      console.log("a dashboard rejected.");
    } else {
      console.log("a dashboard connected.");
      this.socket = socket;
      socket.emit(
          "defaultData",
          this.gameState,
          this.availableCommandsCount,
          controllerModel.getAllStates(),
          this.orbMap.toArray(),
          controllerModel.getUnnamedKeys());
      socket.on("gameState", state => {
        if (/active|inactive/.test(state)) {
          this.gameState = state;
          this.emit("gameState", state);
        }
      });
      socket.on("availableCommandsCount", count => {
        if (count >= 1 && count <= 6) {
          this.availableCommandsCount = count;
          this.emit("availableCommandsCount", count);
        }
      });
      socket.on("link", (name, orbName) => {
        this.emit("updateLink", name, orbName);
      });
      socket.on("addOrb", (name, port) => {
        this.emit("addOrb", name, port);
      });
      socket.on("removeOrb", name => {
        this.emit("removeOrb", name);
      });
      socket.on("oni", (name, enable) => {
        this.emit("oni", name, enable);
      });
      socket.on("checkBattery", () => {
        this.emit("checkBattery");
      });
      socket.on("disconnect", () => {
        console.log("a dashboard removed.");
        this.socket = null;
      });
      socket.on("resetHp", name => {
        this.emit("resetHp", name);
      });
    }
  });

  controllerModel.on("add", (key, client) => {
    if (this.socket !== null) {
      this.socket.emit("addUnnamed", key);
    }
  });
  controllerModel.on("named", (key, name) => {
    if (this.socket !== null) {
      this.socket.emit("named", key, name, controllerModel.get(name).getStates());
    }
  });
  controllerModel.on("removeUnnamed", key => {
    if (this.socket !== null) {
      this.socket.emit("removeUnnamed", key);
    }
  });
  controllerModel.on("removeClient", name => {
    if (this.socket !== null) {
      this.socket.emit("removeClient", name);
    }
  });

  instance = this;
  return this;
}

Dashboard.prototype.addOrb = function(name, port) {
  if (this.orbMap.has(name)) {
    throw new Error(`追加しようとしたOrbは既に存在します。 : ${name}`);
  }
  this.orbMap.set(name, {
    orbName: name,
    port,
    battery: null,
    link: "unlinked"
  });
  if (this.socket !== null) {
    this.socket.emit("updateOrbs", this.orbMap.toArray());
  }
};

Dashboard.prototype.removeOrb = function(name) {
  if (!this.orbMap.has(name)) {
    throw new Error(`削除しようとしたOrbは存在しません。 : ${name}`);
  }
  this.orbMap.remove(name);
  if (this.socket !== null) {
    this.socket.emit("updateOrbs", this.orbMap.toArray());
  }
};

Dashboard.prototype.updateUnlinkedOrbs = function(unlinkedOrbs) {
  const unlinkedOrbNames = Object.keys(unlinkedOrbs);
  this.orbMap.getNames().forEach(orbName => {
    this.orbMap.setLink(
      orbName,
      unlinkedOrbNames.indexOf(orbName) >= 0 ? "unlinked" : "linked");
  });
  if (this.socket !== null) {
    this.socket.emit("updateOrbs", this.orbMap.toArray());
  }
};

Dashboard.prototype.updateBattery = function(orbName, batteryState) {
  const orbNameItem = this.orbMap.get(orbName);
  if (typeof orbNameItem === "undefined") {
    throw new Error("updateBattery しようとしましたが、orb が見つかりませんでした。 : " + orbName);
  }
  orbNameItem.battery = batteryState;
  if (this.socket !== null) {
    this.socket.emit("updateOrbs", this.orbMap.toArray());
  }
};

Dashboard.prototype.updateHp = function(controllerKey, hp) {
  if (this.socket !== null) {
    this.socket.emit("hp", controllerKey, hp);
  }
}

util.inherits(Dashboard, EventEmitter);

module.exports = Dashboard;
