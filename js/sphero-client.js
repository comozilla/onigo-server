import eventPublisher from "./publisher";

function SpheroClient() {
  this.orb = new sphero();
  var onConnect = function() {
    this.orb.color("red");
  };
  this.orb.connect("ws://localhost:8080", () => {
    onConnect.apply(this, []);
  });

  this.degree = 0;
  eventPublisher.subscribe("rollingDegree", (degree) => {
    this.degree = degree;
    this._roll();
  });
  this.speed = 0;
  eventPublisher.subscribe("rollingSpeed", (speed) => {
    this.speed = speed;
    this._roll();
  });
}

SpheroClient.prototype._roll = function() {
  this.orb.roll(this.speed, this.degree);
}

export default SpheroClient;

