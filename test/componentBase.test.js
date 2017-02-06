import assert from "assert";
import publisher from "../publisher";
import ComponentBase from "../componentBase";

describe("ComponentBase", () => {
  describe("#publish()", () => {
    const component = new ComponentBase();
    let isCorrectAuthor = false;
    let isCorrectData = false;
    publisher.subscribe("test1", (author, data) => {
      isCorrectAuthor = author === component;
      isCorrectData = data === "test-data";
    });
    component.publish("test1", "test-data");
    it("should publish author", () => {
      assert(isCorrectAuthor);
    });
    it("should publish correct data", () => {
      assert(isCorrectData);
    });
  });
  describe("#subscribe()", () => {
    const component = new ComponentBase();
    let isCorrectData = false;
    component.subscribe("test2", data => {
      isCorrectData = data === "test-data-2";
    });
    it("should call function", () => {
      isCorrectData = false;
      publisher.publish(this, "test2", "test-data-2");
      assert(isCorrectData);
    });
    it("should not call function when author is same", () => {
      isCorrectData = false;
      publisher.publish(component, "test2", "test-data-2");
      assert(!isCorrectData);
    });
  });
});
