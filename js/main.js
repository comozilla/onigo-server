var mouseX, mouseY;
var positionX, positionY;
var offsetX, offsetY;
var click = false;
var x, y;

var virtualSphero;

document.addEventListener("DOMContentLoaded",　function() {
  var element = document.getElementById("stick");
  element.addEventListener("mousedown", mousedownStick);
  var rect = element.getBoundingClientRect();
  positionX = rect.left;
  positionY = rect.top;

  virtualSphero = new VirtualSphero();
});

function mousedownStick() {
  click = true;
  document.getElementById("stick").src = "push.png";
}

document.addEventListener("mouseup", function(e) {
  click = false;
  stick.style.left = 25 + 'px';
  stick.style.top = 25 + 'px';
  document.getElementById("stick").src = "stick.png";
});

document.addEventListener("mousedown", function(e) {
  mouseX = e.clientX || e.pageX;
  mouseY = e.clientY || e.pageY;
  offsetX = e.offsetX || e.layerX;
  offsetY = e.offsetY || e.layerY;
});

document.addEventListener("mousemove", function(e) {
  var stick = document.getElementById("stick");
  if (!e) {
    e = window.event;
  }

  if (click) {
    mouseX = e.clientX || e.pageX;
    mouseY = e.clientY || e.pageY; 

    var left = (mouseX - positionX + 25 - offsetX);
    if (left > 50) left = 50;
    if (left < 0) left = 0;
    stick.style.left = left + 'px';

    var top = (mouseY - positionY + 25 - offsetY);
    if (top > 50) top = 50;
    if (top < 0) top = 0;
    stick.style.top = top + 'px';

    virtualSphero.setPosition(left, top, 25);
  }
});