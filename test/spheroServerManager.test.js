import assert from "assert";
import SpheroServerManager from "../spheroServerManager";
import publisher from "../publisher";

// test には sphero-websocket が必要で、その際ネイティブ依存のモジュールも必要になるので、
// テストできない。テストするには、sphero-websocket の testMode 時にネイティブ依存モジュールを使わないよう
// 改善しなければならない

/*
describe("SpheroServerManager", () => {
  const spheroServerManager = new SpheroServerManager({
    wsPort: 8080,
    allowedOrigin: "*",
    sphero: [],
    checkSignal: true,
    linkMode: "manual"
  }, false);
  describe("#publishAddedOrb", () => {
    it("should publish addedOrb", () => {
      publisher.subscribe("addedOrb", (author, name, orb) => {
        assert(author === spheroServerManager);
        assert(name === "orb1");
        assert(orb === "orb");
      });
      spheroServerManager.publishAddedOrb("orb1", "orb");
    });
    it("should also call initializeOrb when isTestMode is false", () => {
      spheroServerManager.isTestMode = false;
      let isCalled = false;
      spheroServerManager.initializeOrb = () => {
        isCalled = true;
      };
      spheroServerManager.publishAddedOrb("orb1", "orb");
      assert(isCalled);
    });
  });
});
*/
