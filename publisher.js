export default class EventPublisher {
  constructor() {
    this.observeFunctions = {};
    this.observeFunctionsInModel = {};
  }

  subscribe(subjectName, observeFunction) {
    if (!this.observeFunctions[subjectName]) {
      this.observeFunctions[subjectName] = [];
    }
    this.observeFunctions[subjectName].push(observeFunction);
  }

  subscribeModel(subjectName, observeFunction) {
    if (!this.observeFunctionsInModel[subjectName]) {
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

