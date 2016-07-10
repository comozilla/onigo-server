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

  var app = require("express")();
  var server = require("http").Server(app);
  var io = require("socket.io")(server);

  var gameState = "inactive";
  var availableCommandsCount = 1;

  app.use(express.static("dashboard"));
  server.listen(port, () => {
    console.log("dashboard listening on port " + port);
  });

  io.on("connection", socket => {
    console.log("a dashboard connected.");
    socket.emit("defaultData", gameState, availableCommandsCount);
    socket.on("gameState", state => {
      if (/active|inactive/.test(state)) {
        gameState = state;
        this.emit("gameState", state);
      }
    });
    socket.on("availableCommandsCount", count => {
      if (count >= 1 && count <= 6) {
        availableCommandsCount = count;
        this.emit("availableCommandsCount", count);
      }
    });
  });

  instance = this;
  return this;
}

util.inherits(Dashboard, EventEmitter);

module.exports = Dashboard;

