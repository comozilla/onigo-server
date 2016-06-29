var VirtualPlugin = require("sphero-ws-virtual-plugin");

module.exports = {
  websocket: {
    wsPort: 8080,
    allowedOrigin: "*",
    sphero: [
      { name: "Sphero-BPO", port: "COM3" },
      { name: "Sphero-BPO2", port: "COM3" }
    ],
    checkSignal: true
  },
  virtualSphero: {
    wsPort: 8081
  }
};
