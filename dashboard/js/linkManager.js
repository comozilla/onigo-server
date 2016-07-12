import {EventEmitter} from "events";
import Link from "./link";

export default class LinkManager extends EventEmitter {
  constructor(element) {
    super();
    this.element = element;
    this.linkInstances = [];
    this.clientLinks = {};
  }
  addLink(clientKey, orbNames) {
    let defaultLinkedOrb = this.clientLinks[clientKey];
    if (typeof defaultLinkedOrb === "undefined") {
      defaultLinkedOrb = null;
    }
    const link = new Link(clientKey, orbNames, defaultLinkedOrb);
    link.on("change", orbName => {
      this.emit("change", clientKey, orbName);
    });
    this.element.appendChild(link.element);
    this.linkInstances.push(link);
  }
  removeLink(clientKey) {
    let keyIndex = this.linkInstances.map(instance => instance.clientKey).indexOf(clientKey);
    if (keyIndex === -1) {
      throw new Error("removeしようとしたclientKeyは存在しませんでした。 : " + clientKey);
    }
    this.element.removeChild(this.linkInstances[keyIndex].element);
    this.linkInstances.splice(keyIndex, 1);
  }
}

