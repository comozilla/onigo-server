var virtualSphero;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  virtualSphero = new VirtualSphero();
  joystick = new Joystick(virtualSphero);
});