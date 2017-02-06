import publisher from "./publisher";

export default class ComponentBase {
  publish(subjectName, ...data) {
    publisher.publish(this, subjectName, ...data);
  }
  subscribe(subjectName, observeFunction) {
    publisher.subscribe(subjectName, (author, ...data) => {
      if (author !== this) {
        observeFunction(...data);
      }
    });
  }
}
