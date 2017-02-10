import assert from "assert";
import publisher from "../publisher";
import ComponentBase from "../componentBase";

describe("ComponentBase", () => {
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
    it("should not call function when author is same", () => {
      let isCalled = false;
      component.subscribe("test3", data => {
        isCalled = data === "test-data-3";
      });
      assert(!isCalled);
    });
    publisher.publish(component, "test3", "test-data-3");
  });
  describe("#subscribe()", () => {
    const component = new ComponentBase();
    component.subscribeModel("test4", data => {
      it("should be called", () => {
        assert(data === "test-data-4");
      });
    });
    publisher.publish(this, "test4", "test-data-4");
    it("should not call function when author is same", () => {
      let isCalled = false;
      component.subscribeModel("test5", data => {
        isCalled = data === "test-data-5";
      });
      assert(!isCalled);
    });
    publisher.publish(component, "test5", "test-data-5");
  });
});
