import "../css/style.css";

import eventPublisher from "./publisher";
import LinkManager from "./linkManager";
import SocketManager from "./socketManager";
import GameState from "./gameState";
import AvailableCommandsCount from "./availableCommandsCount";

document.addEventListener("DOMContentLoaded", () => {
  new LinkManager(document.getElementById("links"));
  new GameState(document.getElementById("game-state-button"));
  new AvailableCommandsCount(
      document.getElementById("available-commands"),
      document.getElementById("set-available-commands-button"));
  new SocketManager();
});

