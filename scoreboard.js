import express from "express";
import io from "socket.io";
import controllerModel from "./model/controllerModel";
import RankingMaker from "./rankingMaker";
import ComponentBase from "./componentBase";

export default class Scoreboard extends ComponentBase {
  constructor(port) {
    super();

    this.app = express();
    this.server = require("http").Server(this.app);
    this.io = require("socket.io")(this.server);
    this.io.origins(`localhost:${port}`);

    this.app.use(express.static("scoreboard"));
    this.server.listen(port, () => {
      console.log(`score is listening on port ${port}`);
    });

    this.currentRanking = null;

    this.rankingMaker = new RankingMaker();

    this.sockets = [];
    this.io.on("connection", socket => {
      console.log("a scoreboard connected.");
      this.sockets.push(socket);
      if (this.currentRanking !== null) {
        socket.emit("data", this.currentRanking);
      }
    });

    this.subscribe("updatedHp", this.updateRanking);
    this.subscribe("updatedLink", this.updateRanking);
    this.subscribe("updatedColor", this.updateRanking);
  }

  updateRanking() {
    this.currentRanking = this.rankingMaker.make(controllerModel.controllers);
    this.sockets.forEach(socket => {
      socket.emit("data", this.currentRanking);
    });
  }
}
