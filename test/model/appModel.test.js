import assert from "assert";
import AppModel from "../../model/appModel";

describe("AppModel", () => {
  const appModel = new AppModel();
  describe("#constructor()", () => {
    it("should initialize gameState", () => {
      assert.equal(appModel.gameState, "inactive");
    });
    it("should initialize rankingState", () => {
      assert.equal(appModel.rankingState, "hide");
    });
    it("should initialize availableCommandsCount", () => {
      assert.equal(appModel.availableCommandsCount, 1);
    });
  });
  describe("#updateGameState()", () => {
    appModel.updateGameState("active");
    it("should update gameState", () => {
      assert.equal(appModel.gameState, "active");
    });
  });
  describe("#updateRankingState()", () => {
    appModel.updateRankingState("show");
    it("should update rankingState", () => {
      assert.equal(appModel.rankingState, "show");
    });
  });
  describe("#updateAvailableCommandsCount", () => {
    appModel.updateAvailableCommandsCount(6);
    it("should update availableCommandsCount", () => {
      assert.equal(appModel.availableCommandsCount, 6);
    });
  });
  describe("#updateRanking", () => {
    const ranking = "test-ranking";
    appModel.updateRanking(ranking);
    it("should update ranking", () => {
      assert.equal(appModel.ranking, ranking);
    });
  });
});
