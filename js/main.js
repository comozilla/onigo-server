import TargetManager from "./target-manager";
import SpheroTarget from "./sphero-target";
import Joystick from "./joystick";

// webpack
import "../css/style.css";

var targetManager;
var virtualTarget;
var spheroTarget;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  targetManager = new TargetManager();
  spheroTarget = new SpheroTarget();
  targetManager.add(spheroTarget);
  joystick = new Joystick(targetManager);
});
