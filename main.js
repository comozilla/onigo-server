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
import UUIDManager from "./uuidManager";

const models = {
  appModel: new AppModel(),
  orbModel: new OrbModel(),
  controllerModel: new ControllerModel()
};

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;
models.appModel.isTestMode = isTestMode;

const spheroWS = spheroWebSocket(config.websocket, isTestMode);
models.orbModel.setSpheroWS(spheroWS);

const connector = new Connector(models);

new Dashboard(models, config.dashboardPort);
new VirtualSpheroManager(models, config.virtualSphero.wsPort);
new Scoreboard(models, config.scoreboardPort);
new SpheroServerManager(models, spheroWS);
new ControllerManager(models, config.defaultHp, config.damage);
new RankingMaker(models);
new OrbController(models, connector, spheroWS, config.defaultColor, config.collision);

if (config.isUseNoble) {
  // noble は、非対応環境だと、import した直後にエラーが発生してしまう
  // そのため、require を使ってこのタイミングで読み込むしかない
  // SystemJS とか使うともっとかっこいいかも
  const noble = require("noble");
  new UUIDManager(models, noble);
}
