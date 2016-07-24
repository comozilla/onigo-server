import { EventEmitter } from "events";

const defaultHp = 100;

export default class Controller extends EventEmitter {
  constructor(client, commandRunner) {
    super();

    this.client = client;
    this.commandRunner = commandRunner;
    this.name = null;
    this.setHp(defaultHp);
    this.setIsOni(false);
    this.setLink(null);
  }
  setHp(hp) {
    this.hp = hp;
    this.client.sendCustomMessage("hp", { hp: this.hp });
    this.emit("hp", this.hp);
  }
  setIsOni(isOni) {
    this.isOni = isOni;
    this.client.sendCustomMessage("oni", this.isOni);
  }
  setLink(orbName) {
    this.link = orbName;
  }
  setName(name) {
    this.name = name;
  }
  getStates() {
    return {
      hp: this.hp,
      isOni: this.isOni,
      link: this.link
    };
  }
}
