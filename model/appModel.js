import ComponentBase from "../componentBase";

export class AppModel extends ComponentBase {
  constructor() {
    super();

    this.gameState = "inactive";
    this.rankingState = "hide";
    this.availableCommandsCount = 1;

    this.subscribe("gameState", this.updateGameState);
    this.subscribe("rankingState", this.updateRankingState);
    this.subscribe("availableCommandsCount", this.updateAvailableCommandsCount);
  }
  updateGameState(state) {
    this.gameState = state;
  }
  updateRankingState(state) {
    this.rankingState = state;
  }
  updateAvailableCommandsCount(count) {
    this.availableCommandsCount = count;
  }
}

export default new AppModel();
