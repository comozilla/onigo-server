import "../css/style.css";
var ko = require("knockout");

const interval = 2000;

const Ranking = function () {
  this.orbs = ko.observableArray([]);

  this.setOrbs = orbs => {
    this.orbs.removeAll();
    orbs = ko.utils.arrayMap(orbs, elm => {
      return new Orb(elm);
    });
    this.orbs.push.apply(this.orbs, orbs);
  }
}

const Orb = function (obj) {
  this.name = ko.observable(obj.name);
  this.hp = ko.observable(obj.hp);
  this.isTie = ko.observable(obj.isTie);

  this.hpColor = ko.computed(() => {
    return this.hp() < 10 ? 'red' : 'white';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const ranking = new Ranking();
  ko.applyBindings(ranking);

  const socket = io();
  let intervalID = null;
  socket.on("data", data => {
    ranking.setOrbs(data.ranking);
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
