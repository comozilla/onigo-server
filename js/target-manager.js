function TargetManager() {
  this.targets = [];
}

TargetManager.prototype.add = function(spheroInterface) {
  this.targets.push(spheroInterface);
};

TargetManager.prototype.move = function(x, y) {
  this.targets.forEach(target => {
    target.setPosition(x, y);
  });
};

export default TargetManager;

