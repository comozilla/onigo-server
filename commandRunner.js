import ComponentBase from "./componentBase";

export default class CommandRunner extends ComponentBase {
  constructor(key) {
    super();

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
          this.publish("command", key, "roll", [0, this.angle]);
          this.customTimeoutIds.rotate = setTimeout(rotateFunction, 500);
        };
        rotateFunction();
      },
      stop: config => {
        if (config.isBuiltIn) {
          this.stopLoop();
          this.clearCustomTimeoutIds();
        }
        this.publish("command", key, "roll", [0, this.angle]);
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
        this.publish("command", key, "roll", [
          this.baseSpeed + speed,
          (360 + degree + this.angle) % 360
        ]);
      }
    };
  }

  setCommands(commands) {
    if (commands.length === 1 && commands[0].time === -1) {
      // built-in command
      this.commandFunctions[commands[0].commandName].apply(this, [{
        isBuiltIn: true
      }].concat(processArguments(commands[0].args)));
    } else {
      this.commands = commands;
      this.stopLoop();
      this.clearCustomTimeoutIds();
      this.loopMethod(0);
    }
  }

  stopLoop() {
    if (this.loopTimeoutId !== null) {
      clearTimeout(this.loopTimeoutId);
    }
  }

  clearCustomTimeoutIds() {
    Object.keys(this.customTimeoutIds).forEach(timeoutIdName => {
      const timeoutId = this.customTimeoutIds[timeoutIdName];
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });
  }

  loopMethod(index) {
    if (this.commands.length === 0) {
      throw new Error("実行しようとしたcommandsは空でした。: " + this.key);
    }
    this.clearCustomTimeoutIds();
    const currentCommand = this.commands[index];
    this.commandFunctions[currentCommand.commandName].apply(this, [{
      isBuiltIn: false
    }].concat(processArguments(currentCommand.args)));
    var nextIndex = index + 1 >= this.commands.length ? 0 : index + 1;
    this.loopTimeoutId = setTimeout(() => {
      this.loopMethod(nextIndex);
    }, currentCommand.time * 1000);
  }
}

// コマンドの引数にmotionSpecialDataがあった場合、それを実際の値に変更する
function processArguments(args) {
  return args.map(arg => {
    if (typeof arg === "object" && arg.isMotionSpecialData) {
      switch (arg.dataName) {
      case "randomRange":
        return Math.floor(Math.random() * (arg.args[1] - arg.args[0])) + arg.args[0];
      case "randomInArray":
        return arg.args[0][Math.floor(Math.random() * arg.args[0].length)];
      }
    } else {
      return arg;
    }
  });
}

