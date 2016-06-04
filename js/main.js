var interfaceManager;
var virtualSphero;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  interfaceManager = new InterfaceManager();
  virtualSphero = new VirtualSphero();
  interfaceManager.add(virtualSphero);
  joystick = new Joystick(interfaceManager);
});
