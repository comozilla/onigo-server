import "../css/style.css";

import eventPublisher from "./publisher";
import LinkManager from "./linkManager";
import SocketManager from "./socketManager";
import GameState from "./gameState";
import AvailableCommandsCount from "./availableCommandsCount";
import AddOrb from "./addOrb";
import UnlinkedOrbs from "./unlinkedOrbs";

document.addEventListener("DOMContentLoaded", () => {
  new LinkManager(document.getElementById("links"));
  new GameState(document.getElementById("game-state-button"));
  new AddOrb();
  new UnlinkedOrbs(document.getElementById("unlinked-orbs"));
  new AvailableCommandsCount(
      document.getElementById("available-commands"),
      document.getElementById("set-available-commands-button"));
  new SocketManager();
});

