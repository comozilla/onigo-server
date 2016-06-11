function Joystick(targetManager) {
  this.targetManager = targetManager;
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
      this.setPosition(event.movementX, event.movementY);
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
  this.x = 0;
  this.y = 0;
  this.updateJoystick();
  this.targetManager.move(this.x, this.y);
};

Joystick.prototype.setPosition = function(movementX, movementY) {
  this.x = fixPosition(this.x + movementX);
  this.y = fixPosition(this.y + movementY);
  this.updateJoystick();
  this.targetManager.move(this.x, this.y);
};

Joystick.prototype.updateJoystick = function() {
  this.element.setAttribute("cx", this.x + 50);
  this.element.setAttribute("cy", this.y + 50);
};

function fixPosition(beforePosition) {
  var result = beforePosition;
  result = Math.max(result, -25);
  result = Math.min(result, 25);
  return result;
}
