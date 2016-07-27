import eventPublisher from "./publisher";

const logTypeColors = {
  log: "white",
  error: "red",
  warning: "orange",
  success: "lightgreen"
}
export default class Log {
  constructor() {
    this.logElement = document.getElementById("log-area");
    this.clearLogButton = document.getElementById("clear-log");
    this.clearLogButton.addEventListener("click", () => {
      this.logElement.innerHTML = "";
    });
    eventPublisher.on("log", (logText, logType) => {
      this.log(logText, logType);
    });
  }
  log(logText, logType) {
    if (typeof logTypeColors[logType] === "undefined") {
      throw new Error("指定されたlogTypeに対する色が見つかりませんでした。logType: " + logType);
    }
    const span = document.createElement("span");
    span.style.color = logTypeColors[logType];
    span.innerHTML = "[" + this.getTimeStamp(new Date()) + "] " + logText
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />") + "<br />";
    this.logElement.appendChild(span);
  }
  getTimeStamp(date) {
    return ("0" + date.getHours()).slice(-2) + ":" +
      ("0" + date.getMinutes()).slice(-2) + ":" +
      ("0" + date.getSeconds()).slice(-2) + "." +
      ("00" + date.getMilliseconds()).slice(-3);
  }
}
