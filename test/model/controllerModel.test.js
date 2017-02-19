import assert from "assert";
import publisher from "../../publisher";
import ControllerModel from "../../model/controllerModel";

describe("ControllerModel", () => {
  let controllerModel;
  beforeEach(() => {
    publisher.clearObserveFunctions();
    controllerModel = new ControllerModel();
  });
  describe("#constructor", () => {
    it("should initialize controllers", () => {
      assert.deepEqual(controllerModel.controllers, {});
    });
  });
  describe("#toName", () => {
    it("should return name of the key", () => {
      const testKey = "hoge";
      const testName = "testController3";
      controllerModel.controllers = {
        testController1: {
          client: { key: "invalid" }
        },
        testController2: {
        }
      };
      controllerModel.controllers[testName] = {
        client: { testKey }
      };
      const name = controllerModel.toName(testKey);
      assert.equal(name, testName);
    });
  });
});