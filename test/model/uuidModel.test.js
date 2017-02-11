import assert from "assert";
import { UUIDModel } from "../../model/uuidModel";
import appModel from "../../model/appModel";

describe("UUIDModel", () =>{
  describe("#constructor()", () => {
    const uuidModel = new UUIDModel();
    it("should initialize nameAndUUIDs", () => {
      assert.deepEqual(uuidModel.nameAndUUIDs, {});
    });
  });
  describe("#setName()", () => {
    const uuidModel = new UUIDModel();
    const testName = "test-name";
    const testUUID = "test-uuid";

    it("should add uuid into nameAndUUIDs", () => {
      assert(!uuidModel.nameAndUUIDs[testName]);
      uuidModel.setName(testUUID, testName);
      assert(uuidModel.nameAndUUIDs[testName]);
      assert.equal(uuidModel.nameAndUUIDs[testName], testUUID);
    });
  });
});
