import eventPublisher from "./publisher";

export default class UnnamedControllers {
  constructor(element) {
    this.element = element;
    this.unnamedKeys = [];
    eventPublisher.on("defaultUnnameds", unnameds => {
      unnameds.forEach(key => {
        this.addUnnamed(key);
      });
    });
    eventPublisher.on("addUnnamed", key => {
      this.addUnnamed(key);
    });
    eventPublisher.on("removeUnnamed", key => {
      this.removeUnnamed(key);
    });
    eventPublisher.on("named", (key, name, controllerDetails) => {
      this.removeUnnamed(key);
    });
  }
  addUnnamed(key) {
    const listItem = document.createElement("li");
    listItem.textContent = key;
    this.element.appendChild(listItem);
    this.unnamedKeys.push(key);
  }
  removeUnnamed(key) {
    const index = this.unnamedKeys.indexOf(key);
    if (index === -1) {
      throw new Error("removeUnnamedしようとしましたが、key " + key + " は存在しませんでした。");
    }
    this.element.removeChild(this.element.children[index]);
    this.unnamedKeys.splice(index, 1);
  }
}
