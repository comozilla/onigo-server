const observeFunctions = {};

export function subscribe(subjectName, observeFunction) {
  if (typeof observeFunctions[subjectName] === "undefined") {
    observeFunctions[subjectName] = [];
  }
  observeFunctions[subjectName].push(observeFunction);
}

export function publish(author, subjectName, ...data) {
  if (typeof observeFunctions[subjectName] !== "undefined") {
    observeFunctions[subjectName].forEach(observeFunction => {
      observeFunction(author, ...data);
    });
  }
}
