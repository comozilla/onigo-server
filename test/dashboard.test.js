import assert from "assert";
import Dashboard from "../dashboard";
import publisher from "../publisher";
import AppModel from "../model/appModel";
import ControllerModel from "../model/controllerModel";
import OrbModel from "../model/orbModel";
import sinon from "sinon";
import { EventEmitter } from "events";

describe("Dashboard", function() {
  let controllerModel;
  let dashboard;

  beforeEach(done => {
    publisher.clearObserveFunctions();
    controllerModel = new ControllerModel();
    dashboard = new Dashboard({
      appModel: new AppModel(),
      controllerModel,
      orbModel: new OrbModel()
    }, 8082);
    dashboard.initializeConnection(new EventEmitter());
    done();
  });

  afterEach(done => {
    dashboard.server.close(() => {
      done();
    });
  });

  describe("#initializeConnection()", function() {
    it("should register listener to the socket", () => {
      const spy = sinon.spy();
      const activeState = "active";
      publisher.subscribe("gameState", spy);
      dashboard.socket.emit("gameState", activeState);
      assert(spy.withArgs(dashboard, activeState).calledOnce);
    });
    it("should register publishPingAll", () => {
      const spy = sinon.spy(dashboard, "publishPingAll");
      dashboard.socket.emit("pingAll");
      assert(spy.calledOnce);
    });
    it("should register publishUpdateLink", () => {
      const spy = sinon.spy(dashboard, "publishUpdateLink");
      const testControllerName = "controller-name";
      const testOrbName = "orb-name";
      dashboard.socket.emit("link", testControllerName, testOrbName);
      assert(spy.withArgs(testControllerName, testOrbName).calledOnce);
    });
  });

  describe("#publishPingAll()", () => {
    it("should publish pingAll to eventPublisher", () => {
      const spy = sinon.spy();
      publisher.subscribe("pingAll", spy);
      dashboard.publishPingAll();
      assert(spy.withArgs(dashboard).calledOnce);
    });
  });

  describe("#publishUpdateLink", () => {
    it("should publish updateLink to eventPublisher", () => {
      const spy = sinon.spy();
      const testControllerName = "controllerName";
      const testOrbName = "orbName";
      publisher.subscribe("updateLink", spy);
      dashboard.publishUpdateLink(testControllerName, testOrbName);
      assert(spy.withArgs(dashboard, testControllerName, testOrbName));
    });
  });

  describe("#formatTime()", () => {
    it("should format correctly", () => {
      const date = new Date();
      const formattedTime = dashboard.formatTime(date);
      const nums = formattedTime.split(":");

      assert.equal(nums.length, 3);

      assert.equal(nums[0].length, 2);
      assert.equal(parseInt(nums[0]), date.getHours());

      assert.equal(nums[1].length, 2);
      assert.equal(parseInt(nums[1]), date.getMinutes());

      assert.equal(nums[2].length, 2);
      assert.equal(parseInt(nums[2]), date.getSeconds());
    });
  });
});
