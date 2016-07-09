var socket = io();

document.addEventListener("DOMContentLoaded", function() {
  var gameState = "inactive";
  var availableCommandsCount = 1;

  var gameStateButton = document.getElementById("game-state-button");
  var availableCommandsElement = document.getElementById("available-commands");

  socket.on("defaultData", (state, count) => {
    gameState = state;
    gameStateButton.textContent = gameState.toUpperCase();

    availableCommandsCount = count;
    availableCommandsElement.value = availableCommandsCount;
  });

  gameStateButton.addEventListener("click", function() {
    gameState = gameState === "active" ? "inactive" : "active";
    socket.emit("gameState", { gameState: gameState });

    gameStateButton.textContent = gameState.toUpperCase();
  });

  var setAvailableCommandsButton = document.getElementById("set-available-commands-button");
  setAvailableCommandsButton.addEventListener("click", function() {
    if (!isNaN(availableCommandsElement.value)) {
      availableCommandsCount = parseInt(availableCommandsElement.value);
      socket.emit("availableCommandsCount", { count: availableCommandsCount });
    }
  });
});
