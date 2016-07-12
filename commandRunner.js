var EventEmitter = require("events").EventEmitter;
var util = require("util");

function CommandRunner(key) {
  EventEmitter.call(this);

  this.key = key;
  this.commands = [];
  this.baseSpeed = 0;
  this.angle = 0;
  this.timeoutId = null;
  this.dashTimeoutId = null;
  this.builtInCommands = {
    rotate: () => {
      this.clearTimeout();
      (rotateFunction = () => {
        this.angle = (this.angle + 45) % 360;
        this.emit("command", "roll", [0, this.angle]);
        this.timeoutId = setTimeout(rotateFunction, 500);
      })();
    },
    stop: () => {
      this.clearTimeout();
      this.emit("command", "roll", [0, this.angle]);
    },
    dash: () => {
      if (this.dashTimeoutId !== null) {
        clearTimeout(this.dashTimeoutId);
      }
      this.baseSpeed = 50;
      this.dashTimeoutId = setTimeout(() => {
        this.baseSpeed = 0;
      }, 1000);
    }
  };
}

util.inherits(CommandRunner, EventEmitter);

CommandRunner.prototype.setCommands = function(commands) {
  this.clearTimeout();
  this.commands = commands;
  this.loopMethod(0);
};

CommandRunner.prototype.setBuiltInCommands = function(builtInCommandsName) {
  if (typeof this.builtInCommands[builtInCommandsName] !== "function") {
    throw new Error("built-in command : " + builtInCommandsName + " is not valid.");
  }
  this.builtInCommands[builtInCommandsName]();
};

CommandRunner.prototype.clearTimeout = function() {
  if (this.timeoutId !== null) {
    clearTimeout(this.timeoutId);
  }
};

CommandRunner.prototype.loopMethod = function(index) {
  if (this.commands.length === 0) {
    throw new Error("実行しようとしたcommandsは空でした。: " + this.key);
  }
  var currentCommand = this.commands[index];
  var applyArgs = currentCommand.args.slice();
  if (currentCommand.commandName === "roll") {
    applyArgs[0] = this.baseSpeed + applyArgs[0];
    applyArgs[1] = (360 + applyArgs[1] + this.angle) % 360;
  }
  this.emit("command", currentCommand.commandName, applyArgs);
  var nextIndex = index + 1 >= this.commands.length ? 0 : index + 1;
  this.timeoutId = setTimeout(() => {
    this.loopMethod(nextIndex);
  }, currentCommand.time * 1000);
};

module.exports = CommandRunner;

