import assert from "assert";
import CommandRunner from "../commandRunner";

describe("CommandRunner", () => {
  const commandRunner = new CommandRunner();
  const timeoutDelay = 1000;
  describe("#stopLoop()", () => {
    const timeoutId = setTimeout(() => {}, timeoutDelay);
    commandRunner.loopTimeoutId = timeoutId;
    it("should set loopTimeoutId to null", () => {
      assert.equal(commandRunner.loopTimeoutId, timeoutId);
      commandRunner.stopLoop();
      assert.equal(commandRunner.loopTimeoutId, null);
    });
  });
  describe("clearCustomTimeoutIds()", () => {
    const timeoutId = setTimeout(() => {}, timeoutDelay);
    commandRunner.customTimeoutIds = { test1: timeoutId };
    it("should delete timeoutId from customTimeoutIds", () => {
      assert(commandRunner.customTimeoutIds["test1"]);
      assert.equal(commandRunner.customTimeoutIds["test1"], timeoutId);
      commandRunner.clearCustomTimeoutIds();
      assert(!commandRunner.customTimeoutIds["test1"]);
    });
  });
});
