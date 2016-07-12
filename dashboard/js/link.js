function Link(clientKey, orbs, defaultLinkedOrb) {
  this.clientKey = clientKey;
  this.orbs = orbs;
  this.linkedOrb = defaultLinkedOrb;

  this.element = document.createElement("tr");

  this.clientElement = document.createElement("td");
  this.clientElement.textContent = this.clientKey;
  this.element.appendChild(this.clientElement);

  this.orbSelectElement = document.createElement("select");
  var orbSelectTd = document.createElement("td");
  orbSelectTd.appendChild(this.orbSelectElement);
  this.element.appendChild(orbSelectTd);
  updateOrbSelect.call(this);
}

Link.prototype.updateOrbs = function(orbs) {
  this.orbs = orbs;
  updateOrbSelect.call(this);
};

var updateOrbSelect = function() {
  this.orbSelectElement.innerHTML = "";
  var editedOrbs = this.orbs.slice();
  editedOrbs.unshift("-- unlinked --");
  editedOrbs.forEach(orbName => {
    var item = document.createElement("option");
    item.value = orbName;
    item.textContent = orbName;
    this.orbSelectElement.appendChild(item);
  });
};

export default Link;

