import VirtualPlugin from "sphero-ws-virtual-plugin";

export default {
  websocket: {
    wsPort: 8080,
    allowedOrigin: "*",
    sphero: [
    ],
    checkSignal: true,
    linkMode: "manual"
  },
  virtualSphero: {
    wsPort: 8081
  },
  dashboardPort: 8082,
  scoreboardPort: 8083
};
