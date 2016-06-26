import eventPublisher from "./publisher";

function Joystick() {
  this.movementPerPixel = 1;
  window.addEventListener("resize", () => {
    this.updateMovementPerPixel();
  });
  this.updateMovementPerPixel();
  this.maxDistance = 25;
  this.element = document.querySelector("#stick #draggable");
  this.element.addEventListener("mousedown", () => {
    this.isClick = true;
    this.changeStickColor();
  });
  document.addEventListener("mouseup", () => {
    if (this.isClick) {
      this.isClick = false;
      this.setNeutralPosition();
      this.changeStickColor();
    }
  });
  document.addEventListener("mousemove", (event) => {
    if (this.isClick) {
      this.move(event.movementX * this.movementPerPixel,
        event.movementY * this.movementPerPixel);
    }
  });

  this.isClick = false;
  this.setNeutralPosition();
}

Joystick.prototype.updateMovementPerPixel = function() {
  this.movementPerPixel =
    100 / document.getElementById("stick-box").clientWidth;
};

Joystick.prototype.changeStickColor = function() {
  if (this.isClick) {
    this.element.setAttribute("fill", "#ddd");
  } else {
    this.element.setAttribute("fill", "white");
  }
};

Joystick.prototype.setNeutralPosition = function() {
  this._setPosition(0, 0);
};

Joystick.prototype.move = function(movementX, movementY) {
  var fixedPosition =
    getFixedPosition(this.x + movementX, this.y + movementY, this.maxDistance);
  this._setPosition(fixedPosition.x, fixedPosition.y);
};

Joystick.prototype._setPosition = function(x, y) {
  this.x = x;
  this.y = y;
  this.updateJoystick();

  var degreeAndSpeed = toDegreeAndSpeed(this.x, this.y, this.maxDistance);
  eventPublisher.publish("rollingSpeed", degreeAndSpeed.speed);
  eventPublisher.publish("rollingDegree", degreeAndSpeed.degree);
};

Joystick.prototype.updateJoystick = function() {
  this.element.setAttribute("cx", this.x + 50);
  this.element.setAttribute("cy", this.y + 50);
};

function getFixedPosition(x, y, maxDistance) {
  var distance = getDistance(0, x, 0, y);
  if (getDistance(0, x, 0, y) > maxDistance) {
    var radian = Math.atan2(y, x);
    return {
      x: Math.cos(radian) * maxDistance,
      y: Math.sin(radian) * maxDistance
    };
  }
  return { x, y };
}

function toDegreeAndSpeed(x, y, maxDistance) {
  var degree = Math.atan2(y, x);
  degree = Math.floor((degree / Math.PI * 180 + 450) % 360);

  // getDistanceで取れる値の範囲は、
  // 0～this.maxDistanceである。
  // しかし、degreeは0～255でとりたいので、
  // 修正する
  var magnification = 255 / maxDistance;
  var speed = Math.floor(getDistance(0, x, 0, y) * magnification);
  return { degree, speed };
}

function getDistance(x1, x2, y1, y2) {
  var dx = Math.abs(x1 - x2);
  var dy = Math.abs(y1 - y2);
  // Todo: 平方根を求めるのは重いので変えておく
  return Math.sqrt(dx * dx + dy * dy);
}

export default Joystick;

