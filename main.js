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
spheroWS.events.on("command", (requestKey, command, args) => {
  virtualSphero.command(command, args);
});

var dashboard = new Dashboard(config.dashboardPort);

var players = {};
var gameState = "inactive";
var availableCommandsCount = 1;

var clients = {};
spheroWS.spheroServer.events.on("addClient", (key, client) => {
  dashboard.addClient(key);
  clients[key] = client;
  players[key] = {
    hp: 100
  };
  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.on("arriveCustomMessage", (name, data, mesID) => {
    console.log("arrived customMes : " + name);
  });
});
spheroWS.spheroServer.events.on("removeClient", key => {
  dashboard.removeClient(key);
  console.log("removed Client: " + key);
  if (typeof clients[key] !== "undefined") {
    delete clients[key];
  }
});
spheroWS.spheroServer.events.on("addOrb", orb => {
  if (!isTestMode) {
    orb.detectCollisions();
    orb.on("collision", () => {
      orb.linkedClients.forEach(client => {
        players[client.key].hp -= 10;
        client.sendCustomMessage("hp", { hp: players[client.key].hp });
      });
    });
  }
});
dashboard.on("gameState", state => {
  gameState = state;
  Object.keys(clients).forEach(key => {
    clients[key].sendCustomMessage("gameState", { gameState: gameState });
  });
});
dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(clients).forEach(key => {
    clients[key].sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  });
});
dashboard.on("updateLink", (key, orbName) => {
  clients[key].setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
});

