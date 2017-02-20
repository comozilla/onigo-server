import assert from "assert";
import UUIDManager from "../uuidManager";
import publisher from "../publisher";
import sinon from "sinon";
import { EventEmitter } from "events";

describe("UUIDManager", () => {
  let uuidManager;
  const noble = new EventEmitter();
  beforeEach(done => {
    noble.removeAllListeners();
    publisher.clearObserveFunctions();
    uuidManager = new UUIDManager({
      appModel: { isTestMode: false }
    }, noble);
    done();
  });

  it("on#discover", () => {
    const testName = "test-name";
    const testUUID = "test-uuid";
    const spy = sinon.spy();
    publisher.subscribe("setNameOfUUID", spy);
    noble.emit("discover", {
      advertisement: { localName: testName },
      uuid: testUUID
    });
  });
});
