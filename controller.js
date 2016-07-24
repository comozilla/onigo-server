import { EventEmitter } from "events";

const defaultHp = 100;

export default class Controller extends EventEmitter {
  constructor(name, commandRunner) {
    super();

    this.client = null;
    this.commandRunner = commandRunner;
    this.name = name;
    this.setHp(defaultHp);
    this.setIsOni(false);
    this.setLink(null);
  }
  setHp(hp) {
    this.hp = hp;
    if (this.client !== null) {
      this.client.sendCustomMessage("hp", { hp: this.hp });
    }
    this.emit("hp", this.hp);
  }
  setIsOni(isOni) {
    this.isOni = isOni;
    if (this.client !== null) {
      this.client.sendCustomMessage("oni", this.isOni);
    }
  }
  setLink(orbName) {
    this.link = orbName;
  }
  setClient(client) {
    this.client = client;
    this.client.sendCustomMessage("hp", { hp: this.hp });
    this.client.sendCustomMessage("oni", this.isOni);
  }
  getStates() {
    return {
      hp: this.hp,
      isOni: this.isOni,
      link: this.link,
      key: this.client !== null ? this.client.key : null
    };
  }
}
