import { DataChannel } from "./DataChannel";

export class WebRTCDataChannel implements DataChannel<RTCDataChannel> {
  dataChannel: RTCDataChannel;

  constructor(rtcDataChannel: RTCDataChannel) {
    this.dataChannel = rtcDataChannel;
  }

  addEventListener(
    type: "message" | "close" | "open",
    listener: (this: RTCDataChannel, ev: MessageEvent | Event) => void
  ) {
    this.dataChannel.addEventListener(type, listener);
  }

  removeEventListener(
    type: "message" | "close" | "open",
    listener: (this: RTCDataChannel, ev: MessageEvent | Event) => void
  ) {
    this.dataChannel.removeEventListener(type, listener);
  }

  send(obj: object) {
    try {
      this.dataChannel.send(JSON.stringify(obj));
    } catch (error) {
      console.error(error);
    }
  }
}
