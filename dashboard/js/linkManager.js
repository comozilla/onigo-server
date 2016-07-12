import eventPublisher from "./publisher";
import Link from "./link";

export default class LinkManager {
  constructor(element) {
    this.element = element;
    this.linkInstances = [];
    this.clientLinks = {};
    this.orbNames = [];

    eventPublisher.on("defaultLinks", links => {
      this.clientLinks = links;
      Object.keys(links).forEach(clientKey => {
        this.clientLinks[clientKey] = null;
        this.addLink(clientKey, this.orbNames);
      });
    });
    eventPublisher.on("addClient", key => {
      this.clientLinks[key] = null;
      this.addLink(key, this.orbNames);
    });
    eventPublisher.on("removeClient", key => {
      delete this.clientLinks[key];
      this.removeLink(key);
    });
    eventPublisher.on("orbs", orbs => {
      this.orbNames = orbs;
    });
  }
  addLink(clientKey, orbNames) {
    const link = new Link(clientKey, orbNames, this.clientLinks[clientKey]);
    link.on("change", orbName => {
      this.clientLinks[clientKey] = orbName;
      eventPublisher.emit("link", clientKey, orbName);
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

