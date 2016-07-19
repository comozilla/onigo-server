import eventPublisher from "./publisher";
export default class CheckBatteryButton {
  constructor(element) {
    this.element = element;
    this.element.addEventListener("click", () => {
      eventPublisher.emit("checkBattery");
    });
  }
}
