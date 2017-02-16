import express from "express";
import io from "socket.io";
import ComponentBase from "./componentBase";
import { Server as createServer } from "http";

export default class Scoreboard extends ComponentBase {
  constructor(models, port) {
    super(models);

    this.app = express();
    this.server = createServer(this.app);
    this.io = io(this.server);
    this.io.origins(`localhost:${port}`);

    this.app.use(express.static("scoreboard"));
    this.server.listen(port, () => {
      console.log(`score is listening on port ${port}`);
    });

    this.currentRanking = null;

    this.sockets = [];
    this.io.on("connection", socket => {
      console.log("a scoreboard connected.");
      this.sockets.push(socket);
      if (this.appModel.ranking !== null) {
        socket.emit("data", this.appModel.ranking);
      }
    });

    this.subscribe("ranking", this.updateRanking);
  }

  updateRanking(ranking) {
    this.sockets.forEach(socket => {
      socket.emit("data", ranking);
    });
  }
}
