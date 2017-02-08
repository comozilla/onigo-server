import assert from "assert";
import { AppModel } from "../../model/appModel";

describe("AppModel", () => {
  const appModel = new AppModel();
  describe("#constructor()", () => {
    it("should initialize gameState", () => {
      assert(appModel.gameState === "inactive");
    });
    it("should initialize rankingState", () => {
      assert(appModel.rankingState === "hide");
    });
    it("should initialize availableCommandsCount", () => {
      assert(appModel.availableCommandsCount === 1);
    });
  });
  describe("#updateGameState()", () => {
    appModel.updateGameState("active");
    it("should update gameState", () => {
      assert(appModel.gameState === "active");
    });
  });
  describe("#updateRankingState()", () => {
    appModel.updateRankingState("show");
    it("should update rankingState", () => {
      assert(appModel.rankingState === "show");
    });
  });
  describe("#updateAvailableCommandsCount", () => {
    appModel.updateAvailableCommandsCount(6);
    it("should update availableCommandsCount", () => {
      assert(appModel.availableCommandsCount === 6);
    });
  });
});
