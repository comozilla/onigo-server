var express = require("express");
var io = require("socket.io");

function dashboard(port) {
  var app = require('express')();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  app.use(express.static("dashboard"));
  server.listen(port, () => {
    console.log("dashboard listening on port " + port);
  });

  io.on('connection', function (socket) {
    console.log("a user connected");
  });
}

module.exports = dashboard;

