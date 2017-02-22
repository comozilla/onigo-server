import { EventEmitter } from "events";

const defaultHp = 100;
const defaultColor = "green";

export default class Controller extends EventEmitter {
  constructor(name, commandRunner) {
    super();

    this.client = null;
    this.commandRunner = commandRunner;
    this.name = name;
    this.setHp(defaultHp);
    this.setIsOni(false);
    this.setLink(null);
    this.setColor(defaultColor);
  }
  setHp(hp) {
    this.hp = hp;
    if (this.client) {
      this.client.sendCustomMessage("hp", this.hp);
    }
    this.emit("hp", this.hp);
  }
  setIsOni(isOni) {
    this.isOni = isOni;
    if (this.client) {
      this.client.sendCustomMessage("oni", this.isOni);
    }
    this.emit("oni", this.isOni);
  }
  setLink(orb) {
    // client も持っているが、それに左右されずにするため link は別に持つ必要がある
    this.linkedOrb = orb;
    if (this.client) {
      if (!orb) {
        this.client.unlink();
      } else {
        this.client.setLinkedOrb(orb);
      }
    }
    updateColor.call(this);
  }
  setClient(client) {
    this.client = client;
    if (this.client) {
      this.client.sendCustomMessage("hp", this.hp);
      this.client.sendCustomMessage("oni", this.isOni);
      this.client.sendCustomMessage("color", this.color);
      if (this.linkedOrb) {
        // HPなどの Orb -> Client への伝達で、
        // client にも linkedOrb を入れておく必要がある。
        this.client.setLinkedOrb(this.linkedOrb);
      }
    }
  }
  setColor(color) {
    this.color = color;
    updateColor.call(this);
    if (this.client) {
      this.client.sendCustomMessage("color", this.color);
    }
  }
  getStates() {
    return {
      hp: this.hp,
      isOni: this.isOni,
      link: this.linkedOrb ? this.linkedOrb.name : null,
      key: this.client ? this.client.key : null,
      color: this.color
    };
  }
}

function updateColor() {
  if (this.linkedOrb) {
    this.linkedOrb.command("color", [this.color]);
  }
}
