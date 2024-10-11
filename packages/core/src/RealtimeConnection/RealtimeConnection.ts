import { TLogger, TRealtimeConfig, TResponse } from "../shared/@types";
import { RealtimeConnectionMediaManager } from "./RealtimeConnectionMediaManager";
import { RealtimeConnectionNegotiator } from "./RealtimeConnectionNegotiator";

export type TRealtimeConnectionListenerType =
  | keyof RTCPeerConnectionEventMap
  | keyof RTCDataChannelEventMap;

export type TRealtimeConnectionListener = (
  this: RTCPeerConnection,
  ev:
    | RTCTrackEvent
    | Event
    | RTCDataChannelEvent
    | RTCPeerConnectionIceEvent
    | RTCPeerConnectionIceErrorEvent
    | MessageEvent
) => void;

export type TRealtimeConnectionPacketReceiveCallbackEvent = {
  prevSource: RTCRtpSynchronizationSource | null;
  source: RTCRtpSynchronizationSource;
  kind: string;
  id: string;
};

export type TRealtimeConnectionPacketReceiveCallback = (
  event: TRealtimeConnectionPacketReceiveCallbackEvent
) => void;

/**
 * A class that establishes and manages a WebRTC connection between
 * the client/browser and a backend deployed on the Adapt Infrastructure.
 *
 * @example
 * const config = {
 *  functionURL: 'https://infra.getadapt.ai/run/<identifier>',
 *  video: true,
 *  audio: true
 * }
 *
 * // Create an instance of the real-time connection.
 * const connection = new RealtimeConnection(config);
 *
 * // Attempt to connect.
 * const response = await connection.connect();
 *
 * // If response.ok is true, the connection to the backend was successful.
 * if (response.ok) {
 *  console.log("You are connected.");
 * } else {
 *  // If an error occurs, response.error will be defined,
 *  // usually as a string.
 *  console.error(`There is an error: ${response.error}`);
 * }
 */
export class RealtimeConnection {
  readonly _config: TRealtimeConfig;
  private _logger: TLogger | undefined;
  private readonly _logLabel = "RealtimeConnection";
  private _isConnecting: boolean = false;
  private _previousRTCRtpSynchronizationSource: Record<
    string,
    RTCRtpSynchronizationSource
  > = {};
  private _packetReceiveEventListeners = [] as [
    TRealtimeConnectionPacketReceiveCallback,
    NodeJS.Timeout,
    number
  ][];

  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  mediaManager: RealtimeConnectionMediaManager;
  negotiator: RealtimeConnectionNegotiator;

  constructor(config: TRealtimeConfig) {
    this._config = config;
    this._logger = this._config.logger;
    this.peerConnection = new RTCPeerConnection(this._config.rtcConfig);
    this.mediaManager = new RealtimeConnectionMediaManager(
      this.peerConnection,
      this._config
    );
    this.negotiator = new RealtimeConnectionNegotiator(
      this.peerConnection,
      this._config
    );

    const dataChannelOptions = this._config.dataChannelOptions;

    if (dataChannelOptions) {
      this.dataChannel = this.peerConnection.createDataChannel(
        "chat",
        dataChannelOptions
      );
    } else {
      this.dataChannel = null;
    }
  }

  /**
   * Initiates the connection process. This method sets up the
   * media manager, negotiates the connection with the backend, and
   * updates the peer connection accordingly.
   *
   * @returns {Promise<TResponse>} A promise that resolves to an object
   * indicating the success or failure of the connection process.
   *
   * @example
   * const response = await connection.connect();
   * if (response.ok) {
   *   console.log("Connection established successfully.");
   * } else {
   *   // If you try to call `connection.connect` multiple times it will return an error.
   *   console.error("Failed to establish connection:", response.error);
   * }
   *
   */
  async connect(): Promise<TResponse> {
    // Prevents multiple simultaneous connection attempts.
    if (this._isConnecting) {
      const msg =
        "Connection is in progress, avoid calling connect multiple times.";
      this._logger?.warn(this._logLabel, msg);

      return {
        ok: false,
        error: msg,
      };
    }

    // Ensures connect is only called when the connection state is "new".
    if (this.peerConnection.connectionState !== "new") {
      const msg = `connect can only be called if the connection state is new. Current connection state is: ${this.peerConnection.connectionState}`;
      this._logger?.warn(this._logLabel, msg);

      return {
        ok: false,
        error: msg,
      };
    }

    this._isConnecting = true;

    // Setup the media manager for the connection.
    let response = await this.mediaManager.setup();
    if (!response.ok) {
      return {
        error: `Failed to setup RealtimeConnectionMediaManager. Response: ${response.error}.`,
      };
    }

    // Negotiate and update the peer connection.
    response = await this.negotiator.negotiateAndUpdatePeerConnection();

    if (!response.ok) {
      return {
        ...response,
        error: `Failed during negotiating connection. Response: ${response.error}.`,
      };
    }

    this._isConnecting = false;
    return {
      ok: true,
    };
  }

  /**
   * Terminates the connection by closing the data channel, stopping all transceivers
   * and senders, and releasing all local media streams.
   *
   * @returns {TResponse} An object indicating the success or failure of the disconnection process.
   *
   * @example
   * const response = connection.disconnect();
   * if (response.ok) {
   *   console.log("Disconnected successfully.");
   * } else {
   *   console.error("Failed to disconnect:", response.error);
   * }
   */
  disconnect(): TResponse {
    try {
      // Close the data channel if it exists.
      if (this.dataChannel) {
        this.dataChannel.close();
      }

      // Stop all transceivers and senders, and close the peer connection if it exists.
      if (this.peerConnection) {
        this.peerConnection.getTransceivers().forEach((transceiver) => {
          transceiver.stop();
        });

        this.peerConnection.getSenders().forEach((sender) => {
          sender.track?.stop();
        });

        this.peerConnection.close();
      }

      // Release all local media streams through the media manager.
      const response = this.mediaManager.releaseAllLocalStream();

      return response;
    } catch (error) {
      this._logger?.error(this._logLabel, error);
      return {
        error,
      };
    }
  }

  /**
   * Adds an event listener to the connection, either to the `RTCPeerConnection` or
   * `RTCDataChannel` based on the specified event type.
   *
   * @param {TRealtimeConnectionListenerType} type
   * The type of event to listen for. This can be an event from the
   * `RTCPeerConnection` or `RTCDataChannel` event maps.
   *
   * @param {TRealtimeConnectionListener} listener
   * The function to call when the specified event is triggered.
   *
   * @example
   * connection.addEventListener("icecandidate", (event) => {
   *   if(!isRTCPeerConnectionIceEvent(event)) {
   *      // If the event is not an instance of
   *      // isRTCPeerConnectionIceEvent then returning. This check
   *      // is to make typescript happy.
   *      return
   *   }
   *   console.log("New ICE candidate:", event.candidate);
   * });
   *
   * connection.addEventListener("message", (event) => {
   *   if(!isMessageEvent(event)) {
   *       return
   *   }
   *    console.log("New message received:", event.data);
   * });
   */
  addEventListener(
    type: TRealtimeConnectionListenerType,
    listener: TRealtimeConnectionListener
  ) {
    switch (type) {
      case "bufferedamountlow":
      case "close":
      case "closing":
      case "error":
      case "message":
      case "open":
        // Event listener for data channel events.
        if (!this.dataChannel) {
          this._logger?.error(
            this._logLabel,
            "Data channel is not defined. Probably dataParameters is missing in the config."
          );
          return;
        }
        this.dataChannel.addEventListener(type, listener);
        break;
      default:
        // Event listener for peer connection.
        if (!this.peerConnection) {
          this._logger?.error(
            this._logLabel,
            "Unable to add the new event listener. It looks like peerConnection is null. Probably the connection is disconnected."
          );

          return;
        }
        this.peerConnection.addEventListener(type, listener);
    }
  }

  /**
   * Removes an event listener from the connection, either from the `RTCPeerConnection`
   * or `RTCDataChannel` based on the specified event type.
   *
   * @param {TRealtimeConnectionListenerType} type
   * The type of event for which the listener should be removed. This can be an event
   * from the `RTCPeerConnection` or `RTCDataChannel` event maps.
   *
   * @param {TRealtimeConnectionListener} listener
   * The event listener function that was previously added and should now be removed.
   *
   * @example
   * connection.removeEventListener("icecandidate", handleIceCandidate);
   */
  removeEventListener(
    type: TRealtimeConnectionListenerType,
    listener: TRealtimeConnectionListener
  ) {
    switch (type) {
      case "bufferedamountlow":
      case "close":
      case "closing":
      case "error":
      case "message":
      case "open":
        // Event listener for data channel events.
        if (!this.dataChannel) {
          this._logger?.error(
            this._logLabel,
            "Data channel is not defined. Probably dataParameters is missing in the config."
          );
          return;
        }
        this.dataChannel.removeEventListener(type, listener);
        break;
      default:
        // Event listener for peer connection.
        if (!this.peerConnection) {
          this._logger?.error(
            this._logLabel,
            "Unable to add the new event listener. It looks like peerConnection is null. Probably the connection is disconnected."
          );

          return;
        }
        this.peerConnection.removeEventListener(type, listener);
    }
  }

  /**
   * Sends a message through the connection data channel. The message is an object
   * that is serialized to a JSON string before being sent.
   *
   * @template T
   * @param {T} obj - The object to send through the data channel. This object will be serialized to JSON.
   * @returns {TResponse} An object indicating the success or failure of the message sending operation.
   *
   * @example
   * const message = { role: "user", content: "Hello!" };
   * const response = connection.sendMessage(message);
   *
   * if (response.ok) {
   *   console.log("Message sent successfully.");
   * } else {
   *   console.error("Failed to send message:", response.error);
   * }
   */
  sendMessage<T extends Record<string, unknown>>(obj: T): TResponse {
    if (!this.dataChannel) {
      return {
        error: "Data channel is not initialized.",
      };
    }

    if (this.dataChannel.readyState !== "open") {
      return {
        error: "Connection not ready. Did you call `connect` method?",
      };
    }
    try {
      const message = JSON.stringify(obj);
      this.dataChannel.send(message);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        error,
      };
    }
  }

  /**
   * Adds a listener for receiving packets. The listener will be called periodically
   * based on the specified frequency, providing information about synchronization sources.
   *
   * @param {TRealtimeConnectionPacketReceiveCallback} callback - The function to call when a packet is received.
   * @param {number} [frequency=1000] - The frequency (in milliseconds) at which the listener is called. Default is 1000 ms.
   */
  addOnPacketReceiveListener(
    callback: TRealtimeConnectionPacketReceiveCallback,
    frequency: number = 1000
  ) {
    if (!this.peerConnection) {
      this._logger?.error(
        this._logLabel,
        "Unable to add onPacketReceive listener. It looks like peerConnection is null."
      );
      return;
    }

    // Set up an interval to periodically check for synchronization sources.
    const interval = setInterval(() => {
      const receivers = this.peerConnection.getReceivers();

      receivers.forEach((receiver) => {
        // Get the list of synchronization sources from each receiver.
        const sources = receiver.getSynchronizationSources();

        sources.forEach((source) => {
          const id = `receiver_id:${receiver.track.id}-source_id:${source.source}`;
          // Call the provided callback with information about the current and previous synchronization sources.
          callback({
            id,
            kind: receiver.track.kind,
            source,
            prevSource: this._previousRTCRtpSynchronizationSource[id],
          });

          // Update the previous source map with the current source.
          this._previousRTCRtpSynchronizationSource[id] = source;
        });
      });
    }, frequency);

    // Store the listener and its associated interval and frequency for later removal.
    this._packetReceiveEventListeners.push([callback, interval, frequency]);
  }

  /**
   * Removes a previously added packet receive listener.
   *
   * @param {TRealtimeConnectionPacketReceiveCallback} callback - The function to remove.
   * @param {number} [frequency=1000] - The frequency (in milliseconds) of the listener to remove. Default is 1000 ms.
   */
  removeOnPacketReceiverListener(
    callback: TRealtimeConnectionPacketReceiveCallback,
    frequency: number = 1000
  ) {
    this._packetReceiveEventListeners =
      this._packetReceiveEventListeners.filter(([_c, _i, _f]) => {
        if (_c === callback && _f === frequency) {
          // Clear the interval for the specified listener.
          clearInterval(_i);
          return false; // Exclude this listener from the updated list.
        }
        return true; // Keep other listeners.
      });
  }

  /**
   * Removes all packet receive listeners and clears any associated intervals.
   */
  removeAllOnPacketReceiverListeners() {
    // Iterate over all stored listeners and clear their intervals.
    this._packetReceiveEventListeners.forEach((listeners) => {
      clearInterval(listeners[1]);
    });

    // Clear the list of packet receive event listeners and reset the previous synchronization sources.
    this._packetReceiveEventListeners = [];
    this._previousRTCRtpSynchronizationSource = {};
  }
}
