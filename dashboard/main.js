var socket = io();

var Link = (function() {
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

  return Link;
})();

var LinkManager = (function() {
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
  return LinkManager;
})();

+function() {
  var gameState = "inactive";
  var availableCommandsCount = 1;

  var gameStateButton;
  var availableCommandsElement;

  var orbNames = [];
  var linkManager;

  document.addEventListener("DOMContentLoaded", () => {
    gameStateButton = document.getElementById("game-state-button");
    availableCommandsElement = document.getElementById("available-commands");
    linkManager = new LinkManager(document.getElementById("links"));

    socket.on("defaultData", (state, count, links, orbs) => {
      gameState = state;
      gameStateButton.textContent = gameState.toUpperCase();

      availableCommandsCount = count;
      availableCommandsElement.value = availableCommandsCount;

      orbNames = orbs;
      linkManager.clientLinks = links;
      Object.keys(linkManager.clientLinks).forEach(clientKey => {
        linkManager.addLink(clientKey, orbNames);
      });
    });

    gameStateButton.addEventListener("click", () => {
      gameState = gameState === "active" ? "inactive" : "active";
      socket.emit("gameState", gameState);

      gameStateButton.textContent = gameState.toUpperCase();
    });

    var setAvailableCommandsButton = document.getElementById("set-available-commands-button");
    setAvailableCommandsButton.addEventListener("click", function() {
      if (!isNaN(availableCommandsElement.value)) {
        availableCommandsCount = parseInt(availableCommandsElement.value);
        socket.emit("availableCommandsCount", availableCommandsCount);
      }
    });

    socket.on("addClient", key => {
      linkManager.addLink(key, orbNames);
    });

    socket.on("removeClient", key => {
      linkManager.removeLink(key);
    });

    socket.on("updateOrbs", orbs => {
      orbNames = orbs;
    });
  });
}();

