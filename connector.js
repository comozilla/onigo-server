class Connector {
  constructor() {
    this.rawOrbs = {};
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
