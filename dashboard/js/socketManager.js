import eventPublisher from "./publisher";

let instance = null;
function SocketManager() {
  if (instance !== null) {
    return instance;
  }
  eventPublisher.on("gameState", this.sendGameState.bind(this));
  eventPublisher.on("availableCommandsCount", this.sendAvailableCommandsCount.bind(this));
  eventPublisher.on("link", this.sendLink.bind(this));
  eventPublisher.on("addOrb", this.sendAddOrb.bind(this));
  eventPublisher.on("disconnect", this.sendDisconnect.bind(this));
  eventPublisher.on("oni", this.sendOni.bind(this));
  eventPublisher.on("checkBattery", this.sendCheckBattery.bind(this));
  eventPublisher.on("resetHp", this.sendResetHp.bind(this));

  this.socket = io();
  this.socket.on("defaultData", (state, count, controllers, orbs) => {
    console.log(controllers);
    emit.call(this, "gameState", [state]);
    emit.call(this, "availableCommandsCount", [count]);
    emit.call(this, "orbs", [orbs]);
    emit.call(this, "defaultControllers", [controllers]);
  });
  this.socket.on("addController", (key, controllerDetails) => {
    emit.call(this, "addController", [key, controllerDetails]);
  });
  this.socket.on("removeController", key => {
    emit.call(this, "removeController", [key]);
  });
  this.socket.on("updateOrbs", orbs => {
    emit.call(this, "orbs", [orbs]);
  });
  this.socket.on("hp", (key, hp) => {
    emit.call(this, "hp", [key, hp]);
  });

  instance = this;
}

SocketManager.prototype.sendGameState = function(gameState) {
  this.socket.emit("gameState", gameState);
};

SocketManager.prototype.sendAvailableCommandsCount = function(availableCommandsCount) {
  this.socket.emit("availableCommandsCount", availableCommandsCount);
};

SocketManager.prototype.sendLink = function(controllerKey, orbName) {
  this.socket.emit("link", controllerKey, orbName);
};

SocketManager.prototype.sendAddOrb = function(name, port) {
  this.socket.emit("addOrb", name, port);
};

SocketManager.prototype.sendDisconnect = function(name) {
  this.socket.emit("removeOrb", name);
};

SocketManager.prototype.sendOni = function(controllerKey, isEnabled) {
  this.socket.emit("oni", controllerKey, isEnabled);
};

SocketManager.prototype.sendCheckBattery = function() {
  this.socket.emit("checkBattery");
};

SocketManager.prototype.sendResetHp = function(controllerKey) {
  this.socket.emit("resetHp", controllerKey);
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
  eventPublisher.emit.apply(eventPublisher, [eventName].concat(args));
  if (typeof this[methodName] !== "undefined") {
    eventPublisher.on(eventName, this[methodName].bind(this));
  }
}

export default SocketManager;

