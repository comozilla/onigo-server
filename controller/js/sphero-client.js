import eventPublisher from "./publisher";

function SpheroClient() {
  this.speedOfAccuracy = 5;
  this.degreeOfAccuracy = 5;
  this.sendInterval = 100;
  this._isBreaking = false;

  this._beforeDegree = 0;
  this.degree = 0;

  this._beforeSpeed = 0;
  this.speed = 0;

  this.orb = new sphero();
  this.orb.connect("ws://localhost:8080", () => {
    this.orb.color("red");
    eventPublisher.subscribe("rollingDegree", (degree) => {
      this._beforeDegree = this.degree;
      this.degree = degree;
      this._roll();
    });
    eventPublisher.subscribe("rollingSpeed", (speed) => {
      this._beforeSpeed = this.speed;
      this.speed = speed;
      this._roll();
    });

    eventPublisher.subscribe("spheroState", (spheroState) => {
      if (spheroState === "idling") {
        this.orb.finishCalibration();
      } else {
        this.orb.startCalibration();
      }
    });
  });
  this.orb.listenCustomMessage("hp", (data) => {
    console.log(data);
    eventPublisher.publish("hp", data.hp);
  });
}

SpheroClient.prototype._roll = function() {
  if (this._isBreaking) {
    return;
  }
  if (Math.abs(this.speed - this._beforeSpeed) > this.speedOfAccuracy ||
      Math.abs(this.degree - this._beforeDegree) > this.degreeOfAccuracy) {
    this._isBreaking = true;
    setTimeout(() => {
      this.orb.roll(this.speed, this.degree);
      this._isBreaking = false;
    }, this.sendInterval);
  }
};

export default SpheroClient;

