export class EventPublisher {
  constructor() {
    this.observeFunctions = {};
  }
  subscribe(subjectName, observeFunction) {
    if (typeof this.observeFunctions[subjectName] === "undefined") {
      this.observeFunctions[subjectName] = [];
    }
    this.observeFunctions[subjectName].push(observeFunction);
  }

  publish(author, subjectName, ...data) {
    if (typeof this.observeFunctions[subjectName] !== "undefined") {
      this.observeFunctions[subjectName].forEach(observeFunction => {
        observeFunction(author, ...data);
      });
    }
  }
}

export default new EventPublisher();
