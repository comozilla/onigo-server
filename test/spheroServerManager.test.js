import assert from "assert";
import SpheroServerManager from "../spheroServerManager";
import publisher from "../publisher";
import sinon from "sinon";
import { EventEmitter } from "events";

// test には sphero-websocket が必要で、その際ネイティブ依存のモジュールも必要になるので、
// テストできない。テストするには、sphero-websocket の testMode 時にネイティブ依存モジュールを使わないよう
// 改善しなければならない


describe("SpheroServerManager", () => {
  let spheroServerManager;
  beforeEach(done => {
    publisher.clearObserveFunctions();
    spheroServerManager = new SpheroServerManager({}, {
      spheroServer: { events: new EventEmitter() }
    });
    done();
  });
  describe("#publishAddedOrb", () => {
    it("should publish addedOrb", () => {
      const spy = sinon.spy();
      const orbName = "orb1";
      const orb = "orb";
      publisher.subscribe("addedOrb", spy);
      spheroServerManager.publishAddedOrb(orbName, orb);
      assert(spy.withArgs(spheroServerManager, orbName, orb));
    });
  });
});

