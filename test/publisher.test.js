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
    let isCalled = false;
    let isEqualsAuthor = false;
    let isEqualsData = false;
    const callback = function(author, data, data2, data3) {
      isCalled = true;
      if (author === "hello-author") {
        isEqualsAuthor = true;
      }
      if (data === "data-test" && data2 === 100 && data3 === true) {
        isEqualsData = true;
      }
    };
    publisher.subscribe("a", callback);
    publisher.publish("hello-author", "a", "data-test", 100, true);
    it("should call the callback function", function() {
      assert(isCalled);
    });
    it("should equal author", function() {
      assert(isEqualsAuthor);
    });
    it("should equal data", function() {
      assert(isEqualsData);
    });
  });
});
