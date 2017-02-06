import express from "express";
import io from "socket.io";
import controllerModel from "./controllerModel";
import RankingMaker from "./rankingMaker";
import eventPublisher from "./publisher";

export default class Scoreboard {
  constructor(port) {
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

    eventPublisher.subscribe("updatedHp", this.updateRanking.bind(this));
    eventPublisher.subscribe("updatedLink", this.updateRanking.bind(this));
    eventPublisher.subscribe("updatedColor", this.updateRanking.bind(this));
  }

  updateRanking() {
    this.currentRanking = this.rankingMaker.make(controllerModel.controllers);
    this.sockets.forEach(socket => {
      socket.emit("data", this.currentRanking);
    });
  }
}
