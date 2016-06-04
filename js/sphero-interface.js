function SpheroInterface() {
  var orb = new sphero();
  orb.connect("ws://10.11.12.148:8080", function() {
    orb.color("FF00FF");
  });
}

SpheroInterface.prototype = Object.create(InterfaceBase);
SpheroInterface.prototype.constructor = SpheroInterface;

SpheroInterface.prototype.setPosition = function(x, y) {
  var degree = Math.atan2(x, y);
  degree = 360 - ((degree / Math.PI * 180) + 180);
  console.log(degree);
  var far = 10; //TODO farもpositionからとる
  var radian = (degree * Math.PI / 180);

  this.x += Math.sin(radian) * far;
  this.y -= Math.cos(radian) * far;

  this.updateSpheroPosition();
}
