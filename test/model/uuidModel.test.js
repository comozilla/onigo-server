import assert from "assert";

import UUIDModel from "../../model/uuidModel";
import AppModel from "../../model/appModel";


describe("UUIDModel", () =>{
  beforeEach(done => {
    appModel = new AppModel();
    appModel.isTestMode = true;
    uuidModel = new UUIDModel({ appModel });
    done();
  });
  let appModel;
  let uuidModel;
  describe("#constructor()", () => {
    it("should initialize nameAndUUIDs", () => {
      assert.deepEqual(uuidModel.nameAndUUIDs, {});
    });
  });
  describe("#setName()", () => {
    it("should add uuid into nameAndUUIDs", () => {
      const testName = "test-name";
      const testUUID = "test-uuid";

      assert(!uuidModel.nameAndUUIDs[testName]);
      uuidModel.setName(testUUID, testName);
      assert(uuidModel.nameAndUUIDs[testName]);
      assert.equal(uuidModel.nameAndUUIDs[testName], testUUID);
    });
  });
});

