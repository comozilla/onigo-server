import express from "express";
import io from "socket.io";
import {EventEmitter} from "events";
import util from "util";

let instance = null;

function Dashboard(port) {
  EventEmitter.call(this);

  if (instance !== null) {
    return instance;
  }

  this.app = express();
  this.server = require("http").Server(this.app);
  this.io = require("socket.io")(this.server);

  this.sockets = [];

  this.gameState = "inactive";
  this.availableCommandsCount = 1;

  // this.links[clientKey] = orbName
  this.links = {};
  // [name, name, name, ...]
  this.orbs = [];

  this.unlinkedOrbs = [];

  this.app.use(express.static("dashboard"));
  this.server.listen(port, () => {
    console.log("dashboard listening on port " + port);
  });

  this.io.on("connection", socket => {
    console.log("a dashboard connected.");
    this.sockets.push(socket);
    socket.emit(
        "defaultData",
        this.gameState,
        this.availableCommandsCount,
        this.links,
        this.orbs,
        this.unlinkedOrbs);
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
    socket.on("link", (key, orbName) => {
      this.links[key] = orbName;
      this.emit("updateLink", key, orbName);
    });
    socket.on("addOrb", (name, port) => {
      this.emit("addOrb", name, port);
    });
    socket.on("removeOrb", name => {
      this.emit("removeOrb", name);
    });
    socket.on("oni", (clientKey, enable) => {
      this.emit("oni", clientKey, enable);
    });
  });

  instance = this;
  return this;
}

Dashboard.prototype.addClient = function(key) {
  this.links[key] = null;
  this.sockets.forEach(socket => {
    socket.emit("addClient", key);
  });
};

Dashboard.prototype.removeClient = function(key) {
  if (typeof this.links[key] !== "undefined") {
    delete this.links[key];
    this.sockets.forEach(socket => {
      socket.emit("removeClient", key);
    });
  }
};

Dashboard.prototype.addOrb = function(name) {
  if (this.orbs.indexOf(name) >= 0) {
    throw new Error("追加しようとしたOrbは既に存在します。 : " + name);
  }
  this.orbs.push(name);
  this.sockets.forEach(socket => {
    socket.emit("updateOrbs", this.orbs);
  });
};

Dashboard.prototype.removeOrb = function(name) {
  if (this.orbs.indexOf(name) === -1) {
    throw new Error("削除しようとしたOrbは存在しません。 : " + name);
  }
  this.orbs.splice(this.orbs.indexOf(name), 1);
  this.sockets.forEach(socket => {
    socket.emit("updateOrbs", this.orbs);
  });
};

Dashboard.prototype.updateUnlinkedOrbs = function(unlinkedOrbs) {
  let editedUnlinkedOrbs;
  if (typeof unlinkedOrbs === "undefined") {
    editedUnlinkedOrbs = [];
  } else {
    editedUnlinkedOrbs = Object.keys(unlinkedOrbs).map(unlinkedOrbName => {
      return {
        orbName: unlinkedOrbName,
        port: unlinkedOrbs[unlinkedOrbName].port
      };
    });
  }
  this.unlinkedOrbs = editedUnlinkedOrbs;
  this.sockets.forEach(socket => {
    socket.emit("updateUnlinkedOrbs", editedUnlinkedOrbs);
  });
};

util.inherits(Dashboard, EventEmitter);

module.exports = Dashboard;

