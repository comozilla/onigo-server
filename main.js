import spheroWebSocket from "sphero-websocket";
import argv from "argv";
import config from "./config";
import VirtualSphero from "sphero-ws-virtual-plugin";
import Dashboard from "./dashboard";
import CommandRunner from "./commandRunner";

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;

const spheroWS = spheroWebSocket(config.websocket, isTestMode);

const virtualSphero = new VirtualSphero(config.virtualSphero.wsPort);
spheroWS.events.on("command", (requestKey, command, args) => {
  virtualSphero.command(command, args);
});

const dashboard = new Dashboard(config.dashboardPort);
dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());

let gameState = "inactive";
let availableCommandsCount = 1;

const controllers = {};

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  dashboard.addController(key);
  controllers[key] = {
    client: client,
    commandRunner: new CommandRunner(key),
    hp: 100,
    isOni: false
  };
  controllers[key].commandRunner.on("command", (commandName, args) => {
    if (client.linkedOrb !== null) {
      console.log(key);
      if (!client.linkedOrb.hasCommand(commandName)) {
        throw new Error(`command : ${commandName} is not valid.`);
      }
      client.linkedOrb.command(commandName, args);
    }
  });

  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.sendCustomMessage("oni", controllers[key].isOni);
  client.sendCustomMessage("hp", { hp: controllers[key].hp });
  client.sendCustomMessage("clientKey", key);
  client.on("arriveCustomMessage", (name, data, mesID) => {
    if (name === "commands") {
      if (typeof data.type === "string" && data.type === "built-in") {
        controllers[key].commandRunner.setBuiltInCommands(data.command);
      } else {
        controllers[key].commandRunner.setCommands(data);
      }
    }
  });
  client.on("link", () => {
    dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
  });
});
spheroWS.spheroServer.events.on("removeClient", key => {
  console.log(`removed Client: ${key}`);
  if (typeof controllers[key] !== "undefined") {
    delete controllers[key];
  }
  dashboard.removeController(key);
});

const orbs = spheroWS.spheroServer.getOrb();
Object.keys(orbs).forEach(orbName => {
  dashboard.addOrb(orbName, orbs[orbName].port);
});

spheroWS.spheroServer.events.on("addOrb", (name, orb) => {
  if (!isTestMode) {
    const rawOrb = orb.instance;
    rawOrb.detectCollisions();
    rawOrb.on("collision", () => {
      orb.linkedClients.forEach(key => {
        if (gameState === "active" && !controllers[key].isOni) {
          controllers[key].hp -= 10;
          controllers[key].client.sendCustomMessage("hp", { hp: controllers[key].hp });
        }
      });
    });
  }
  dashboard.addOrb(name, orb.port);
  dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
});
spheroWS.spheroServer.events.on("removeOrb", name => {
  dashboard.removeOrb(name);
});

dashboard.on("gameState", state => {
  gameState = state;
  Object.keys(controllers).forEach(key => {
    controllers[key].client.sendCustomMessage("gameState", { gameState: gameState });
  });
});

dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(controllers).forEach(key => {
    controllers[key].client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  });
});
dashboard.on("updateLink", (key, orbName) => {
  if (orbName === null) {
    controllers[key].client.unlink();
  } else {
    controllers[key].client.setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
  }
});
dashboard.on("addOrb", (name, port) => {
  const rawOrb = spheroWS.spheroServer.makeRawOrb(name, port);
  if (!isTestMode) {
    rawOrb.instance.connect(() => {
      spheroWS.spheroServer.addOrb(rawOrb);
    });
  } else {
    spheroWS.spheroServer.addOrb(rawOrb);
  }
});
dashboard.on("removeOrb", name => {
  spheroWS.spheroServer.removeOrb(name);
});
dashboard.on("oni", (key, enable) => {
  controllers[key].isOni = enable;
  controllers[key].client.sendCustomMessage("oni", enable);
});
dashboard.on("checkBattery", () => {
  const orbs = spheroWS.spheroServer.getOrb();
  Object.keys(orbs).forEach(orbName => {
    orbs[orbName].instance.getPowerState((error, data) => {
      if (error) {
        throw new Error(error);
      } else {
        dashboard.updateBattery(orbName, data.batteryState);
      }
    });
  });
});

