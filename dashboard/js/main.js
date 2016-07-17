import "../css/style.css";

import eventPublisher from "./publisher";
import ControllerManager from "./controllerManager";
import SocketManager from "./socketManager";
import GameState from "./gameState";
import AvailableCommandsCount from "./availableCommandsCount";
import AddOrb from "./addOrb";
import UnlinkedOrbs from "./unlinkedOrbs";

document.addEventListener("DOMContentLoaded", () => {
  new ControllerManager(document.getElementById("controllers"));
  new GameState(document.getElementById("game-state-button"));
  new AddOrb();
  new UnlinkedOrbs(document.getElementById("orbs"));
  new AvailableCommandsCount(
      document.getElementById("available-commands"),
      document.getElementById("set-available-commands-button"));
  new SocketManager();
});

