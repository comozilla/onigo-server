import eventPublisher from "./publisher";

function SpheroStates() {
  this.state = "idling";
  eventPublisher.subscribe("spheroState", (spheroState) => {
    this.state = spheroState;
  });

  this.rollingSpeed = 0;
  eventPublisher.subscribe("rollingSpeed", (rollingSpeed) => {
    this.rollingSpeed = rollingSpeed;
  });

  this.rollingDegree = 0;
  eventPublisher.subscribe("rollingDegree", (rollingDegree) => {
    this.rollingDegree = rollingDegree;
  });
}

export default SpheroStates;
