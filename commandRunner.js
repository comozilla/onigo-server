var EventEmitter = require("events").EventEmitter;
var util = require("util");

function CommandRunner(key) {
  EventEmitter.call(this);

  this.key = key;
  this.commands = [];
  this.baseSpeed = 0;
  this.angle = 0;
  this.loopTimeoutId = null;
  this.customTimeoutIds = {};
  this.backgroundTimeoutIds = {};
  this.commandFunctions = {
    rotate: (config, turn) => {
      if (config.isBuiltIn) {
        this.stopLoop();
        this.clearCustomTimeoutIds();
      }
      const rotateFunction = () => {
        this.angle = (this.angle + turn) % 360;
        this.emit("command", "roll", [0, this.angle]);
        this.customTimeoutIds.rotate = setTimeout(rotateFunction, 500);
      };
      rotateFunction();
    },
    stop: (config) => {
      if (config.isBuiltIn) {
        this.stopLoop();
        this.clearCustomTimeoutIds();
      }
      this.emit("command", "roll", [0, this.angle]);
    },
    dash: (config, baseSpeed, dashTime) => {
      if (this.backgroundTimeoutIds.dash !== null) {
        clearTimeout(this.backgroundTimeoutIds.dash);
      }
      this.baseSpeed = baseSpeed;
      this.backgroundTimeoutIds.dash = setTimeout(() => {
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
    this.stopLoop();
    this.clearCustomTimeoutIds();
    this.loopMethod(0);
  }
};

CommandRunner.prototype.stopLoop = function() {
  if (this.loopTimeoutId !== null) {
    clearTimeout(this.loopTimeoutId);
  }
};

CommandRunner.prototype.clearCustomTimeoutIds = function() {
  Object.keys(this.customTimeoutIds).forEach(timeoutIdName => {
    const timeoutId = this.customTimeoutIds[timeoutIdName];
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  });
}

CommandRunner.prototype.loopMethod = function(index) {
  if (this.commands.length === 0) {
    throw new Error("実行しようとしたcommandsは空でした。: " + this.key);
  }
  this.clearCustomTimeoutIds();
  const currentCommand = this.commands[index];
  this.commandFunctions[currentCommand.commandName].apply(this, [{
    isBuiltIn: false
  }].concat(currentCommand.args));
  var nextIndex = index + 1 >= this.commands.length ? 0 : index + 1;
  this.loopTimeoutId = setTimeout(() => {
    this.loopMethod(nextIndex);
  }, currentCommand.time * 1000);
};

module.exports = CommandRunner;

