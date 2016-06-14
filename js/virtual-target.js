import TargetBase from "./target-base";

function VirtualTarget() {
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.ctx = this.canvas.getContext("2d");

  this.x = 0;
  this.y = 0;
  this.ex = 0;
  this.ey = 0;
  this.radius = 25;

  var tick = function() {
    this.x += this.ex;
    this.y += this.ey;
    this.fixPosition();
    this.updateSpheroPosition();
    requestAnimationFrameWithScope(tick, this);
  };

  requestAnimationFrameWithScope(tick, this);
}

VirtualTarget.prototype = Object.create(TargetBase);
VirtualTarget.prototype.constructor = VirtualTarget;

VirtualTarget.prototype.setPosition = function(x, y) {
  var degree = Math.atan2(x, y);
  degree = 360 - ((degree / Math.PI * 180) + 180);
  var far = 10; //TODO farもpositionからとる
  var radian = (degree * Math.PI / 180);

  if (x === 0) {
    this.ex = 0;
  } else {
    this.ex = Math.sin(radian) * far;
  }
  if (y === 0) {
    this.ey = 0;
  } else {
    this.ey = -Math.cos(radian) * far;
  }
};

VirtualTarget.prototype.updateSpheroPosition = function() {
  this.clearCanvas();
  this.ctx.beginPath();
  this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2, true);
  this.ctx.stroke();

  var logo = new Image();
  logo.src = "logo.png";

  this.ctx.drawImage(logo, this.x + 8, this.y + 8, 30, 30);
};

VirtualTarget.prototype.clearCanvas = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

VirtualTarget.prototype.fixPosition = function () {
  this.x = Math.max(this.x, 0);
  this.y = Math.max(this.y, 0);

  this.x = Math.min(this.x, window.innerWidth - 50);
  this.y = Math.min(this.y, window.innerHeight - 50);
};

function requestAnimationFrameWithScope(callback, scope) {
  requestAnimationFrame(function() {
    callback.apply(scope, []);
  });
}

export default VirtualTarget;
