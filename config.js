var VirtualPlugin = require("sphero-ws-virtual-plugin");

module.exports = {
  websocket: {
    wsPort: 8080,
    allowedOrigin: "*",
    sphero: [
      { name: "Sphero-BPO", port: "COM3" },
      { name: "Sphero-YRW", port: "COM4" }
    ],
    checkSignal: true,
    linkMode: "manual"
  },
  virtualSphero: {
    wsPort: 8081
  },
  dashboardPort: 8082
};
