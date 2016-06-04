function VirtualSphero() {
  this.element = document.getElementById("sphero");
  var style = getComputedStyle(this.element, "");
  this.x = parseInt(style.left);
  this.y = parseInt(style.top);
}

VirtualSphero.prototype.setPosition = function(x, y, center) {
  var degree = Math.atan2(x - center, y - center);
  degree = 360 - ((degree / Math.PI * 180) + 180);//
  console.log(degree);
  var far = 10; //TODO farもpositionからとる
  var radian = (degree * Math.PI / 180);

  this.x += Math.sin(radian) * far;
  this.y -= Math.cos(radian) * far;

  this.updateSpheroPosition();
};

VirtualSphero.prototype.updateSpheroPosition = function() {
  this.element.style.left = this.x + "px";
  this.element.style.top = this.y + "px";
};