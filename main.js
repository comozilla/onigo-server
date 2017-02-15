const originalError = console.error;

import appModel from "./appModel";

console.error = (message) => {
  const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code (121|1167)/.exec(message);
  if (exec121Error !== null) {
    const port = exec121Error[2];
    if (connector.isConnecting(port)) {
      appModel.incrementError121Count();
      if (appModel.error121Count < 5) {
        dashboard.log(`Catched 121 error. Reconnecting... (${appModel.error121Count})`, "warning");
        connector.reconnect(port);
      } else {
        appModel.resetError121Count();
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
import Dashboard from "./dashboard";
import Scoreboard from "./scoreboard";
import CommandRunner from "./commandRunner";
import Controller from "./controller";
import controllerModel from "./model/controllerModel";
import RankingMaker from "./rankingMaker";
import Connector from "./connector";
import publisher from "./publisher";
import SpheroServerManager from "./spheroServerManager";
import VirtualSpheroManager from "./virtualSpheroManager";
import ControllerManager from "./controllerManager";
import OrbController from "./orbController";

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;
appModel.isTestMode = isTestMode;

const spheroWS = spheroWebSocket(config.websocket, isTestMode);

new VirtualSpheroManager(config.virtualSphero.wsPort);

const dashboard = new Dashboard(config.dashboardPort);
dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());

const scoreboard = new Scoreboard(config.scoreboardPort);

new SpheroServerManager(spheroWS, config.defaultColor);
new ControllerManager(config.defaultHp, config.damage);

const rankingMaker = new RankingMaker();

const connector = new Connector();
new OrbController(connector, spheroWS);

publisher.subscribe("named", (author, key, name, isNewName) => {
  const controller = controllerModel.get(name);
  const client = controller.client;

  client.sendCustomMessage("gameState", appModel.gameState);
  client.sendCustomMessage("rankingState", appModel.rankingState);
  client.sendCustomMessage("availableCommandsCount", appModel.availableCommandsCount);
  client.sendCustomMessage("clientKey", key);

  if (isNewName) {
    publisher.subscribe("command", (author, key, commandName, args) => {
      if (controller.linkedOrb !== null) {
        if (!controller.linkedOrb.hasCommand(commandName)) {
          throw new Error(`command : ${commandName} is not valid.`);
        }
        controller.linkedOrb.command(commandName, args);
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
});

const orbs = spheroWS.spheroServer.getOrb();
Object.keys(orbs).forEach(orbName => {
  dashboard.addOrb(orbName, orbs[orbName].port);
});

publisher.subscribe("reconnect", (author, name) => {
  if (!isTestMode) {
    const orb = spheroWS.spheroServer.getOrb(name);
    if (orb !== null) {
      console.log("disconnecting...");
      orb.instance.disconnect(() => {
        console.log("disconnected!");
        dashboard.log("(reconnect) disconnected.", "success");
        if (!connector.isConnecting(orb.port)) {
          error121Count = 0;
          dashboard.log("(reconnect) wait 2 seconds.", "log");
          setTimeout(() => {
            dashboard.log("(reconnect) connecting...", "log");
            connector.connect(orb.port, orb.instance).then(() => {
              dashboard.log("(reconnect) connected", "success");
              dashboard.successReconnect(name);
            });
          }, 2000);
        }
      });
    }
  }
});

