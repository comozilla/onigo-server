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
      it("should call function", () => {
        assert(data === "test-data-2");
      });
    });
    publisher.publish(this, "test2", "test-data-2");
    component.subscribe("test3", data => {
      it("should not call function when author is same", () => {
        assert(data === "test-data-3");
      });
    });
    publisher.publish(component, "test3", "test-data-3");
  });
});
