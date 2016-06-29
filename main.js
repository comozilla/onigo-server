var spheroWebSocket = require("sphero-websocket");
var argv = require("argv");
var config = require("./config");
var VirtualSphero = require("sphero-ws-virtual-plugin");

var opts = [
  { name: "test", type: "boolean" }
];

var args = argv.option(opts).run();

var result = spheroWebSocket(config.websocket, args.options.test);

var virtualSphero = new VirtualSphero(config.virtualSphero.wsPort);


result.events.on("command", function(requestKey, command, args) {
  virtualSphero.command(command, args);
});
