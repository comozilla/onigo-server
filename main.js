const originalError = console.error;

let error121Count = 0;
console.error = function(message) {
  const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code 121/.exec(message);
  if (exec121Error !== null) {
    const port = exec121Error[2];
    if (connector.isConnecting(port)) {
      error121Count++;
      if (error121Count < 5) {
        dashboard.log(`Catched 121 error. Reconnecting... (${error121Count})`, "warning");
        connector.reconnect(port);
      } else {
        error121Count = 0;
        dashboard.log("Catched 121 error. But this is 5th try. Give up.", "warning");
        connector.giveUp(port);
      }
    } else {
      dashboard.log("Catched 121 error. But port is invalid.", "error");
    }
  } else {
    dashboard.log("Catched unknown error: \n" + message.toString(), "error");
  }
  originalError(message);
};

import spheroWebSocket from "sphero-websocket";
import argv from "argv";
import config from "./config";
import VirtualSphero from "sphero-ws-virtual-plugin";
import Dashboard from "./dashboard";
import CommandRunner from "./commandRunner";
import Controller from "./controller";
import controllerModel from "./controllerModel";
import RankingMaker from "./rankingMaker";
import Connector from "./connector";

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

const connector = new Connector();

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  controllerModel.add(key, client);
  client.on("arriveCustomMessage", (name, data, mesID) => {
    // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
    // requestNameとuseDefinedNameを分けている。
    // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
    // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
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
});

controllerModel.on("named", (key, name, isNewName) => {
  const controller = controllerModel.get(name);
  const client = controller.client;

  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("rankingState", rankingState);
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.sendCustomMessage("clientKey", key);

  if (isNewName) {
    controller.commandRunner.on("command", (commandName, args) => {
      const client = controller.client;
      console.log(client.linkedOrb);
      if (client.linkedOrb !== null) {
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
      controller.commandRunner.setCommands(data);
    }
  });
  client.on("link", () => {
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
  Object.keys(controllerModel.controllers).forEach(name => {
    const client = controllerModel.get(name).client;
    if (client !== null) {
      client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
    }
  });
});
dashboard.on("updateLink", (controllerName, orbName) => {
  const controller = controllerModel.get(controllerName);
  if (orbName === null) {
    controller.client.unlink();
  } else {
    controller.client.setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
  }
  controller.setLink(orbName);
});
dashboard.on("addOrb", (name, port) => {
  const rawOrb = spheroWS.spheroServer.makeRawOrb(name, port);
  if (!isTestMode) {
    if (!connector.isConnecting(port)) {
      error121Count = 0;
      connector.connect(port, rawOrb.instance).then(() => {
        error121Count = 0;
        spheroWS.spheroServer.addOrb(rawOrb);
        rawOrb.instance.streamOdometer();
        rawOrb.instance.on("odometer", (data) => {
          const time = new Date();
          dashboard.streamed(
            name,
            ("0" + time.getHours()).slice(-2) + ":" +
            ("0" + time.getMinutes()).slice(-2) + ":" +
            ("0" + time.getSeconds()).slice(-2));
        });
      });
    }
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
dashboard.on("pingAll", () => {
  const orbs = spheroWS.spheroServer.getOrb();
  Object.keys(orbs).forEach(orbName => {
    orbs[orbName].instance.ping((err, data) => {
      if (!err) {
        dashboard.updatePingState(orbName);
      } else {
        console.log(err);
        dashboard.log("Ping error: \n" + err.toString(), "error");
      }
    });
  });
});
dashboard.on("reconnect", name => {
  if (!isTestMode) {
    const orb = spheroWS.spheroServer.getOrb(name);
    if (orb !== null) {
      orb.instance.disconnect(() => {
        if (!connector.isConnecting(orb.port)) {
          error121Count = 0;
          connector.connect(orb.port, orb.instance).then(() => {
            error121Count = 0;
            dashboard.successReconnect(name);
          });
        }
      });
    }
  }
});

