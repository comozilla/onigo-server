import assert from "assert";
import VirtualSpheroManager from "../virtualSpheroManager";
import VirtualSphero from "sphero-ws-virtual-plugin";

describe("VirtualSpheroManager", () => {
  describe("#constructor()", () => {
    const virtualSpheroManager = new VirtualSpheroManager({}, 8081);
    it("should initialize virtualSphero", () => {
      assert(typeof virtualSpheroManager === "object");
      assert(virtualSpheroManager.virtualSphero instanceof VirtualSphero);
    });
  });
  describe("#removeSphero", () => {

  });
});
