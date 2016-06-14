import TargetBase from "./target-base";

function SpheroTarget() {
  this.orb = new sphero();
  var onConnect = function() {
    this.orb.color("red");
  };
  var self = this;
  this.orb.connect("ws://localhost:8080", function() {
    onConnect.apply(self, []);
  });
}

SpheroTarget.prototype = Object.create(TargetBase);
SpheroTarget.prototype.constructor = SpheroTarget;

SpheroTarget.prototype.setPosition = function(x, y) {
  var degree = Math.atan2(x, y);
  degree = 360 - ((degree / Math.PI * 180) + 180);

  var far = 100; //TODO farもpositionからとる

  this.orb.roll(far, degree);
}

export default SpheroTarget;

