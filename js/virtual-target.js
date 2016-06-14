import TargetBase from "./target-base";

function VirtualSphero() {
  console.log("fuga");
  this.element = document.getElementById("sphero");
  var style = getComputedStyle(this.element, "");
  this.x = parseInt(style.left);
  this.y = parseInt(style.top);
}

VirtualSphero.prototype = Object.create(TargetBase);
VirtualSphero.prototype.constructor = VirtualSphero;

VirtualSphero.prototype.setPosition = function(x, y) {
  var degree = Math.atan2(x, y);
  degree = 360 - ((degree / Math.PI * 180) + 180);
  var far = 10; //TODO farもpositionからとる
  var radian = (degree * Math.PI / 180);

  this.x += Math.sin(radian) * far;
  this.y -= Math.cos(radian) * far;

  this.fixPosition();
  this.updateSpheroPosition();
};

VirtualSphero.prototype.updateSpheroPosition = function() {
  this.element.style.left = this.x + "px";
  this.element.style.top = this.y + "px";
};

VirtualSphero.prototype.fixPosition = function () {
  this.x = Math.max(this.x, 0);
  this.y = Math.max(this.y, 0);

  this.x = Math.min(this.x, window.innerWidth - 50);
  this.y = Math.min(this.y, window.innerHeight - 50);
};

export default VirtualSphero;

