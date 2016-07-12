import eventPublisher from "./publisher";

let instance = null;
function SocketManager() {
  if (instance !== null) {
    return instance;
  }
  eventPublisher.on("gameState", this.sendGameState.bind(this));
  eventPublisher.on("availableCommandsCount", this.sendAvailableCommandsCount.bind(this));
  eventPublisher.on("link", this.sendLink.bind(this));

  this.socket = io();
  this.socket.on("defaultData", (state, count, links, orbs) => {
    emit.call(this, "gameState", [state]);
    emit.call(this, "availableCommandsCount", [count]);
    emit.call(this, "orbs", [orbs]);
    emit.call(this, "defaultLinks", [links]);
  });
  this.socket.on("addClient", key => {
    emit.call(this, "addClient", [key]);
  });
  this.socket.on("removeClient", key => {
    emit.call(this, "removeClient", [key]);
  });
  this.socket.on("updateOrbs", orbs => {
    emit.call(this, "orbs", [orbs]);
  });

  instance = this;
}

SocketManager.prototype.sendGameState = function(gameState) {
  this.socket.emit("gameState", gameState);
};

SocketManager.prototype.sendAvailableCommandsCount = function(availableCommandsCount) {
  this.socket.emit("availableCommandsCount", availableCommandsCount);
};

SocketManager.prototype.sendLink = function(clientKey, orbName) {
  this.socket.emit("link", clientKey, orbName);
};

// eventPublisher.emit をする。
// その時、自分が on している listener は呼び出さないよう、
// listenerをいったん削除して、emitしたあと追加している。
// listenerの名前は、send<eventName（一文字目大文字）>とする。
function emit(eventName, args) {
  const methodName =
    "send" + eventName.substring(0, 1).toUpperCase() + eventName.substring(1);
  if (typeof this[methodName] !== "undefined") {
    eventPublisher.removeListener(eventName, this[methodName].bind(this));
  }
  let emitArgs = args;
  args.unshift(eventName);
  eventPublisher.emit.apply(eventPublisher, emitArgs);
  if (typeof this[methodName] !== "undefined") {
    eventPublisher.on(eventName, this[methodName].bind(this));
  }
}

export default SocketManager;

