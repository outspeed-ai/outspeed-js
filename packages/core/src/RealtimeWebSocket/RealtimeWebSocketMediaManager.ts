import {
  IMediaRecorder,
  MediaRecorder,
  register,
} from "extendable-media-recorder";
import { connect as wavEncodedConnect } from "extendable-media-recorder-wav-encoder";

import { ETrackOrigin, Track } from "../shared/Track";
import { TLogger, TRealtimeWebSocketConfig, TResponse } from "../shared/@types";
import { RealtimeWebSocketMediaPlayer } from "./RealtimeWebSocketMediaPlayer";

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
  audioStartTime: number;
  audioEndTime: number;
  audioWorkletNode: AudioWorkletNode | null;
  player: RealtimeWebSocketMediaPlayer;

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
    this.player = new RealtimeWebSocketMediaPlayer({ logger: this._logger });
  }

  async setup() {
    try {
      if (!MediaRecorder.isTypeSupported("audio/wav")) {
        this.wavEncoderPort = await wavEncodedConnect();
        await register(this.wavEncoderPort);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        /**
         * If this._config.audio is not defined, then we will use the default
         * audio device. By setting audio to `true`, the browser
         * will pick the default audio device for the user.
         *
         */
        audio: this._config.audio || true,
      });
      this.stream = stream;
      this.track = new Track(stream.getTracks()[0], ETrackOrigin.Local);
      this.recorder = new MediaRecorder(stream, {
        mimeType: "audio/wav",
      });

      this._logger?.info(this._logLabel, "Created Audio context");

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
        payload.data && this.player.push(payload.data);
        break;
      case "audio_end":
        // this._stopPlayingAudio();
        console.log("AudioEnd");
        break;
      default:
        this._logger?.warn(this._logLabel, "Unknown payload type", payload);
    }
  }

  async disconnect() {
    this.recorder?.stop();
    this.player.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
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

      this._logger?.info(this._logLabel, "Audio settings:", audioSettings);
      const inputAudioMetadata = {
        samplingRate: audioSettings.sampleRate || this.player.sampleRate,
        audioEncoding: "linear16",
      };

      return {
        ok: true,
        data: {
          inputSampleRate: inputAudioMetadata.samplingRate,
          outputSampleRate: this.player.sampleRate,
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
}
