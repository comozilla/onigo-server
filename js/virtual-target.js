function VirtualSphero() {
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.ctx = this.canvas.getContext("2d");

  this.x = 0;
  this.y = 0;
  this.radius = 25;
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
  this.clearCanvas();
  this.ctx.beginPath();
  this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2, true);
  this.ctx.stroke();

  var logo = new Image();
  logo.src = "logo.png";

  this.ctx.drawImage(logo, this.x + 8, this.y + 8, 30, 30);
};

VirtualSphero.prototype.clearCanvas = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

VirtualSphero.prototype.fixPosition = function () {
  this.x = Math.max(this.x, 0);
  this.y = Math.max(this.y, 0);

  this.x = Math.min(this.x, window.innerWidth - 50);
  this.y = Math.min(this.y, window.innerHeight - 50);
};
