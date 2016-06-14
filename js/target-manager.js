function TargetManager() {
  this.targets = [];
}

TargetManager.prototype.add = function(spheroTarget) {
  this.targets.push(spheroTarget);
};

TargetManager.prototype.move = function(x, y) {
  this.targets.forEach(target => {
    target.setPosition(x, y);
  });
};

export default TargetManager;

