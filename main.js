var spheroWebSocket = require("sphero-websocket");
var argv = require("argv");
var config = require("./config");
var VirtualSphero = require("sphero-ws-virtual-plugin");
var Dashboard = require("./dashboard");

var opts = [
  { name: "test", type: "boolean" }
];
var isTestMode = argv.option(opts).run().options.test;

var spheroWS = spheroWebSocket(config.websocket, isTestMode);

var virtualSphero = new VirtualSphero(config.virtualSphero.wsPort);
spheroWS.events.on("command", function(requestKey, command, args) {
  virtualSphero.command(command, args);
});

var dashboard = new Dashboard(config.dashboardPort);

var players = {};
var gameState = "inactive";
var availableCommandsCount = 6;

var clients = {};
spheroWS.events.on("addClient", function(key, client) {
  clients[key] = client;
  if (!isTestMode) {
    players[key] = {
      hp: 100
    }
    var orb = client.linkedOrb.instance;
    orb.detectCollisions();
    orb.on("collision", function() {
      players[key].hp -= 10;
      client.sendCustomMessage("hp", { hp: players[key].hp });
    });
  }
  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.on("arriveCustomMessage", (name, data, mesID) => {
    console.log("arrived customMes : " + name);
  });
});
spheroWS.events.on("removeClient", function(key) {
  console.log("removed Client: " + key);
  if (typeof clients[key] !== "undefined") {
    delete clients[key];
  }
});
dashboard.on("gameState", (gameState) => {
  gameState = gameState;
  Object.keys(clients).forEach(key => {
    clients[key].sendCustomMessage("gameState", { gameState: gameState });
  });
});


