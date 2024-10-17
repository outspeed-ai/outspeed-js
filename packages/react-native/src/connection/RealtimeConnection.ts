import { RTCPeerConnection } from "react-native-webrtc";
import { TLogger, TRealtimeConfig, TResponse } from "@outspeed/core/@types";

import { RealtimeConnectionMediaManager } from "./RealtimeConnectionMediaManager";
import { RealtimeConnectionNegotiator } from "./RealtimeConnectionNegotiator";

export type TRealtimeConnectionDataChannel = ReturnType<
  typeof RTCPeerConnection.prototype.createDataChannel
>;

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

  peerConnection: RTCPeerConnection;
  dataChannel: TRealtimeConnectionDataChannel | null;
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
}
