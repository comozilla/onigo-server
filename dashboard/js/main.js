import "../css/style.css";

import eventPublisher from "./publisher";
import LinkManager from "./linkManager";
import SocketManager from "./socketManager";

+function() {
  let gameState = "inactive";
  let availableCommandsCount = 1;

  let gameStateButton;
  let availableCommandsElement;

  let orbNames = [];
  let linkManager;

  document.addEventListener("DOMContentLoaded", () => {
    gameStateButton = document.getElementById("game-state-button");
    availableCommandsElement = document.getElementById("available-commands");
    linkManager = new LinkManager(document.getElementById("links"));
    linkManager.on("change", (clientKey, orbName) => {
      console.log(clientKey + " links " + orbName);
    });

    new SocketManager();

    eventPublisher.on("gameState", state => {
      gameState = state;
      gameStateButton.textContent = gameState.toUpperCase();
    });

    eventPublisher.on("availableCommandsCount", count => {
      availableCommandsCount = count;
      availableCommandsElement.value = availableCommandsCount;
    });

    eventPublisher.on("defaultLinks", links => {
      linkManager.clientLinks = links;
      Object.keys(linkManager.clientLinks).forEach(clientKey => {
        linkManager.addLink(clientKey, orbNames);
      });
    });

    gameStateButton.addEventListener("click", () => {
      gameState = gameState === "active" ? "inactive" : "active";
      gameStateButton.textContent = gameState.toUpperCase();
      eventPublisher.emit("gameState", gameState);
    });

    const setAvailableCommandsButton = document.getElementById("set-available-commands-button");
    setAvailableCommandsButton.addEventListener("click", function() {
      if (!isNaN(availableCommandsElement.value)) {
        availableCommandsCount = parseInt(availableCommandsElement.value);
        eventPublisher.emit("availableCommandsCount", availableCommandsCount);
      }
    });

    eventPublisher.on("addClient", key => {
      linkManager.addLink(key, orbNames);
    });

    eventPublisher.on("removeClient", key => {
      linkManager.removeLink(key);
    });

    eventPublisher.on("orbs", orbs => {
      orbNames = orbs;
    });
  });
}();

