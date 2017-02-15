const originalError = console.error;

import appModel from "./model/appModel";

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

const dashboard = new Dashboard(config.dashboardPort);
const connector = new Connector();

new VirtualSpheroManager(config.virtualSphero.wsPort);
new Scoreboard(config.scoreboardPort);
new SpheroServerManager(spheroWS, config.defaultColor);
new ControllerManager(config.defaultHp, config.damage);
new RankingMaker();
new OrbController(connector, spheroWS);

