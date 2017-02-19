const originalError = console.error;

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
import OrbModel from "./model/orbModel";
import AppModel from "./model/appModel";
import ControllerModel from "./model/controllerModel";
import UUIDModel from "./model/uuidModel";

const models = {
  appModel: new AppModel(),
  orbModel: new OrbModel(),
  controllerModel: new ControllerModel(),
};

console.error = (message) => {
  const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code (121|1167)/.exec(message);
  if (exec121Error !== null) {
    const port = exec121Error[2];
    if (connector.isConnecting(port)) {
      models.appModel.incrementError121Count();
      if (models.appModel.error121Count < 5) {
        dashboard.log(`Catched 121 error. Reconnecting... (${models.appModel.error121Count})`, "warning");
        connector.reconnect(port);
      } else {
        models.appModel.resetError121Count();
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

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;
models.appModel.isTestMode = isTestMode;

models.uuidModel = new UUIDModel(models);

const spheroWS = spheroWebSocket(config.websocket, isTestMode);
models.orbModel.setSpheroWS(spheroWS);

const dashboard = new Dashboard(models, config.dashboardPort);
const connector = new Connector();

new VirtualSpheroManager(models, config.virtualSphero.wsPort);
new Scoreboard(models, config.scoreboardPort);
new SpheroServerManager(models, spheroWS);
new ControllerManager(models, config.defaultHp, config.damage);
new RankingMaker(models);
new OrbController(models, connector, spheroWS, config.defaultColor, config.collision);

