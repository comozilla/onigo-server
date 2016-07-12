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
spheroWS.events.on("command", (requestKey, command, args) => {
  virtualSphero.command(command, args);
});

var dashboard = new Dashboard(config.dashboardPort);

var gameState = "inactive";
var availableCommandsCount = 1;

var clients = {};

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  dashboard.addClient(key);
  clients[key] = {
    client: client,
    commandRunner: new CommandRunner(key),
    hp: 100
  };
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
spheroWS.spheroServer.events.on("removeClient", key => {
  console.log("removed Client: " + key);
  if (typeof clients[key] !== "undefined") {
    delete clients[key];
  }
  dashboard.removeClient(key);
});

Object.keys(spheroWS.spheroServer.orbs).forEach(orbNames => {
  dashboard.addOrb(orbNames);
});

spheroWS.spheroServer.events.on("addOrb", (name, orb) => {
  if (!isTestMode) {
    orb.detectCollisions();
    orb.on("collision", () => {
      orb.linkedClients.forEach(client => {
        clients[client.key].hp -= 10;
        client.sendCustomMessage("hp", { hp: clients[client.key].hp });
      });
    });
  }
  dashboard.addOrb(name);
});
spheroWS.spheroServer.events.on("removeOrb", name => {
  dashboard.removeOrb(name);
});

dashboard.on("gameState", state => {
  gameState = state;
  Object.keys(clients).forEach(key => {
    clients[key].client.sendCustomMessage("gameState", { gameState: gameState });
  });
});

dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(clients).forEach(key => {
    clients[key].client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  });
});
dashboard.on("updateLink", (key, orbName) => {
  if (orbName === null) {
    clients[key].unlink();
  } else {
    clients[key].setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
  }
});

