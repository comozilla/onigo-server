import {EventEmitter} from "events";

const defaultHp = 100;

export default class Controller extends EventEmitter {
  constructor(client, commandRunner) {
    super();

    this.client = client;
    this.commandRunner = commandRunner;
    this.setHp(defaultHp);
    this.setIsOni(false);
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
}
