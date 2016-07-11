var socket = io();

document.addEventListener("DOMContentLoaded", () => {
  var gameState = "inactive";
  var availableCommandsCount = 1;

  var gameStateButton = document.getElementById("game-state-button");
  var availableCommandsElement = document.getElementById("available-commands");

  var clientLinks = {};
  var orbNames = [];

  socket.on("defaultData", (state, count, links, orbs) => {
    gameState = state;
    gameStateButton.textContent = gameState.toUpperCase();

    availableCommandsCount = count;
    availableCommandsElement.value = availableCommandsCount;

    clientLinks = links;
    orbNames = orbs;
    console.log(orbNames);
  });

  gameStateButton.addEventListener("click", () => {
    gameState = gameState === "active" ? "inactive" : "active";
    socket.emit("gameState", gameState);

    gameStateButton.textContent = gameState.toUpperCase();
  });

  var setAvailableCommandsButton = document.getElementById("set-available-commands-button");
  setAvailableCommandsButton.addEventListener("click", function() {
    if (!isNaN(availableCommandsElement.value)) {
      availableCommandsCount = parseInt(availableCommandsElement.value);
      socket.emit("availableCommandsCount", availableCommandsCount);
    }
  });

  socket.on("addClient", key => {
    // todo
    console.log(key);
  });

  socket.on("updateOrbs", orbs => {
    orbNames = orbs;
  });
});
