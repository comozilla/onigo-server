import eventPublisher from "./publisher";

function Joystick() {
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
      this.move(event.movementX, event.movementY);
    }
  });

  this.isClick = false;
  this.setNeutralPosition();
}

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
    getFixedPosition(this.x + movementX, this.y + movementY);
  this._setPosition(fixedPosition.x, fixedPosition.y);
  //this.targetManager.move(this.x, this.y);
};

Joystick.prototype._setPosition = function(x, y) {
  this.x = x;
  this.y = y;
  this.updateJoystick();
};

Joystick.prototype.updateJoystick = function() {
  this.element.setAttribute("cx", this.x + 50);
  this.element.setAttribute("cy", this.y + 50);
};

function getFixedPosition(x, y) {
  const maxDistance = 25;
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

function toDegreeAndPower(x, y) {
  var degree = Math.atan2(y, x);
  degree = 360 - ((degree / Math.PI * 180) + 180);

  var far = getDistance(0, x, 0, y);
  return { degree, far };
}

function getDistance(x1, x2, y1, y2) {
  var dx = Math.abs(x1 - x2);
  var dy = Math.abs(y1 - y2);
  // Todo: 平方根を求めるのは重いので変えておく
  return Math.sqrt(dx * dx + dy * dy);
}

export default Joystick;

