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
  describe("#subscribeModel()", function() {
    const publisher = new EventPublisher();
    const observeFunction = function() {};
    publisher.subscribeModel("a", observeFunction);
    it("should make subjectName into observeFunctionsInModel", function() {
      assert.deepEqual(["a"], Object.keys(publisher.observeFunctionsInModel));
    });
    it("should add observeFunction into observeFunctionsInModel", function() {
      assert.deepEqual([observeFunction], publisher.observeFunctionsInModel["a"]);
    });
  });
  describe("#publish", function() {
    const publisher = new EventPublisher();
    let isEqualsData = false;
    let isCalledModel = false;
    const callbackInModel = function() {
      isCalledModel = true;
    };
    const callback = function(author, data, data2, data3) {
      it("This callback function should be called", () => {
        assert(true);
      });
      it("This callback function should be called after callback function in model", () => {
        assert(isCalledModel);
      });
      it("should equal author", () => {
        assert(author === "hello-author");
      });
      it("should equal data", () => {
        assert(data === "data-test" && data2 === 100 && data3 === true);
      });
    };
    publisher.subscribe("a", callback);
    publisher.subscribeModel("a", callbackInModel);
    publisher.publish("hello-author", "a", "data-test", 100, true);
  });
});
