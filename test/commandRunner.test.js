import assert from "assert";
import CommandRunner from "../commandRunner";

describe("CommandRunner", () => {
  const commandRunner = new CommandRunner();
  describe("#stopLoop()", () => {
    const timeoutId = setTimeout(() => {}, 1000);
    commandRunner.loopTimeoutId = timeoutId;
    it("should set loopTimeoutId to null", () => {
      assert.equal(commandRunner.loopTimeoutId, timeoutId);
      commandRunner.stopLoop();
      assert.equal(commandRunner.loopTimeoutId, null);
    });
  });
  describe("clearCustomTimeoutIds()", () => {
    const timeoutId = setTimeout(() => {}, 1000);
    commandRunner.customTimeoutIds = { test1: timeoutId };
    it("should delete timeoutId from customTimeoutIds", () => {
      assert(commandRunner.customTimeoutIds["test1"]);
      assert.equal(commandRunner.customTimeoutIds["test1"], timeoutId);
      commandRunner.clearCustomTimeoutIds();
      assert(!commandRunner.customTimeoutIds["test1"]);
    });
  });
});
