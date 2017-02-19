import assert from "assert";
import AppModel from "../../model/appModel";

describe("AppModel", () => {
  let appModel;
  beforeEach(done => {
    appModel = new AppModel();
    done();
  });
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
    it("should update gameState", () => {
      appModel.updateGameState("active");
      assert.equal(appModel.gameState, "active");
    });
  });
  describe("#updateRankingState()", () => {
    it("should update rankingState", () => {
      appModel.updateRankingState("show");
      assert.equal(appModel.rankingState, "show");
    });
  });
  describe("#updateAvailableCommandsCount", () => {
    it("should update availableCommandsCount", () => {
      appModel.updateAvailableCommandsCount(6);
      assert.equal(appModel.availableCommandsCount, 6);
    });
  });
  describe("#updateRanking", () => {
    it("should update ranking", () => {
      const ranking = "test-ranking";
      appModel.updateRanking(ranking);
      assert.equal(appModel.ranking, ranking);
    });
  });
});
