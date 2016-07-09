var socket = io();

document.addEventListener("DOMContentLoaded", function() {
  var gameState = "inactive";
  var gameStateButton = document.getElementById("game-state-button");
  gameStateButton.addEventListener("click", function() {
    gameState = gameState === "active" ? "inactive" : "active";
    socket.emit("gameState", { gameState: gameState });

    gameStateButton.textContent = gameState.toUpperCase();
  });
});
