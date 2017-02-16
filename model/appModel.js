import ComponentBase from "../componentBase";

export default class AppModel extends ComponentBase {
  constructor() {
    super();

    this.gameState = "inactive";
    this.rankingState = "hide";
    this.availableCommandsCount = 1;
    this.isTestMode = false;
    this.error121Count = 0;
    this.ranking = null;

    this.subscribeModel("gameState", this.updateGameState);
    this.subscribeModel("rankingState", this.updateRankingState);
    this.subscribeModel("availableCommandsCount", this.updateAvailableCommandsCount);
    this.subscribeModel("ranking", this.updateRanking);
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
  updateRanking(ranking) {
    this.ranking = ranking;
  }
}

