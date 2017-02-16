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
  scoreboardPort: 8083,
  defaultHp: 100,
  damage: 10,
  defaultColor: "white",
  collision: {
    meth: 0x01,
    xt: 0x7A,
    xs: 0xFF,
    yt: 0x7A,
    ys: 0xFF,
    dead: 100
  }
};
