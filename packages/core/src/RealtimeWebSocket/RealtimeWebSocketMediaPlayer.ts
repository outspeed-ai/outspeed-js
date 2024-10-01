import { ETrackOrigin, Track } from "../shared/Track";
import { TLogger, TResponse } from "../shared/@types";
import { base64ToArrayBuffer, createWavHeader } from "../utils";

export type TRealtimeWebSocketMediaPlayerOptions = {
  /**
   * @default 16000
   */
  sampleRate?: number;
  /**
   * @default 1
   */
  numChannels?: number;
  /**
   * logger.
   */
  logger?: TLogger;
};

export class RealtimeWebSocketMediaPlayer {
  private readonly _logLabel = "RealtimeWebSocketMediaPlayer";
  private readonly _logger: TLogger | undefined;
  private audioData: ArrayBufferLike[];
  isPlaying: boolean;
  sampleRate: number;
  numberChannels: number;
  audioContext: AudioContext;
  remoteAudioDestination?: MediaStreamAudioDestinationNode | null;
  remoteAudioTrack?: Track | null;
  source?: AudioBufferSourceNode | null;
  audioStartTime: number;
  audioEndTime: number;

  constructor(options = {} as TRealtimeWebSocketMediaPlayerOptions) {
    const { logger, numChannels = 1, sampleRate = 16000 } = options;
    this._logger = logger;
    this.audioData = [];
    this.isPlaying = false;
    this.numberChannels = numChannels;
    this.sampleRate = sampleRate;
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    this.audioEndTime = 0;
    this.audioStartTime = 0;
  }

  push(base64string: string) {
    // if (!this.remoteAudioDestination) {
    //   this._logger?.info(
    //     this._logLabel,
    //     "Not pushing audio data, `remoteAudioDestination` is not defined."
    //   );
    //   return;
    // }

    const pcmData = base64ToArrayBuffer(base64string);
    const numFrames = pcmData.byteLength / (this.numberChannels * 2); // 2 bytes per sample for 16-bit PCM
    const waveHeader = createWavHeader(
      this.sampleRate,
      this.numberChannels,
      numFrames
    );

    const waveBuffer = new Uint8Array(
      waveHeader.byteLength + pcmData.byteLength
    );
    waveBuffer.set(new Uint8Array(waveHeader), 0);
    waveBuffer.set(new Uint8Array(pcmData), waveHeader.byteLength);

    this.audioData.push(waveBuffer.buffer);
    this.play();
  }

  async play() {
    console.log("Play is called", this.isPlaying);
    /**
     * Early return if already playing an audio.
     */
    if (this.isPlaying) return;
    this.isPlaying = true;

    const buffer = this.audioData.shift();
    if (!buffer) return;

    let audioBuffer: AudioBuffer | undefined;

    try {
      audioBuffer = await this.audioContext.decodeAudioData(buffer);
    } catch (error) {
      this._logger?.error(
        this._logLabel,
        "Failed to decode audio data.",
        error
      );
      return;
    }

    try {
      this.isPlaying = true;
      this.audioContext.resume();
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;
      if (this.remoteAudioDestination) {
        this.source.connect(this.remoteAudioDestination);
      } else {
        this.source.connect(this.audioContext.destination);
      }
      this.source.start(0);
      this._logger?.info(this._logLabel, "Playing audio");
    } catch (error) {
      this.isPlaying = false;
      this._logger?.error(this._logLabel, "Error playing audio", error);

      return {
        error,
      };
    }

    this.audioStartTime = new Date().getTime();

    return new Promise((resolve, reject) => {
      try {
        if (this.source) {
          this.source.onended = () => {
            this.isPlaying = false;
            this.audioEndTime = new Date().getTime();

            if (
              this.audioContext &&
              this.source instanceof AudioBufferSourceNode
            ) {
              if (this.remoteAudioDestination) {
                this.source.disconnect(this.remoteAudioDestination);
              } else {
                this.source.disconnect(this.audioContext.destination);
              }
            }
            this.play();
            resolve({ ok: true });
          };
        }
      } catch (error) {
        this.isPlaying = false;
        this._logger?.error(this._logLabel, "Error playing audio", error);
        reject({ error });
      }
    });
  }

  disconnect() {
    this.remoteAudioDestination = null;
    this.remoteAudioTrack = null;
    this.isPlaying = false;
    this.audioData = [];
  }

  getRemoteAudioTrack(): TResponse<string, Track> {
    console.log(
      "Auiod",
      this.audioContext,
      this.remoteAudioDestination,
      this.remoteAudioTrack
    );
    if (!this.audioContext) {
      return { error: "No audio context available" };
    }

    if (this.remoteAudioTrack) {
      return { ok: true, data: this.remoteAudioTrack };
    }

    try {
      this.remoteAudioDestination =
        this.audioContext.createMediaStreamDestination();
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
