function InterfaceManager() {
  this.interfaces = [];
}

InterfaceManager.prototype.add = function(spheroInterface) {
  this.interfaces.push(spheroInterface);
};

InterfaceManager.prototype.move = function(x, y) {
  this.interfaces.forEach(spheroInterface => {
    spheroInterface.setPosition(x, y);
  });
};

