export class EventPublisher {
  constructor() {
    this.observeFunctions = {};
    this.observeFunctionsInModel = {};
  }

  subscribe(subjectName, observeFunction) {
    if (typeof this.observeFunctions[subjectName] === "undefined") {
      this.observeFunctions[subjectName] = [];
    }
    this.observeFunctions[subjectName].push(observeFunction);
  }

  subscribeModel(subjectName, observeFunction) {
    if (typeof this.observeFunctionsInModel[subjectName] === "undefined") {
      this.observeFunctionsInModel[subjectName] = [];
    }
    this.observeFunctionsInModel[subjectName].push(observeFunction);
  }

  publish(author, subjectName, ...data) {
    (this.observeFunctionsInModel[subjectName] || [])
      .concat(this.observeFunctions[subjectName] || [])
      .forEach(observeFunction => {

      observeFunction(author, ...data);
    });
  }
}

export default new EventPublisher();
