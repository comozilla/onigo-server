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
    this.nameAndUUIDs = {};

    this.subscribeModel("gameState", this.updateGameState);
    this.subscribeModel("rankingState", this.updateRankingState);
    this.subscribeModel("availableCommandsCount", this.updateAvailableCommandsCount);
    this.subscribeModel("ranking", this.updateRanking);
    this.subscribeModel("setNameOfUUID", this.setNameOfUUID);
    this.subscribeModel("incrementError121Count", this.incrementError121Count);
    this.subscribeModel("resetError121Count", this.resetError121Count);
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
  setNameOfUUID(name, uuid) {
    console.log(`name: ${name}, uuid: ${uuid}`);
    this.nameAndUUIDs[name] = uuid;
  }
  containsUUID(name) {
    return typeof this.nameAndUUIDs[name] !== "undefined";
  }
  getUUID(name) {
    if (!this.containsUUID(name)) {
      throw new Error("The name's uuid was not found. name: " + name);
    }
    return this.nameAndUUIDs[name];
  }
}

