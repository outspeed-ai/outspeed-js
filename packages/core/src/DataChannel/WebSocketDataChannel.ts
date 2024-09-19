import { DataChannel } from "./DataChannel";
import { isMessageEvent, stringify } from "../utils";

export class WebSocketDataChannel implements DataChannel<null> {
  dataChannel = null;
  socket: WebSocket;
  eventListeners: {
    open: Array<EventListener>;
    close: Array<EventListener>;
    message: Array<EventListener>;
  };

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.eventListeners = {
      open: [],
      close: [],
      message: [],
    };

    this._onOpen = this._onOpen.bind(this);
    this._onClose = this._onClose.bind(this);
    this._onMessage = this._onMessage.bind(this);

    this.socket.addEventListener("open", this._onOpen);
    this.socket.addEventListener("close", this._onClose);
    this.socket.addEventListener("message", this._onMessage);
  }

  private _onOpen(event: Event) {
    this.eventListeners.open.forEach((listener) => listener(event));
  }

  private _onClose(event: Event) {
    this.eventListeners.close.forEach((listener) => listener(event));
  }

  private _onMessage(event: Event) {
    if (!isMessageEvent(event)) {
      return;
    }

    const message = JSON.parse(event.data);

    if (message.type === "message") {
      this.eventListeners.message.forEach((listener) => listener(event));
    }
  }

  addEventListener(
    type: "message" | "close" | "open",
    listener: EventListener
  ): void {
    if (this.eventListeners[type]) {
      this.eventListeners[type].push(listener);
    }
  }

  removeEventListener(
    type: "message" | "close" | "open",
    listener: EventListener
  ): void {
    if (this.eventListeners[type]) {
      this.eventListeners[type] = this.eventListeners[type].filter(
        (l) => l !== listener
      );
    }
  }

  send(payload: { type: string } & { [k in string]: unknown }): void {
    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not open");
    }

    this.socket.send(stringify(payload));
  }

  disconnect() {
    this.socket.removeEventListener("open", this._onOpen);
    this.socket.removeEventListener("close", this._onClose);
    this.socket.removeEventListener("message", this._onMessage);
  }
}
