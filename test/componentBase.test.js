import assert from "assert";
import publisher from "../publisher";
import ComponentBase from "../componentBase";

describe("ComponentBase", () => {
  publisher.clearObserveFunctions();
  describe("#constructor()", () => {
    const testModel = "test-model";
    const component = new ComponentBase({ testModel });

    it("should set models", () => {
      assert(component.testModel);
      assert.equal(component.testModel, testModel);
    });
  });
  describe("#publish()", () => {
    const component = new ComponentBase();
    publisher.subscribe("test1", (author, data) => {
      it("should publish author", () => {
        assert(author === component);
      });
      it("should publish correct data", () => {
        assert(data === "test-data");
      });
    });
    component.publish("test1", "test-data");
  });
  describe("#subscribe()", () => {
    const component = new ComponentBase();
    component.subscribe("test2", data => {
      it("should be called", () => {
        assert(data === "test-data-2");
      });
    });
    publisher.publish(this, "test2", "test-data-2");

    let isCalled = false;
    component.subscribe("test3", data => {
      isCalled = data === "test-data-3";
    });
    publisher.publish(component, "test3", "test-data-3");
    it("should not call function when author is same", () => {
      assert(!isCalled);
    });
  });
  describe("#subscribeModel()", () => {
    const component = new ComponentBase();
    component.subscribeModel("test4", data => {
      it("should be called", () => {
        assert(data === "test-data-4");
      });
    });
    publisher.publish(this, "test4", "test-data-4");
  });
});
