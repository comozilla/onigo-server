import ComponentBase from "./componentBase";

class Connector extends ComponentBase {
  constructor(models) {
    super(models);

    this.rawOrbs = {};

    this.originalError = console.error;

    console.error = (message) => {
      const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code (121|1167)/.exec(message);
      if (exec121Error) {
        const port = exec121Error[2];
        if (this.isConnecting(port)) {
          this.publish("incrementError121Count");
          if (this.appModel.error121Count < 5) {
            this.publish("log", `Catched 121 error. Reconnecting... (${models.appModel.error121Count})`, "warning");
            this.reconnect(port);
          } else {
            this.publish("resetError121Count")
            this.publish("log", "Catched 121 error. But this is 5th try. Give up.", "warning");
            this.giveUp(port);
          }
        } else {
          this.publish("log", "Catched 121 error. But port is invalid.", "error");
        }
      } else {
        this.publish("log", "Catched unknown error: \n" + message.toString(), "error");
      }
      this.originalError(message);
    };
  }
  connect(port, rawOrb) {
    if (this.isConnecting(port)) {
      throw new Error("connectしようとしたorbのportは既に存在しています。port: " + port);
    }
    return new Promise(resolve => {
      this.rawOrbs[port] = { rawOrb, resolve };
      this.rawOrbs[port].rawOrb.connect(() => {
        resolve();
        delete this.rawOrbs[port];
      });
    });
  }
  isConnecting(port) {
    return typeof this.rawOrbs[port] !== "undefined";
  }
  reconnect(port) {
    if (!this.isConnecting(port)) {
      throw new Error("reconnectしようとしましたが、connectしていません。port: " + port);
    }
    this.rawOrbs[port].rawOrb.connect(() => {
      if (this.isConnecting(port)) {
        this.rawOrbs[port].resolve();
        delete this.rawOrbs[port];
      }
    });
  }
  giveUp(port) {
    if (this.isConnecting(port)) {
      delete this.rawOrbs[port];
    }
  }
}

export default Connector;
