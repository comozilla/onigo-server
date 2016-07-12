function LinkManager(element) {
  this.element = element;
  this.linkInstances = [];
  this.clientLinks = {};
}

LinkManager.prototype.addLink = function(clientKey, orbNames) {
  var defaultLinkedOrb = this.clientLinks[clientKey];
  if (typeof defaultLinkedOrb === "undefined") {
    defaultLinkedOrb = null;
  }
  var link = new Link(clientKey, orbNames, defaultLinkedOrb);
  this.element.appendChild(link.element);
  this.linkInstances.push(link);
};
LinkManager.prototype.removeLink = function(clientKey) {
  var keyIndex = this.linkInstances.map(instance => instance.clientKey).indexOf(clientKey);
  if (keyIndex === -1) {
    throw new Error("removeしようとしたclientKeyは存在しませんでした。 : " + clientKey);
  }
  this.element.removeChild(this.linkInstances[keyIndex].element);
  this.linkInstances.splice(keyIndex, 1);
};

export default LinkManager;

