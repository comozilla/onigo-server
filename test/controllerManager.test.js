import assert from "assert";
import ControllerManager from "../controllerManager";
import controllerModel from "../model/controllerModel";
import publisher from "../publisher";
import sinon from "sinon";

describe("ControllerManager", () => {
  const controllerManager = new ControllerManager();
  const testKey = "key-test";
  const testName = "name-test";
  controllerModel.add(testKey, {
    sendCustomMessage() {}
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
  });

  describe("#resetHp", () => {
    const resetHpSpy = sinon.spy(controllerManager, "resetHp");
    const setHpSpy = sinon.spy(controllerModel.get(testName), "setHp");
    controllerManager.resetHp(testName);

    it("should be called", () => {
      assert(resetHpSpy.withArgs(testName).called);
    });

    it("should call setHp of controller", () => {
      assert(setHpSpy.withArgs(100).called);
    });
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
  });
});
