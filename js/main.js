var targetManager;
var virtualTarget;
var spheroTarget;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  targetManager = new TargetManager();
  virtualSphero = new VirtualSphero();
  spheroTarget = new SpheroTarget();
  targetManager.add(virtualSphero);
  targetManager.add(spheroTarget);
  joystick = new Joystick(targetManager);
});
