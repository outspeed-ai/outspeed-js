import type { IMediaRecorder } from "extendable-media-recorder";
import { toBytes } from "fast-base64";

import { ETrackOrigin, Track } from "../shared/Track";
import { TLogger, TRealtimeWebSocketConfig, TResponse } from "../shared/@types";

import RealtimeWebsocketAudioProcessorWorkletCode from "./RealtimeWebsocketAudioProcessorWorkletCode";

/**
 * The worklet code runs within the `AudioWorkletGlobalScope`, a special global execution context
 * that operates on a separate Audio Worklet thread. This thread is shared by the worklet and other
 * audio nodes, allowing efficient audio processing.
 *
 * The Audio Worklet thread is sandboxed, meaning the browser enforces a clear separation of the code
 * running in this context. This separation is achieved by loading the worklet code as a module using
 * the `addModule()` function, ensuring that it runs in the correct context.
 *
 */
async function getRealtimeWebsocketAudioProcessorURL() {
  if (typeof window === "undefined") return "";

  // Create a Blob from the string
  const blob = new Blob([RealtimeWebsocketAudioProcessorWorkletCode], {
    type: "application/javascript",
  });

  // Create an object URL for the blob
  return URL.createObjectURL(blob);
}

export type TRealtimeWebsocketAudioProcessPayload = {
  /**
   * Message type.
   * `audio`: To play audio.
   * `audio_end`: To stop playing audio.
   */
  type: string;
  /**
   * Audio data in base64 format.
   */
  data?: string;
  /**
   * Index.
   */
  idx?: number;
};

export class RealtimeWebSocketMediaManager {
  private readonly _config: TRealtimeWebSocketConfig;
  private readonly _logLabel = "RealtimeWebSocketMediaManager";
  private readonly _logger: TLogger | undefined;
  stream: MediaStream | null;
  track: Track | null;
  recorder: IMediaRecorder | null;
  audioContext: AudioContext | null;
  isPlaying: boolean;
  source?: AudioBufferSourceNode | null;
  wavEncoderPort?: MessagePort | null;
  remoteAudioDestination?: MediaStreamAudioDestinationNode | null;
  remoteAudioTrack?: Track | null;
  audioStartTime: number;
  audioEndTime: number;
  audioWorkletNode: AudioWorkletNode | null;

  constructor(config: TRealtimeWebSocketConfig) {
    this._config = config;
    this.stream = null;
    this.track = null;
    this.recorder = null;
    this.audioContext = null;
    this.isPlaying = false;
    this._logger = config.logger;
    this.audioStartTime = 0;
    this.audioEndTime = 0;
    this.audioWorkletNode = null;
  }

  private async _playAudio(wsPayload: TRealtimeWebsocketAudioProcessPayload) {
    if (!this.audioContext) {
      this._logger?.error(
        this._logLabel,
        "Not audio context. It looks like connect() was not successful."
      );
      return {
        error: "Not audio context. It looks like connect() was not successful.",
      };
    }

    const arrayBuffer = await toBytes(wsPayload.data!);
    this.audioWorkletNode?.port.postMessage({
      type: "arrayBuffer",
      buffer: arrayBuffer,
    });
  }

  private _stopPlayingAudio() {
    if (!this.audioWorkletNode) {
      this._logger?.debug(
        this._logLabel,
        "_stopPlayingAudio is called but this.audioWorkletNode is not defined. Returning without throwing error."
      );
      return;
    }
    this.audioWorkletNode?.port.postMessage({
      type: "audio_end",
    });
  }

  async setup() {
    try {
      if (typeof window === "undefined") throw new Error("Window is undefined");

      const { MediaRecorder, register } = await import(
        "extendable-media-recorder"
      );

      const { connect: wavEncodedConnect } = await import(
        "extendable-media-recorder-wav-encoder"
      );

      if (!MediaRecorder.isTypeSupported("audio/wav")) {
        this._logger?.debug(this._logLabel, "Registering audio/wav encoder.");
        this.wavEncoderPort = await wavEncodedConnect();
        await register(this.wavEncoderPort);
        this._logger?.debug(this._logLabel, "Registered audio/wav encoder.");
      } else {
        this._logger?.debug(this._logLabel, "audio/wav encoder is present.");
      }

      // Define desired sample rate
      const desiredSampleRate = 16000;
      // Request user media with explicit sample rate constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: desiredSampleRate },
          channelCount: { ideal: 1 }, // Mono audio is often sufficient and reduces data
          // You can add more constraints as needed
          ...this._config.audio, // Merge with existing audio config if any
        },
      });
      this.stream = stream;
      this.track = new Track(stream.getTracks()[0], ETrackOrigin.Local);
      this.recorder = new MediaRecorder(stream, {
        mimeType: "audio/wav",
      });
      // Create AudioContext with the desired sample rate
      const audioContext = new AudioContext({ sampleRate: desiredSampleRate });
      this.audioContext = audioContext;
      this.remoteAudioDestination =
        this.audioContext.createMediaStreamDestination();
      this._logger?.info(this._logLabel, "Created Audio context");
      // Log the actual sample rate to verify
      this._logger?.info(
        this._logLabel,
        `Actual AudioContext sample rate: ${this.audioContext.sampleRate}`
      );
      /**
       * Setup the AudioWorklet `audioProcessor`. It decodes the b64 encoded audio, and plays it.
       */
      const workletURL = await getRealtimeWebsocketAudioProcessorURL();
      await this.audioContext.audioWorklet.addModule(workletURL);
      this._logger?.info(this._logLabel, "Added audio worklet module");
      this.audioWorkletNode = new AudioWorkletNode(
        audioContext,
        "audio-processor"
      );
      this.audioWorkletNode.onprocessorerror = (ev: Event) => {
        this._logger?.error(
          this._logLabel,
          "AudioWorklet processor error:",
          ev
        );
      };
      this.audioWorkletNode.port.onmessage = (event) => {
        if (!this.remoteAudioDestination) return;
        switch (event.data) {
          case "agent_start_talking":
            this._logger?.info(this._logLabel, "Received agent_start_talking");
            this.isPlaying = true;
            this.audioStartTime = new Date().getTime() / 1000;
            break;
          case "agent_stop_talking":
            this._logger?.info(this._logLabel, "Received agent_stop_talking");
            this.isPlaying = false;
            this.audioStartTime = 0;
            break;
          default:
            this._logger?.warn(
              this._logLabel,
              "Unknown event.data received",
              event.data
            );
        }
      };
      this.audioWorkletNode?.connect(this.remoteAudioDestination);
      this._logger?.info(this._logLabel, "Audio setup complete");
      return {
        ok: true,
      };
    } catch (error) {
      this._logger?.error(this._logLabel, "Error setting up audio", error);
      return {
        error,
      };
    }
  }

  processAudioPayload(payload: TRealtimeWebsocketAudioProcessPayload) {
    if (typeof payload !== "object" || !payload || !payload.type) {
      return;
    }

    switch (payload.type) {
      case "audio":
        this._playAudio(payload);
        break;
      case "audio_end":
        this._stopPlayingAudio();
        break;
      default:
        this._logger?.warn(this._logLabel, "Unknown payload type", payload);
    }
  }

  async disconnect() {
    this.recorder?.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
    this._stopPlayingAudio();
    this.remoteAudioDestination = null;
    this.track = null;

    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.onmessage = null;
    }
    this.audioContext?.close();
    this.audioContext = null;
    this.audioWorkletNode = null;
  }

  getMetadata(): TResponse {
    if (!this.stream) {
      this._logger?.warn(this._logLabel, "No audio stream available");
      return { error: "No audio stream available" };
    }

    try {
      const audioSettings = this.stream.getTracks()[0].getSettings();

      this._logger?.debug(this._logLabel, "Audio settings:", audioSettings);
      const inputAudioMetadata = {
        samplingRate: audioSettings.sampleRate || this.audioContext?.sampleRate,
        audioEncoding: "linear16",
      };

      return {
        ok: true,
        data: {
          inputSampleRate: inputAudioMetadata.samplingRate,
          outputSampleRate: this.audioContext?.sampleRate,
        },
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

  getRemoteAudioTrack(): TResponse<string, Track> {
    if (!this.audioContext) {
      this._logger?.debug(
        this._logLabel,
        "getRemoteAudioTrack is called but this.audioContext is not defined. Returning without throwing error."
      );
      return { error: "No audio context available" };
    }

    if (this.remoteAudioTrack) {
      return { ok: true, data: this.remoteAudioTrack };
    }

    try {
      if (!this.remoteAudioDestination) {
        throw new Error("remoteAudioDestination is not defined");
      }

      const track = new Track(
        this.remoteAudioDestination.stream.getTracks()[0],
        ETrackOrigin.Remote
      );

      this.remoteAudioTrack = track;

      return { ok: true, data: this.remoteAudioTrack };
    } catch (error) {
      return { error: "Error creating remote audio destination" };
    }
  }
}
