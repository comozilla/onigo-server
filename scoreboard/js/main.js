import "../css/style.css";
var ko = require("knockout");

const interval = 2000;

var Ranking = function () {
  const self = this;
  self.orbs = ko.observableArray([]);

  self.setOrbs = function (orbs) {
    self.orbs.removeAll();
    orbs = ko.utils.arrayMap(orbs, elm => {
      return new Orb(elm);
    });
    self.orbs.push.apply(self.orbs, orbs);
  }
}

var Orb = function (obj) {
  const self = this;
  self.name = ko.observable(obj.name);
  self.hp = ko.observable(obj.hp);
  self.isTie = ko.observable(obj.isTie);
  
  self.hpColor = ko.computed(() => {
    return self.hp() < 10 ? 'red' : 'white';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const vm = new Ranking();
  ko.applyBindings(vm);
  
  const socket = io();
  let intervalID = null;
  socket.on("data", data => {
    vm.setOrbs(data.ranking);
  });
  
  socket.on("connect", () => {
    console.log("connected");
    
    if (intervalID)
      clearInterval(intervalID);
    
    intervalID = setInterval(() => {
      socket.emit("request");
    }, interval);
  });
});
