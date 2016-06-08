function SpheroInterface() {
  this.orb = new sphero();
  this.orb.connect("ws://localhost:8080", function() {
    orb.color("red");
  });
}

SpheroInterface.prototype = Object.create(InterfaceBase);
SpheroInterface.prototype.constructor = SpheroInterface;

SpheroInterface.prototype.setPosition = function(x, y) {
  var degree = Math.atan2(x, y);
  degree = 360 - ((degree / Math.PI * 180) + 180);

  var far = 100; //TODO farもpositionからとる

  this.orb.roll(far, degree);
}
