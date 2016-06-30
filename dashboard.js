var express = require("express");

function Dashboard(port) {
  this.port = port;
  this.app = express();
  this.app.use(express.static("dashboard"));
  this.app.listen(this.port, () => {
    console.log("dashboard listening on port " + this.port);
  });
}

module.exports = Dashboard;

