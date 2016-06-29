var express = require("express");

function Dashboard(port) {
  console.log(port);
  this.port = port;
  this.app = express();
  this.app.get("/", function(req, res) {
    res.send("hello, world");
  });
  this.app.listen(this.port, () => {
    console.log("dashboard listening on port " + this.port);
  });
}

module.exports = Dashboard;

