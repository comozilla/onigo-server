import assert from "assert";
import Dashboard from "../dashboard";
import publisher from "../publisher";

describe("Dashboard", function() {
  describe("#initializeConnection()", function() {
    const dashboard = new Dashboard(8082);
    let registeredListener = null;
    dashboard.initializeConnection({
      on(subjectName, listener) {
        if (subjectName === "gameState") {
          registeredListener = listener;
          it("should register listener to the socket", () => {
            assert(typeof listener === "function");
          });
        }
        if (subjectName === "pingAll") {
          it("should register publishPingAll", () => {
            assert(listener.toString() === dashboard.publishPingAll.bind(dashboard).toString());
          });
        }
      },
      emit() {}
    });

    publisher.subscribe("gameState", (author, state) => {
      it("should publish to eventPublisher", () => {
        assert(state === "active");
      });
    });
    registeredListener("active");

    publisher.subscribe("pingAll", author => {
      it("should publish pingAll to eventPublisher", () => {
        assert(true);
      });
    });
    dashboard.publishPingAll();
  });
});
