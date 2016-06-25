import Joystick from "./joystick";
import SpheroStates from "./sphero-states";
import SpheroClient from "./sphero-client";

// webpack
import "../css/style.css";

var spheroStates;
var spheroClient;
var joystick;

document.addEventListener("DOMContentLoaded",　function() {
  spheroStates = new SpheroStates();
  spheroClient = new SpheroClient();
  joystick = new Joystick();
});
