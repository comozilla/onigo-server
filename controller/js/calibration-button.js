import eventPublisher from "./publisher";

function CalibrationButton(element) {
  this.isCalibrating = false;
  this.element = element;

  this.element.addEventListener("click", () => {
    this.isCalibrating = !this.isCalibrating;
    this.updateButtonStyle();
    eventPublisher.publish("spheroState",
        this.isCalibrating ? "calibrating" : "idling");
  });
}

// this.isCalibrating の状態に合わせて、UIを更新する
CalibrationButton.prototype.updateButtonStyle = function() {
  if (this.isCalibrating) {
    this.element.classList.add("active-calibration");
  } else {
    this.element.classList.remove("active-calibration");
  }
};

export default CalibrationButton;

