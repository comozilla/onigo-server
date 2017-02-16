import publisher from "./publisher";

export default class ComponentBase {
  constructor(models = {}) {
    Object.keys(models).forEach(modelName => {
      this[modelName] = models[modelName];
    });
  }
  publish(subjectName, ...data) {
    publisher.publish(this, subjectName, ...data);
  }
  subscribeModel(subjectName, observeFunction) {
    publisher.subscribeModel(subjectName, (author, ...data) => {
      observeFunction.apply(this, data);
    });
  }
  subscribe(subjectName, observeFunction) {
    publisher.subscribe(subjectName, (author, ...data) => {
      if (author !== this) {
        observeFunction.apply(this, data);
      }
    });
  }
}
