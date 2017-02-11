import ComponentBase from "../componentBase";

export class AppModel extends ComponentBase {
  constructor() {
    super();

    this.gameState = "inactive";
    this.rankingState = "hide";
    this.availableCommandsCount = 1;
    this.isTestMode = false;
    this.error121Count = 0;

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
  resetError121Count() {
    this.error121Count = 0;
  }
  incrementError121Count() {
    this.error121Count++;
  }
}

export default new AppModel();
