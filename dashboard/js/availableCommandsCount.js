import eventPublisher from "./publisher";

export default class AvailableCommandsCount {
  constructor(counter, button) {
    this.counter = counter;
    this.button = button;

    this.availableCommandsCount = 1;

    eventPublisher.on("availableCommandsCount", availableCommandsCount => {
      this.availableCommandsCount = availableCommandsCount;
      this.counter.value = availableCommandsCount;
    });

    this.button.addEventListener("click", () => {
      if (!isNaN(this.counter.value)) {
        eventPublisher.emit("availableCommandsCount", parseInt(this.counter.value));
      }
    });
  }
}
