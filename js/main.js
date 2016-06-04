var interfaceManager;
var virtualSphero;
var spheroInterface;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  interfaceManager = new InterfaceManager();
  virtualSphero = new VirtualSphero();
  spheroInterface = new SpheroInterface();
  interfaceManager.add(virtualSphero);
  interfaceManager.add(spheroInterface);
  joystick = new Joystick(interfaceManager);
});
