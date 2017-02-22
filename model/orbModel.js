import ComponentBase from "../componentBase";

export default class OrbModel extends ComponentBase {
  constructor() {
    super();

    this.spheroWS = null;
    this.orbs = {};
  }
  setSpheroWS(spheroWS) {
    this.spheroWS = spheroWS;
  }
  add(orbName, orb) {
    this.orbs[orbName] = orb;
  }
  setBattery(orbName, battery) {
    if (this.has(orbName)) {
      this.orbs[orbName].battery = battery;
    }
  }
  setLink(orbName, link) {
    if (this.has(orbName)) {
      this.orbs[orbName].link = link;
    }
  }
  setPingState(orbName, state) {
    if (this.has(orbName)) {
      this.orbs[orbName].pingState = state;
    }
  }
  remove(orbName) {
    if (this.has(orbName)) {
      delete this.orbs[orbName];
    }
  }
  getNames() {
    return Object.keys(this.orbs);
  }
  get(orbName) {
    return this.orbs[orbName];
  }
  getDiff(comparisonOrbMap) {
    const getAddedItem = (before, after) => {
      return after.filter(item => before.indexOf(item) === -1);
    };
    const orbNames = this.getNames();
    const added = getAddedItem(orbNames, comparisonOrbMap.getNames());
    const removed = getAddedItem(comparisonOrbMap.getNames(), orbNames);
    return {
      added,
      removed,
      noChanged: orbNames.filter(item => comparisonOrbMap.has(item))
    };
  }
  has(orbName) {
    return typeof this.orbs[orbName] !== "undefined";
  }
  toArray() {
    return Object.keys(this.orbs).map(orbName => this.orbs[orbName]);
  }

  getUnlinkedOrbs() {
    if (!this.spheroWS) {
      throw new Error("spheroWS is null.");
    }
    return this.spheroWS.spheroServer.getUnlinkedOrbs();
  }

  getOrbFromSpheroWS(orbName) {
    if (!this.spheroWS) {
      throw new Error("spheroWS is null.");
    }
    return this.spheroWS.spheroServer.getOrb(orbName);
  }
}

