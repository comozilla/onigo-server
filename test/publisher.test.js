import assert from "assert";
import { EventPublisher } from "../publisher";

describe("Publisher", function() {
  describe("#constructor()", function() {
    const publisher = new EventPublisher();
    it("should initialize observeFunctions to {}", function() {
      assert.deepEqual({}, publisher.observeFunctions);
    });
  });
  describe("#subscribe()", function() {
    const publisher = new EventPublisher();
    const observeFunction = function() {};
    publisher.subscribe("a", observeFunction);
    it("should make subjectName into observeFunctions", function() {
      assert.deepEqual(["a"], Object.keys(publisher.observeFunctions));
    });
    it("should add observeFunction into observeFunctions", function() {
      assert.deepEqual([observeFunction], publisher.observeFunctions["a"]);
    });
  });
  describe("#publish", function() {
    const publisher = new EventPublisher();
    let isEqualsData = false;
    const callback = function(author, data, data2, data3) {
      it("This callback function should be called", () => {
        assert(true);
      });
      it("should equal author", () => {
        assert(author === "hello-author");
      });
      it("should equal data", () => {
        assert(data === "data-test" && data2 === 100 && data3 === true);
      });
    };
    publisher.subscribe("a", callback);
    publisher.publish("hello-author", "a", "data-test", 100, true);
  });
});
