var spheroWebSocket = require("sphero-websocket");
var argv = require("argv");
var config = require("./config");
var VirtualSphero = require("sphero-ws-virtual-plugin");

var opts = [
  { name: "test", type: "boolean" }
];
var isTestMode = argv.option(opts).run().options.test;

var spheroWS = spheroWebSocket(config.websocket, isTestMode);

var virtualSphero = new VirtualSphero(config.virtualSphero.wsPort);
spheroWS.events.on("command", function(requestKey, command, args) {
  virtualSphero.command(command, args);
});

var players = {};

spheroWS.events.on("addClient", function(key, client) {
  if (!isTestMode) {
    players[key] = {
      hp: 100
    }
    var orb = client.linkedOrb.instance;
    orb.detectCollisions();
    orb.on("collision", function() {
      players[key].hp -= 10;
      spheroWS.spheroServer.sendCustomMes(key, "hp", { hp: players[key].hp });
    });
  }
});

