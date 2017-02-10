import assert from "assert";
import orbModel from "../model/orbModel";
import OrbController from "../orbController";

describe("OrbController", () => {
  const orbController = new OrbController();
  const testName = "name-test";
  beforeEach(done => {
    orbController.addOrb(testName, {
      port: "test"
    });
    done();
  });
  afterEach(done => {
    orbModel.orbs = {};
    done();
  });
  describe("#addOrb()", () => {
    it("should add onto orbModel", () => {
      assert(orbModel.has(testName));
      const orb = orbModel.get(testName);
      assert.equal(orb.orbName, testName);
      assert.equal(orb.port, "test");
      assert.equal(orb.battery, null);
      assert.equal(orb.link, "unlinked");
      assert.equal(orb.pingState, "unchecked");
    });
  });
  describe("#removeOrb()", () => {
    it("should remove from orbModel", () => {
      assert(orbModel.has(testName));
      orbController.removeOrb(testName);
      assert(!orbModel.has(testName));
    });
  });
  describe("#setPingStateAll()", () => {
    it("should update pingState", () => {
      assert(orbModel.has(testName));
      orbController.setPingStateAll();
      assert.equal(orbModel.get(testName).pingState, "no reply");
    });
  });
  describe("#updateBattery()", () => {
    it("should update batteryState", () => {
      assert(orbModel.has(testName));
      orbController.updateBattery(testName, "batteryState-test");
      assert.equal(orbModel.get(testName).battery, "batteryState-test");
    });
  });
  describe("#updatePingState()", () => {
    it("should update pingState", () => {
      assert(orbModel.has(testName));
      orbController.updatePingState(testName);
      assert.equal(orbModel.get(testName).pingState, "reply");
    });
  });
});
