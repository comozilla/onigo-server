import spheroWebSocket from "sphero-websocket";
import argv from "argv";
import config from "./config";
import VirtualSphero from "sphero-ws-virtual-plugin";
import Dashboard from "./dashboard";
import CommandRunner from "./commandRunner";
import Controller from "./controller";
import controllerModel from "./controllerModel";
import RankingMaker from "./rankingMaker";

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
let rankingState = "hide";
let availableCommandsCount = 1;

const rankingMaker = new RankingMaker();

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  controllerModel.add(key, client);
  dashboard.addController(key);
  controllerModel.get(key).commandRunner.on("command", (commandName, args) => {
    if (client.linkedOrb !== null) {
      console.log(key);
      if (!client.linkedOrb.hasCommand(commandName)) {
        throw new Error(`command : ${commandName} is not valid.`);
      }
      client.linkedOrb.command(commandName, args);
    }
  });

  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("rankingState", rankingState);
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.sendCustomMessage("clientKey", key);
  client.on("arriveCustomMessage", (name, data, mesID) => {
    if (name === "commands") {
      if (typeof data.type === "string" && data.type === "built-in") {
        controllerModel.get(key).commandRunner.setBuiltInCommands(data.command);
      } else {
        controllerModel.get(key).commandRunner.setCommands(data);
      }
    }
  });
  client.on("link", () => {
    if (client.linkedOrb !== null) {
      controllerModel.get(key).setLink(client.linkedOrb.name);
    } else {
      controllerModel.get(key).setLink(null);
    }
    dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
  });
  controllerModel.get(key).on("hp", hp => {
    dashboard.updateHp(key, hp);
  });
});
spheroWS.spheroServer.events.on("removeClient", key => {
  controllerModel.remove(key);
  console.log(`removed Client: ${key}`);
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
        if (gameState === "active" && !controllerModel.get(key).isOni) {
          controllerModel.get(key).setHp(controllerModel.get(key).hp - 10);
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
  Object.keys(controllerModel.controllers).forEach(key => {
    controllerModel.get(key).client.sendCustomMessage("gameState", { gameState: gameState });
  });
});
dashboard.on("rankingState", state => {
  const controllerKeys = Object.keys(controllerModel.controllers);
  rankingState = state;
  controllerKeys.forEach(key => {
    controllerModel.get(key).client.sendCustomMessage("rankingState", state);
  });
  if (state === "show") {
    const ranking = rankingMaker.make(controllerModel.controllers);
    controllerKeys.forEach(key => {
      controllerModel.get(key).client.sendCustomMessage("ranking", ranking);
    });
  }
});

dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(controllerModel.controllers).forEach(key => {
    controllerModel.get(key).client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  });
});
dashboard.on("updateLink", (key, orbName) => {
  if (orbName === null) {
    controllerModel.get(key).client.unlink();
  } else {
    controllerModel.get(key).client.setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
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
  controllerModel.get(key).setIsOni(enable);
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
dashboard.on("resetHp", key => {
  controllerModel.get(key).setHp(100);
});

