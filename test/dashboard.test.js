import assert from "assert";
import Dashboard from "../dashboard";
import publisher from "../publisher";

describe("Dashboard", function() {
  describe("#initializeConnection()", function() {
    const dashboard = new Dashboard(8082);
    let registeredListener = null;
    let isRegisterPingAll = false;
    dashboard.initializeConnection({
      on(subjectName, listener) {
        if (subjectName === "gameState") {
          registeredListener = listener;
        }
        if (subjectName === "pingAll" &&
            listener.toString() === dashboard.publishPingAll.bind(dashboard).toString()) {
          isRegisterPingAll = true;
        }
      },
      emit() {}
    });
    it("should register listener to the socket", () => {
      assert(typeof registeredListener === "function");
    });
    it("should publish to eventPublisher", () => {
      let isCalled = false;
      publisher.subscribe("gameState", (author, state) => {
        if (state === "active") {
          isCalled = true;
        }
      });
      registeredListener("active");
      assert(isCalled);
    });
    it("should register publishPingAll", () => {
      assert(isRegisterPingAll);
    });
    it("should publish pingAll to eventPublisher", () => {
      let isCalled = false;
      publisher.subscribe("pingAll", author => {
        isCalled = true;
      });
      dashboard.publishPingAll();
      assert(isCalled);
    });
  });
});
