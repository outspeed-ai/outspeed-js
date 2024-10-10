import { IMediaRecorderEventMap } from "extendable-media-recorder";
import { WebSocketDataChannel } from "../DataChannel";
import { TLogger, TRealtimeWebSocketConfig, TResponse } from "../shared/@types";
import { fetchWithRetry, isMessageEvent, stringify } from "../utils";
import { RealtimeWebSocketMediaManager } from "./RealtimeWebSocketMediaManager";
import { blobToBase64 } from "../utils";

export type TRealtimeWebSocketConnectOptions = {
  /**
   * This option specifies the number of times we should retry the fetch request.
   *
   * To connect to the backend, we need to fetch the offer URL, using the
   * function URL provided in the config. We make a fetch request to this
   * URL, sometimes this fetch request might fail, in that case we can retry the request.
   *
   * @default 7
   */
  retryOnFail?: number;
};

export class RealtimeWebSocketConnection {
  private readonly _config: TRealtimeWebSocketConfig;
  private readonly _logLabel = "RealtimeWebSocketConnection";
  private readonly _logger: TLogger | undefined;
  private _isConnecting: boolean = false;

  socket: WebSocket | null;
  dataChannel: WebSocketDataChannel | null;
  mediaManager: RealtimeWebSocketMediaManager;

  abortController: null | AbortController = null;

  constructor(config: TRealtimeWebSocketConfig) {
    this._config = config;
    this._logger = config.logger;
    this.dataChannel = null;
    this.socket = null;
    this.mediaManager = new RealtimeWebSocketMediaManager(config);

    this._onRecordingAvailable = this._onRecordingAvailable.bind(this);
    this._processAudioMessage = this._processAudioMessage.bind(this);
  }

  private _send(payload: { type: string } & { [k in string]: unknown }) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not open");
    }

    this.socket.send(stringify(payload));
  }

  private async _getOfferURL(
    functionURL: string,
    retryOnFail = 7
  ): Promise<TResponse<string, string>> {
    try {
      const response = await fetchWithRetry(
        functionURL,
        undefined,
        retryOnFail
      );

      if (!response.ok) {
        return response;
      }

      const payload = (await response.json()) as unknown;

      // Waiting for connection to start.
      // Making fetch request to check whether it is started.
      await fetchWithRetry(
        functionURL.replace(/\/$/, "") + "/connections",
        undefined,
        retryOnFail,
        undefined,
        [400]
      );

      if (!response.ok) {
        return response;
      }

      if (!payload || typeof payload !== "object") {
        throw new Error(
          `Error in establishing connection, 'payload' is undefined or not an object. Type: ${typeof payload}`
        );
      }

      if (
        !("address" in payload) ||
        typeof payload.address !== "string" ||
        !payload.address
      ) {
        throw new Error(
          `Response doesn't contain offer url. Response: ${JSON.stringify(
            payload
          )}`
        );
      }

      const offerURL = payload.address
        .replace("http", "ws")
        .replace("0.0.0.0", "localhost");

      return {
        ok: true,
        data: offerURL,
      };
    } catch (error) {
      this._logger?.error(this._logLabel, error);
      console.error("Error resolving function URL:", error);
      return {
        error: "Failed to resolve offer URL",
      };
    }
  }

  private _sendAudioMetadata(): TResponse {
    const metadataResponse = this.mediaManager.getMetadata();

    if (!metadataResponse.ok || !metadataResponse.data) {
      this._logger?.error(
        this._logLabel,
        metadataResponse.error || "Failed to get audio metadata"
      );
      return {
        error: metadataResponse.error,
      };
    }

    try {
      this._send({
        type: "audio_metadata",
        ...metadataResponse.data,
      });

      return {
        ok: true,
      };
    } catch (error) {
      this._logger?.error(
        this._logLabel,
        "Error sending audio metadata",
        error
      );
      return { error: "Error sending audio metadata" };
    }
  }

  private async _onRecordingAvailable(
    event: IMediaRecorderEventMap["dataavailable"]
  ) {
    const base64 = await blobToBase64(event.data);

    if (!base64 || !this.dataChannel || !this.isReady()) {
      return;
    }

    if (this.mediaManager.track?.isMute()) {
      return;
    }

    this._send({ type: "audio", data: base64 });
  }

  private async _processAudioMessage(event: unknown) {
    if (!isMessageEvent(event)) {
      return;
    }

    const message = JSON.parse(event.data);

    this._logger?.info(this._logLabel, "Received message", message.type);

    if (message.type.startsWith("audio")) {
      this.mediaManager.processAudioPayload({
        ...message,
      });
    }
  }

  async connect(
    options = {} as TRealtimeWebSocketConnectOptions
  ): Promise<TResponse> {
    const config = this._config;

    if (!config.functionURL) {
      this._logger?.warn(this._logLabel, "No function URL provided");

      return {
        error: "No function URL provided",
      };
    }

    if (this._isConnecting) {
      this._logger?.warn(this._logLabel, "Already connecting");

      return {
        error: "Already connecting",
      };
    }

    this._isConnecting = true;

    const setupAudioResponse = await this.mediaManager.setup();

    if (!setupAudioResponse.ok) {
      this._isConnecting = false;

      return setupAudioResponse;
    }

    this.abortController = new AbortController();
    const response = await this._getOfferURL(
      config.functionURL,
      options.retryOnFail
    );

    if (!response.ok || !response.data) {
      this._isConnecting = false;

      this._logger?.error(
        this._logLabel,
        `Failed to connect to ${config.functionURL}`,
        response
      );
      return { ...response, error: "Failed to connect" };
    }

    this.socket = new WebSocket(response.data, config.protocols);
    this.dataChannel = new WebSocketDataChannel(this.socket);

    const connectionResponse = await new Promise<TResponse>(
      (resolve, reject) => {
        if (!this.socket) {
          return reject({ error: "Socket is not defined" });
        }

        this.socket.onopen = () => {
          this._logger?.info(this._logLabel, "Connected to socket");
          this._isConnecting = false;
          resolve({ ok: true });
        };

        this.socket.onerror = (err) => {
          this._logger?.error(
            this._logLabel,
            "Error connecting to socket",
            err
          );
          this._isConnecting = false;
          reject({ error: err });
        };
      }
    );

    if (!connectionResponse.ok) {
      this._logger?.error(
        this._logLabel,
        "Failed to connect to socket",
        connectionResponse
      );
      return connectionResponse;
    }

    const sendMetadataResponse = this._sendAudioMetadata();

    if (!sendMetadataResponse.ok) {
      this._logger?.error(
        this._logLabel,
        "Failed to send metadata",
        sendMetadataResponse
      );
      return sendMetadataResponse;
    }

    if (!this.mediaManager.recorder) {
      return {
        error: "Failed to initialize recorder.",
      };
    }

    try {
      // Starting recorder
      this.mediaManager.recorder.start(1);
      this.mediaManager.recorder.addEventListener(
        "dataavailable",
        this._onRecordingAvailable
      );
      this.socket.addEventListener("message", this._processAudioMessage);
    } catch (error) {
      this._logger?.error(this._logLabel, "Error starting recorder", error);
      return {
        error,
      };
    }

    this._logger?.info(
      this._logLabel,
      "Connected to socket and started recording"
    );

    return {
      ok: true,
    };
  }

  async disconnect(): Promise<TResponse> {
    try {
      // Cancelling connection request.
      this.abortController?.abort(
        "RealtimeWebSocketConnection.disconnect() is called."
      );

      // Removing EventListeners.
      if (this.mediaManager.recorder) {
        this.mediaManager.recorder.removeEventListener(
          "dataavailable",
          this._onRecordingAvailable
        );
      }

      this.dataChannel?.disconnect();
      this.socket?.removeEventListener("message", this._processAudioMessage);

      // Resetting Sockets
      try {
        this._send({ type: "websocket_stop" });
        this.socket?.close();
      } catch (error) {
        this._logger?.warn(this._logLabel, error);
      }

      this.mediaManager.disconnect();

      this._isConnecting = false;
      this._logger?.info(this._logLabel, "Disconnected");

      return {
        ok: true,
      };
    } catch (error) {
      this._logger?.error(this._logLabel, "Error disconnecting", error);
      return {
        error,
      };
    }
  }

  isReady(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
