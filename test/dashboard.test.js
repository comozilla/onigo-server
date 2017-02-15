import assert from "assert";
import Dashboard from "../dashboard";
import publisher from "../publisher";

describe("Dashboard", function() {
  const dashboard = new Dashboard(8082);
  describe("#initializeConnection()", function() {
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
        if (subjectName === "link") {
          it("should register publishLink", () => {
            assert(listener.toString() === dashboard.publishUpdateLink.bind(dashboard).toString());
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

  });

  describe("#publishPingAll()", () => {
    publisher.subscribe("pingAll", author => {
      it("should publish pingAll to eventPublisher", () => {
        assert.equal(author, dashboard);
      });
    });
    dashboard.publishPingAll();
  });

  describe("#publishUpdateLink", () => {
    publisher.subscribe("updateLink", author => {
      it("should publish updateLink to eventPublisher", () => {
        assert.equal(author, dashboard);
      });
    });
    dashboard.publishUpdateLink("contrllerName", "orbName");
  });

  describe("#formatTime()", () => {
    const date = new Date();
    const formattedTime = dashboard.formatTime(date);

    it("should format correctly", () => {
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
