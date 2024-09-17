import { vi } from "vitest";

type Options = {
  shouldFailLocalDescription?: boolean;
  shouldFailRemoteDescription?: boolean;
};

export class MockedRTCPeerConnection {
  localDescription: unknown;
  remoteDescription: unknown;
  iceConnectionState:
    | "new"
    | "checking"
    | "connected"
    | "completed"
    | "failed"
    | "disconnected"
    | "closed";
  iceGatheringState: "new" | "gathering" | "complete";
  connectionState:
    | "new"
    | "connecting"
    | "connected"
    | "completed"
    | "failed"
    | "disconnected"
    | "closed";
  eventListeners: Record<string, ((e: unknown) => void)[]> = {};
  shouldFailLocalDescription = false;
  shouldFailRemoteDescription = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataChannel: any = null;

  constructor(options: Options = {}) {
    this.iceConnectionState = "new";
    this.iceGatheringState = "new";
    this.connectionState = "new";
    this.shouldFailLocalDescription =
      options.shouldFailLocalDescription || false;
    this.shouldFailRemoteDescription =
      options.shouldFailRemoteDescription || false;
  }

  // Mock methods using vi.fn()
  addEventListener = vi.fn((event: string, listener: (e: unknown) => void) => {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(listener);
  });

  removeEventListener = vi.fn(
    (event: string, listener: (e: unknown) => void) => {
      if (this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(
          (l) => l !== listener
        );
      }
    }
  );

  dispatchEvent = vi.fn((event: { type: keyof RTCPeerConnectionEventMap }) => {
    if (this.eventListeners[event.type]) {
      this.eventListeners[event.type].forEach((listener) => listener(event));
    }
  });

  createOffer = vi.fn(() => {
    const offer = Promise.resolve({ type: "offer", sdp: "mock-sdp-offer" });

    this.iceConnectionState = "checking";
    this.connectionState = "connecting";
    this.iceGatheringState = "gathering";

    // Dispatching icegatherstatechange event
    this.dispatchEvent({ type: "icegatheringstatechange" });
    this.dispatchEvent({ type: "iceconnectionstatechange" });

    setTimeout(() => {
      this.iceConnectionState = "connected";
      this.connectionState = "connected";

      // Dispatching iceconnectionstatechange event
      this.dispatchEvent({ type: "iceconnectionstatechange" });
    }, 100);

    setTimeout(() => {
      this.iceGatheringState = "complete";
      this.dispatchEvent({ type: "icegatheringstatechange" });
    }, 200);

    return offer;
  });

  createAnswer = vi.fn(() =>
    Promise.resolve({ type: "answer", sdp: "mock-sdp-answer" })
  );

  setLocalDescription = vi.fn(async (description: unknown) => {
    if (this.shouldFailLocalDescription) {
      return Promise.reject("Failed to set local description");
    }

    this.localDescription = description;
    this.iceConnectionState = "checking";

    await new Promise((resolve) => {
      setTimeout(() => {
        this.iceConnectionState = "connected";
        this.dispatchEvent({ type: "iceconnectionstatechange" });
        resolve({});
      }, 100);
    });
  });

  setRemoteDescription = vi.fn(async (description: string) => {
    if (this.shouldFailRemoteDescription) {
      return Promise.reject("Failed to set local description");
    }

    this.localDescription = description;
    this.iceConnectionState = "checking";

    await new Promise((resolve) => {
      setTimeout(() => {
        this.iceConnectionState = "connected";
        this.dispatchEvent({ type: "iceconnectionstatechange" });
        resolve({});
      }, 100);
    });
  });

  addTrack = vi.fn();

  addTransceiver = vi.fn();

  createDataChannel = vi.fn(() => {
    this.dataChannel = {
      close: vi.fn(),
    };
  });

  getTransceivers = vi.fn(() => {
    return [];
  });

  getSenders = vi.fn(() => {
    return [];
  });

  close = vi.fn(() => {
    this.connectionState = "disconnected";
    this.iceConnectionState = "disconnected";
  });
}

export class MockedRTCSessionDescription {
  type: RTCSessionDescriptionInit["type"];
  sdp: RTCSessionDescriptionInit["sdp"];

  constructor(description: RTCSessionDescriptionInit) {
    this.type = description.type;
    this.sdp = description.sdp;
  }
}
