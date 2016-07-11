var express = require("express");
var io = require("socket.io");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var instance = null;

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

  this.app.use(express.static("dashboard"));
  this.server.listen(port, () => {
    console.log("dashboard listening on port " + port);
  });

  this.io.on("connection", socket => {
    console.log("a dashboard connected.");
    this.sockets.push(socket);
    socket.emit("defaultData", this.gameState, this.availableCommandsCount);
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
    socket.on("updateLink", (key, orbName) => {
      this.links[key] = orbName;
      this.emit("updateLink", key, orbName);
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
  delete this.links[key];
  this.sockets.forEach(socket => {
    socket.emit("removeClient", key);
  });
};

util.inherits(Dashboard, EventEmitter);

module.exports = Dashboard;

