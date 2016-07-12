import "../css/style.css";

const socket = io();

import LinkManager from "./linkManager";

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

    socket.on("defaultData", (state, count, links, orbs) => {
      gameState = state;
      gameStateButton.textContent = gameState.toUpperCase();

      availableCommandsCount = count;
      availableCommandsElement.value = availableCommandsCount;

      orbNames = orbs;
      linkManager.clientLinks = links;
      Object.keys(linkManager.clientLinks).forEach(clientKey => {
        linkManager.addLink(clientKey, orbNames);
      });
    });

    gameStateButton.addEventListener("click", () => {
      gameState = gameState === "active" ? "inactive" : "active";
      socket.emit("gameState", gameState);

      gameStateButton.textContent = gameState.toUpperCase();
    });

    const setAvailableCommandsButton = document.getElementById("set-available-commands-button");
    setAvailableCommandsButton.addEventListener("click", function() {
      if (!isNaN(availableCommandsElement.value)) {
        availableCommandsCount = parseInt(availableCommandsElement.value);
        socket.emit("availableCommandsCount", availableCommandsCount);
      }
    });

    socket.on("addClient", key => {
      linkManager.addLink(key, orbNames);
    });

    socket.on("removeClient", key => {
      linkManager.removeLink(key);
    });

    socket.on("updateOrbs", orbs => {
      orbNames = orbs;
    });
  });
}();

