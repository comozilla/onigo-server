import spheroWebSocket from "sphero-websocket";
import argv from "argv";
import config from "./config";
import VirtualSphero from "sphero-ws-virtual-plugin";
import Dashboard from "./dashboard";
import CommandRunner from "./commandRunner";
import Controller from "./controller";
import controllerModel from "./controllerModel";

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

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  controllerModel.add(key, client);
  client.on("arriveCustomMessage", (name, data, mesID) => {
    if (name === "requestName") {
      if (controllerModel.has(data)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        controllerModel.setName(key, data);
        client.sendCustomMessage("acceptName", data);
      }
    } else if (name === "useDefinedName") {
      if (!controllerModel.has(data)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        controllerModel.setName(key, data);
        client.sendCustomMessage("acceptName", data);
      }
    }
  });
});

spheroWS.spheroServer.events.on("removeClient", key => {
  if (controllerModel.hasInUnnamedClients(key)) {
    controllerModel.removeFromUnnamedClients(key);
  } else {
    controllerModel.removeClient(controllerModel.toName(key));
  }
  console.log(`removed Client: ${key}`);
});

controllerModel.on("named", (key, name, isNewName) => {
  const controller = controllerModel.get(name);
  const client = controller.client;

  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.sendCustomMessage("clientKey", key);

  if (isNewName) {
    controller.commandRunner.on("command", (commandName, args) => {
      if (client.linkedOrb !== null) {
        console.log(key);
        if (!client.linkedOrb.hasCommand(commandName)) {
          throw new Error(`command : ${commandName} is not valid.`);
        }
        client.linkedOrb.command(commandName, args);
      }
    });
    controller.on("hp", hp => {
      dashboard.updateHp(name, hp);
    });
  }

  client.on("arriveCustomMessage", (messageName, data, mesID) => {
    if (messageName === "commands") {
      if (typeof data.type === "string" && data.type === "built-in") {
        controller.commandRunner.setBuiltInCommands(data.command);
      } else {
        controller.get(name).commandRunner.setCommands(data);
      }
    }
  });
  client.on("link", () => {
    if (client.linkedOrb !== null) {
      controller.setLink(client.linkedOrb.name);
    } else {
      controller.setLink(null);
    }
    dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
  });
  if (controller.link !== null) {
    client.setLinkedOrb(spheroWS.spheroServer.getOrb(controller.link));
  }
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
      Object.keys(controllerModel.controllers).forEach(controllerName => {
        const controller = controllerModel.get(controllerName);
        if (gameState === "active" && !controller.isOni &&
            controller.client !== null &&
            orb.linkedClients.indexOf(controller.client.key) !== -1) {
          controller.setHp(controller.hp - 10);
        }
      })
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

dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(controllerModel.controllers).forEach(name => {
    const client = controllerModel.get(name).client;
    if (client !== null) {
      client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
    }
  });
});
dashboard.on("updateLink", (controllerName, orbName) => {
  if (orbName === null) {
    controllerModel.get(controllerName).client.unlink();
  } else {
    controllerModel.get(controllerName).client.setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
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
dashboard.on("oni", (name, enable) => {
  controllerModel.get(name).setIsOni(enable);
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
dashboard.on("resetHp", name => {
  controllerModel.get(name).setHp(100);
});

