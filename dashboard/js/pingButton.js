import eventPublisher from "./publisher";
export default class PingButton {
  constructor(element) {
    this.element = element;
    this.element.addEventListener("click", () => {
      eventPublisher.emit("pingAll");
    });
  }
}
