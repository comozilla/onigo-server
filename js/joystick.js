function Joystick(interfaceManager) {
  this.interfaceManager = interfaceManager;
  this.element = document.getElementById("stick");
  this.element.addEventListener("mousedown", () => {
    this.isClick = true;
    this.changeStickImage();
  });
  document.addEventListener("mouseup", () => {
    if (this.isClick) {
      this.isClick = false;
      this.setNeutralPosition();
      this.changeStickImage();
    }
  });
  document.addEventListener("mousemove", (event) => {
    if (this.isClick) {
      this.setPosition(event.movementX, event.movementY);
      this.interfaceManager.move(this.x, this.y);
    }
  });

  this.isClick = false;
  this.setNeutralPosition();
}

Joystick.prototype.changeStickImage = function() {
  if (this.isClick) {
    this.element.src = "push.png";
  } else {
    this.element.src = "stick.png";
  }
};

Joystick.prototype.setNeutralPosition = function() {
  this.x = 0;
  this.y = 0;
  this.updateJoystick();
};

Joystick.prototype.setPosition = function(movementX, movementY) {
  this.x = fixPosition(this.x + movementX);
  this.y = fixPosition(this.y + movementY);
  this.updateJoystick();
};

Joystick.prototype.updateJoystick = function() {
  this.element.style.left = (this.x + 25) + "px";
  this.element.style.top = (this.y + 25) + "px";
};

function fixPosition(beforePosition) {
  var result = beforePosition;
  result = Math.max(result, -25);
  result = Math.min(result, 25);
  return result;
}
