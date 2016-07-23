import eventPublisher from "./publisher";

export default class rankingState {
  constructor(element) {
    this.element = element;
    this.element.disabled = true;
    this.rankingState = "hide";
    eventPublisher.on("gameState", gameState => {
      this.element.disabled = gameState === "inactive";
    });
    eventPublisher.on("rankingState", rankingState => {
      this.rankingState = rankingState;
    });
    this.element.addEventListener("click", () => {
      eventPublisher.emit("rankingState", this.rankingState === "show" ? "hide" : "show");
    });
  }
}
