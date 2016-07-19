export default class OrbMap {
  constructor() {
    this.orbs = {};
  }
  set(orbName, orb) {
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
  setIndex(orbName, index) {
    if (this.has(orbName)) {
      this.orbs[orbName].index = index;
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
  getDiff(comparisonOrbs) {
    const getAddedItem = (before, after) => {
      const addedIndexes = [];
      return after.filter((item, index) => {
        const isLeave = before.indexOf(item) === -1;
        if (isLeave) {
          addedIndexes.push(index);
        }
        return isLeave;
      }).map((item, index) => { return { index: addedIndexes[index], item } });
    };
    const orbNames = this.getNames();
    const added = getAddedItem(orbNames, comparisonOrbs);
    const removed = getAddedItem(comparisonOrbs, orbNames);
    return {
      added,
      removed,
      noChanged: orbNames.filter(item => comparisonOrbs.indexOf(item) >= 0)
    };
  }
  has(orbName) {
    return typeof this.orbs[orbName] !== "undefined";
  }
}
