/**
 * Specifies the video codec to be used for encoding video streams.
 * - `default`: Use the browser's default video codec.
 * - `VP8/90000`: Use the VP8 video codec with a 90000 Hz clock rate.
 * - `H264/90000`: Use the H.264 video codec with a 90000 Hz clock rate.
 */
export type TVideoCodec = "default" | "VP8/90000" | "H264/90000";

/**
 * Specifies the type of transformation or effect to apply to the video stream.
 * - `none`: No transformation is applied.
 * - `edges`: Applies an edge-detection filter.
 * - `cartoon`: Applies a cartoon-like effect.
 * - `rotate`: Rotates the video.
 */
export type TVideoTransform = "none" | "edges" | "cartoon" | "rotate";

/**
 * Configuration for the video track.
 * - If `boolean`: Enables (`true`) or disables (`false`) the video track.
 * - If `MediaTrackConstraints`: Specifies detailed constraints for the video track, such as resolution and frame rate.
 */
export type TVideoConfig = boolean | MediaTrackConstraints;

/**
 * Specifies the audio codec to be used for encoding audio streams.
 * - `default`: Use the browser's default audio codec.
 * - `opus/48000/2`: Use the Opus audio codec with a 48 kHz sample rate and 2 channels.
 * - `PCMU/8000`: Use the PCM μ-law audio codec with an 8 kHz sample rate.
 * - `PCMA/8000`: Use the PCM A-law audio codec with an 8 kHz sample rate.
 */
export type TAudioCodec =
  | "default"
  | "opus/48000/2"
  | "PCMU/8000"
  | "PCMA/8000";

/**
 * Configuration for the audio track.
 * - If `boolean`: Enables (`true`) or disables (`false`) the audio track.
 * - If `MediaTrackConstraints`: Specifies detailed constraints for the audio track, such as sample rate and echo cancellation.
 */
export type TAudioConfig = boolean | MediaTrackConstraints;

/**
 * Audio and video codec settings, such as preferred codec types.
 */
export type TCodecConfig = {
  /**
   * Audio codec.
   */
  audio?: TAudioCodec;
  /**
   * Video Codec.
   */
  video?: TVideoCodec;
};

export type TTransceiver = {
  /**
   * Transceiver kind.
   */
  kind: "audio" | "video";
  /**
   * Init options for the transceiver.
   */
  options: RTCRtpTransceiverInit;
};

export type TLogger = {
  /**
   * Logs debug information with a specified label and any additional data.
   * @param label - A descriptive label for the log entry.
   * @param all - Additional data to log.
   */
  debug: (label: string, ...all: unknown[]) => void;

  /**
   * Logs general information with a specified label and any additional data.
   * @param label - A descriptive label for the log entry.
   * @param all - Additional data to log.
   */
  info: (label: string, ...all: unknown[]) => void;

  /**
   * Logs warnings with a specified label and any additional data.
   * Used for logging potential issues that aren't errors but may require attention.
   * @param label - A descriptive label for the warning entry.
   * @param all - Additional data related to the warning.
   */
  warn: (label: string, ...all: unknown[]) => void;

  /**
   * Logs error messages with a specified label and any additional data.
   * Typically used for logging errors or exceptions.
   * @param label - A descriptive label for the error entry.
   * @param all - Additional data related to the error.
   */
  error: (label: string, ...all: unknown[]) => void;
};

export type TRealtimeConfig = {
  /**
   * URL of the function to be invoked for establishing a connection.
   */
  functionURL?: string;

  /**
   * Offer URL for local testing. If both `functionURL` and `offerURL` are provided,
   * `functionURL` will be preferred.
   */
  offerURL?: string;

  /**
   * Configuration for the video stream, including constraints and settings.
   */
  video?: TVideoConfig;

  /**
   * Configuration for the audio stream, including constraints and settings.
   */
  audio?: TAudioConfig;

  /**
   * Audio and video codec settings, such as preferred codec types.
   */
  codec?: TCodecConfig;

  /**
   * To add transceivers.
   *
   * @example
   * config = {
   *  functionURL: "https://infra.adapt.ai",
   *  addTransceivers: [
   *    {
   *      kind: "audio",
   *      options: {
   *        direction: "recvonly"
   *      }
   *    }
   *  ]
   * }
   */
  addTransceivers?: TTransceiver[];

  /**
   * Configuration for video transformations, such as filters or effects applied to the video stream.
   */
  videoTransform?: TVideoTransform;

  /**
   * Options for screen sharing, as provided by the `getDisplayMedia` API.
   */
  screen?: DisplayMediaStreamOptions;

  /**
   * Configuration options for an RTC data channel, such as ordered delivery and maximum retransmits.
   */
  dataChannelOptions?: RTCDataChannelInit;

  /**
   * RTC configuration for the peer connection, including ICE servers and other connection settings.
   */
  rtcConfig?: RTCConfiguration;

  /**
   * Logger configuration for handling and storing logs related to the connection.
   */
  logger?: TLogger;
};

export type TRealtimeWebSocketConfig = {
  /**
   * URL of the function to be invoked for establishing a connection.
   */
  functionURL?: string;

  /**
   * Audio config.
   */
  audio?: MediaTrackConstraints;

  /**
   * Websocket protocols.
   */
  protocols?: string | string[];

  /**
   * Logger configuration for handling and storing logs related to the connection.
   */
  logger?: TLogger;
};

export type TMedia = {
  /**
   * The media track, which represents a single media track within a stream,
   * such as an audio or video track.
   */
  track: MediaStreamTrack;

  /**
   * The media stream that contains one or more media tracks, such as audio or video.
   */
  stream: MediaStream;
};

export type TResponse<E = unknown, T = unknown> = {
  /**
   * Indicates whether the operation was successful.
   */
  ok?: boolean;

  /**
   * Contains error information if the operation failed.
   */
  error?: E;

  /**
   * The data returned from the operation, if successful.
   */
  data?: T;
};
