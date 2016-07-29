import eventPublisher from "./publisher";

let instance = null;
function SocketManager() {
  if (instance !== null) {
    return instance;
  }
  eventPublisher.on("gameState", this.sendGameState.bind(this));
  eventPublisher.on("rankingState", this.sendRankingState.bind(this));
  eventPublisher.on("availableCommandsCount", this.sendAvailableCommandsCount.bind(this));
  eventPublisher.on("link", this.sendLink.bind(this));
  eventPublisher.on("addOrb", this.sendAddOrb.bind(this));
  eventPublisher.on("disconnect", this.sendDisconnect.bind(this));
  eventPublisher.on("reconnect", this.sendReconnect.bind(this));
  eventPublisher.on("oni", this.sendOni.bind(this));
  eventPublisher.on("checkBattery", this.sendCheckBattery.bind(this));
  eventPublisher.on("resetHp", this.sendResetHp.bind(this));
  eventPublisher.on("pingAll", this.sendPingAll.bind(this));
  eventPublisher.on("color", this.sendColor.bind(this));

  this.socket = io();
  this.socket.on("defaultData", (state, count, controllers, orbs, unnameds) => {
    emit.call(this, "gameState", [state]);
    emit.call(this, "availableCommandsCount", [count]);
    emit.call(this, "orbs", [orbs]);
    emit.call(this, "defaultControllers", [controllers]);
    emit.call(this, "defaultUnnameds", [unnameds]);
  });
  this.socket.on("addUnnamed", key => {
    emit.call(this, "addUnnamed", [key]);
  });
  this.socket.on("named", (key, name, controllerDetails) => {
    emit.call(this, "named", [key, name, controllerDetails]);
  });
  this.socket.on("removeUnnamed", key => {
    emit.call(this, "removeUnnamed", [key]);
  });
  this.socket.on("removeClient", key => {
    emit.call(this, "removeClient", [key]);
  });
  this.socket.on("updateOrbs", orbs => {
    emit.call(this, "orbs", [orbs]);
  });
  this.socket.on("hp", (key, hp) => {
    emit.call(this, "hp", [key, hp]);
  });
  this.socket.on("log", (logText, logType) => {
    emit.call(this, "log", [logText, logType]);
  });
  this.socket.on("streamed", (orbName, time) => {
    emit.call(this, "streamed", [orbName, time]);
  });
  this.socket.on("successReconnect", orbName => {
    emit.call(this, "successReconnect", [orbName]);
  });

  instance = this;
}

SocketManager.prototype.sendGameState = function(gameState) {
  this.socket.emit("gameState", gameState);
};

SocketManager.prototype.sendRankingState = function(rankingState) {
  this.socket.emit("rankingState", rankingState);
};

SocketManager.prototype.sendAvailableCommandsCount = function(availableCommandsCount) {
  this.socket.emit("availableCommandsCount", availableCommandsCount);
};

SocketManager.prototype.sendLink = function(controllerName, orbName) {
  this.socket.emit("link", controllerName, orbName);
};

SocketManager.prototype.sendAddOrb = function(name, port) {
  this.socket.emit("addOrb", name, port);
};

SocketManager.prototype.sendDisconnect = function(name) {
  this.socket.emit("removeOrb", name);
};

SocketManager.prototype.sendReconnect = function(name) {
  this.socket.emit("orbReconnect", name);
};

SocketManager.prototype.sendOni = function(controllerName, isEnabled) {
  this.socket.emit("oni", controllerName, isEnabled);
};

SocketManager.prototype.sendCheckBattery = function() {
  this.socket.emit("checkBattery");
};

SocketManager.prototype.sendResetHp = function(controllerName) {
  this.socket.emit("resetHp", controllerName);
};

SocketManager.prototype.sendPingAll = function() {
  this.socket.emit("pingAll");
};

SocketManager.prototype.sendColor = function(controllerName, color) {
  this.socket.emit("color", controllerName, color);
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

