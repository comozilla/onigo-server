var spheroWebSocket = require("sphero-websocket");
var argv = require("argv");
var config = require("./config");
var VirtualSphero = require("sphero-ws-virtual-plugin");
var Dashboard = require("./dashboard");
var CommandRunner = require("./commandRunner");

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

var gameState = "inactive";
var availableCommandsCount = 6;

var clients = {};
var players = {};
// key: {commands, timeoutId, playingIndex}
var commands = {};

spheroWS.events.on("addClient", function(key, client) {
  clients[key] = {
    client: client,
    commandRunner: new CommandRunner(key)
  };
  players[key] = {
    hp: 100
  };
  if (!isTestMode) {
    var orb = client.linkedOrb.instance;
    orb.detectCollisions();
    orb.on("collision", function() {
      players[key].hp -= 10;
      client.sendCustomMessage("hp", { hp: players[key].hp });
    });
  }

  clients[key].commandRunner.on("command", function(commandName, args) {
    if (!client.linkedOrb.hasCommand(commandName)) {
      throw new Error("command : " + commandName + " is not valid.");
    }
    client.linkedOrb.command(commandName, args);
  });

  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.on("arriveCustomMessage", (name, data, mesID) => {
    if (name === "commands") {
      if (typeof data.type === "string" && data.type === "built-in") {
        clients[key].commandRunner.setBuiltInCommands(data.command);
      } else {
        clients[key].commandRunner.setCommands(data);
      }
    }
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
    clients[key].client.sendCustomMessage("gameState", { gameState: gameState });
  });
});

