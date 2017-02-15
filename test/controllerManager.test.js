import assert from "assert";
import ControllerManager from "../controllerManager";
import controllerModel from "../model/controllerModel";
import appModel from "../model/appModel";
import publisher from "../publisher";
import sinon from "sinon";
import config from "../config";

describe("ControllerManager", () => {
  const controllerManager = new ControllerManager(config.defaultHp, config.damage);
  const testKey = "key-test";
  const testName = "name-test";
  controllerModel.add(testKey, {
    sendCustomMessage() {},
    key: testKey
  });
  controllerModel.setName(testKey, testName);

  describe("#changeIsOni", () => {
    const changeIsOniSpy = sinon.spy(controllerManager, "changeIsOni");
    const setIsOniSpy = sinon.spy(controllerModel.get(testName), "setIsOni");
    controllerManager.changeIsOni(testName, true);

    it("should be called", () => {
      assert(changeIsOniSpy.withArgs(testName, true).called);
    });

    it("should call setIsOni of controller", () => {
      assert(setIsOniSpy.withArgs(true).called);
    });

    changeIsOniSpy.restore();
    setIsOniSpy.restore();
  });

  describe("#resetHp", () => {
    const resetHpSpy = sinon.spy(controllerManager, "resetHp");
    const setHpSpy = sinon.spy(controllerModel.get(testName), "setHp");
    controllerManager.resetHp(testName);

    it("should be called", () => {
      assert(resetHpSpy.withArgs(testName).called);
    });

    it("should call setHp of controller", () => {
      assert(setHpSpy.withArgs(config.defaultHp).called);
    });

    resetHpSpy.restore();
    setHpSpy.restore();
  });

  describe("#changeColor", () => {
    const changeColorSpy = sinon.spy(controllerManager, "changeColor");
    const setColorSpy = sinon.spy(controllerModel.get(testName), "setColor");
    controllerManager.changeColor(testName, "red");

    it("should be called", () => {
      assert(changeColorSpy.withArgs(testName, "red").called);
    });

    it("should call setColor of controller", () => {
      assert(setColorSpy.withArgs("red").called);
    });

    changeColorSpy.restore();
    setColorSpy.restore();
  });

  describe("#updateGameState", () => {
    const updateGameStateSpy = sinon.spy(controllerManager, "updateGameState");
    const sendCustomMessageSpy = sinon.spy(controllerModel.get(testName).client, "sendCustomMessage");
    controllerManager.updateGameState("active");

    it("should be called", () => {
      assert(updateGameStateSpy.withArgs("active").called);
    });

    it("should send gameState to client", () => {
      assert(sendCustomMessageSpy.withArgs("gameState", "active").called);
    });

    updateGameStateSpy.restore();
    sendCustomMessageSpy.restore();
  });

  describe("#updateRankingState", () => {
    const updateGameStateSpy = sinon.spy(controllerManager, "updateRankingState");
    const sendCustomMessageSpy = sinon.spy(controllerModel.get(testName).client, "sendCustomMessage");
    controllerManager.updateRankingState("show");

    it("should be called", () => {
      assert(updateGameStateSpy.withArgs("show").called);
    });

    it("should send gameState to client", () => {
      assert(sendCustomMessageSpy.withArgs("rankingState", "show").called);
    });

    updateGameStateSpy.restore();
    sendCustomMessageSpy.restore();
  });

  describe("#updateRanking", () => {
    const updateGameStateSpy = sinon.spy(controllerManager, "updateRanking");
    const sendCustomMessageSpy = sinon.spy(controllerModel.get(testName).client, "sendCustomMessage");
    controllerManager.updateRanking("test-ranking");

    it("should be called", () => {
      assert(updateGameStateSpy.withArgs("test-ranking").called);
    });

    it("should send gameState to client", () => {
      assert(sendCustomMessageSpy.withArgs("ranking", "test-ranking").called);
    });

    updateGameStateSpy.restore();
    sendCustomMessageSpy.restore();
  });

  describe("#damage", () => {
    const controller = controllerModel.get(testName);
    controller.hp = 100;
    controller.isOni = false;
    appModel.gameState = "active";

    const damageSpy = sinon.spy(controllerManager, "damage");
    const setHpSpy = sinon.spy(controller, "setHp");
    const testOrb = {
      linkedClients: [testKey]
    };
    controllerManager.damage(testOrb);

    it("should be called", () => {
      assert(damageSpy.withArgs(testOrb).called);
    });

    it("should call setHp", () => {
      assert(setHpSpy.withArgs(config.defaultHp - config.damage).called);
    });

    damageSpy.restore();
    setHpSpy.restore();
  });

  describe("#updateAvailableCommandsCount", () => {
    const controller = controllerModel.get(testName);
    const updateSpy = sinon.spy(controllerManager, "updateAvailableCommandsCount");
    const sendCustomMessageSpy = sinon.spy(controller.client, "sendCustomMessage");

    controllerManager.updateAvailableCommandsCount(4);

    it("should be called", () => {
      assert(updateSpy.withArgs(4).called);
    });

    it("should call sendCustomMessage", () => {
      assert(sendCustomMessageSpy.withArgs("availableCommandsCount", 4).called);
    });

    updateSpy.restore();
    sendCustomMessageSpy.restore();
  });

});
