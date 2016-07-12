import eventPublisher from "./publisher";

export default class GameState {
  constructor(buttonElement) {
    this.gameState = "inactive";
    this.button = buttonElement;

    eventPublisher.on("gameState", gameState => {
      this.gameState = gameState;
      this.button.textContent = gameState.toUpperCase();
    });

    this.button.addEventListener("click", () => {
      eventPublisher.emit("gameState", this.gameState === "active" ? "inactive" : "active");
    });
  }
}
