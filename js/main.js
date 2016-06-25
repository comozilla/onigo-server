import Joystick from "./joystick";
import SpheroStates from "./sphero-states";

// webpack
import "../css/style.css";

var spheroStates;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  spheroStates = new SpheroStates();
  joystick = new Joystick();
});
