import express from "express";
import io from "socket.io";
import controllerModel from "./controllerModel";
import RankingMaker from "./rankingMaker";

let scoreboardInstance = null;

function Scoreboard(port) {
  if (scoreboardInstance !== null) {
    return scoreboardInstance;
  }
  scoreboardInstance = this;

  this.app = express();
  this.server = require("http").Server(this.app);
  this.io = require("socket.io")(this.server);
  this.io.origins(`localhost:${port}`);

  this.app.use(express.static("scoreboard"));
  this.server.listen(port, () => {
    console.log(`score is listening on port ${port}`);
  });

  const rankingMaker = new RankingMaker();

  this.io.on("connection", socket => {
    console.log("a scoreboard connected.");
    
    socket.on("request", () => {
      socket.emit("data", rankingMaker.make(controllerModel.controllers));
    });
  });
}

module.exports = Scoreboard;
