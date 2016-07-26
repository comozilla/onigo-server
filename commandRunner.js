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
  this.rotateTimeoutId = null;
  this.commandFunctions = {
    rotate: (config, turn) => {
      if (config.isBuiltIn) {
        this.stopCommand();
      }
      const rotateFunction = () => {
        this.angle = (this.angle + turn) % 360;
        this.emit("command", "roll", [0, this.angle]);
        this.rotateTimeoutId = setTimeout(rotateFunction, 500);
      };
      rotateFunction();
    },
    stop: (config) => {
      if (config.isBuiltIn) {
        this.stopCommand();
      }
      this.emit("command", "roll", [0, this.angle]);
    },
    dash: (config, baseSpeed, dashTime) => {
      if (this.dashTimeoutId !== null) {
        clearTimeout(this.dashTimeoutId);
      }
      this.baseSpeed = baseSpeed;
      this.dashTimeoutId = setTimeout(() => {
        this.baseSpeed = 0;
      }, dashTime * 1000);
    },
    roll: (config, speed, degree) => {
      this.emit("command", "roll", [
        this.baseSpeed + speed,
        (360 + degree + this.angle) % 360
      ]);
    }
  };
}

util.inherits(CommandRunner, EventEmitter);

CommandRunner.prototype.setCommands = function(commands) {
  if (commands.length === 1 && commands[0].time === -1) {
    // built-in command
    this.commandFunctions[commands[0].commandName].apply(this, [{
      isBuiltIn: true
    }].concat(commands[0].args));
  } else {
    this.commands = commands;
    this.stopCommand();
    this.loopMethod(0);
  }
};

CommandRunner.prototype.stopCommand = function() {
  if (this.timeoutId !== null) {
    clearTimeout(this.timeoutId);
  }
  if (this.rotateTimeoutId !== null) {
    clearTimeout(this.rotateTimeoutId);
  }
};

CommandRunner.prototype.loopMethod = function(index) {
  if (this.commands.length === 0) {
    throw new Error("実行しようとしたcommandsは空でした。: " + this.key);
  }
  const currentCommand = this.commands[index];
  this.commandFunctions[currentCommand.commandName].apply(this, [{
    isBuiltIn: false
  }].concat(currentCommand.args));
  var nextIndex = index + 1 >= this.commands.length ? 0 : index + 1;
  this.timeoutId = setTimeout(() => {
    this.loopMethod(nextIndex);
  }, currentCommand.time * 1000);
};

module.exports = CommandRunner;

