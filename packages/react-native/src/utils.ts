import {
  TAudioCodec,
  TAudioConfig,
  TRealtimeConfig,
  TVideoCodec,
  TVideoConfig,
  TVideoTransform,
  TLogger,
  TTransceiver,
} from "./@types";

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  backoff: number = 1000,
  ignoreRetryIfStatusCodeIs: number[] = []
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      // Attempt the fetch request
      const response = await fetch(url, options);

      // If the response is ok (status in the range 200-299), return it
      if (response.ok) {
        return response;
      } else if (ignoreRetryIfStatusCodeIs.includes(response.status)) {
        return response;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      // If this was the last attempt, rethrow the error
      if (i === retries - 1) {
        let msg = "Unknown";

        if (error instanceof Error) {
          msg = error.message;
        }

        throw new Error(`Fetch failed after ${retries} attempts: ${msg}`);
      }

      // Otherwise, wait for the backoff time before retrying
      await new Promise((resolve) => setTimeout(resolve, backoff));

      // Exponentially increase the backoff time
      backoff *= 2;
    }
  }

  // This line should never be reached, but TypeScript requires a return type
  throw new Error("Unexpected error");
}

/**
 * The input parameters for creating a real-time configuration.
 */
export type TCreateConfigInput = {
  /** The URL of the function to be used in the configuration. */
  functionURL?: string;
  /** Optional URL for local testing; if both `functionURL` and `offerURL` are provided, `functionURL` is preferred. */
  offerURL?: string;
  /** Optional device ID for the audio input device. */
  audioDeviceId?: string;
  /** Optional device ID for the video input device. */
  videoDeviceId?: string;
  /** Optional media track constraints for audio. */
  audioConstraints?: MediaTrackConstraints;
  /** Optional media track constraints for video. */
  videoConstraints?: MediaTrackConstraints;
  /** Optional codec for audio; defaults to "PCMU/8000". */
  audioCodec?: TAudioCodec;
  /** Optional codec for video. */
  videoCodec?: TVideoCodec;
  /** Optional video transformation type. */
  videoTransform?: TVideoTransform;
  /** Optional options for the RTC data channel. */
  dataChannelOptions?: RTCDataChannelInit;
  /** Optional RTC configuration object. */
  rtcConfig?: RTCConfiguration;
  /** Optional logger for logging purposes. */
  logger?: TLogger;
};

/**
 * Creates a real-time configuration object based on the provided input parameters.
 *
 * @param {TCreateConfigInput} input - The input parameters for creating the configuration.
 * @returns {TRealtimeConfig} - The generated real-time configuration object.
 * @throws {Error} If the input is not a valid object or if neither `functionURL` nor `offerURL` is provided.
 */
export function createConfig(input: TCreateConfigInput): TRealtimeConfig {
  // Validate the input object
  if (typeof input !== "object" || !input) {
    throw new Error("Input is not valid.");
  }

  const {
    functionURL,
    offerURL,
    audioCodec = "PCMU/8000",
    audioConstraints,
    videoConstraints,
    dataChannelOptions,
    rtcConfig,
    videoCodec,
    videoTransform,
    logger,
    audioDeviceId,
    videoDeviceId,
  } = input;

  // Ensure that either functionURL or offerURL is provided
  if (!functionURL && !offerURL) {
    throw new Error("Either `functionURL` or `offerURL` is required.");
  }

  let audio: TAudioConfig = false;
  let video: TVideoConfig = false;
  const addTransceivers: TTransceiver[] = [];

  // Combine audio constraints with the provided audio device ID
  if (audioConstraints || audioDeviceId) {
    audio = {
      ...audioConstraints,
      deviceId: audioDeviceId,
    };
  }

  // Combine video constraints with the provided video device ID
  if (videoConstraints || videoDeviceId) {
    video = {
      ...videoConstraints,
      deviceId: videoDeviceId,
    };
  }

  if (!audio) {
    /**
     * If local audio constraints is missing, meaning
     * we don't want to stream local audio. In this case
     * to receive any audio track from the backend we need
     * to add a transceiver for audio.
     */
    addTransceivers.push({
      kind: "audio",
      options: {
        direction: "recvonly",
      },
    });
  }

  if (!video) {
    /**
     * If local video constraints is missing, meaning
     * we don't want to add stream local video. In this case
     * to receive any video track from the backend we need
     * to add a transceiver for video.
     */
    addTransceivers.push({
      kind: "video",
      options: {
        direction: "recvonly",
      },
    });
  }

  // Construct the real-time configuration object
  const config: TRealtimeConfig = {
    functionURL,
    offerURL,
    videoTransform,
    dataChannelOptions: {
      ordered: true,
      ...dataChannelOptions,
    },
    rtcConfig,
    audio,
    video,
    logger,
    addTransceivers,
  };

  // Add codec configurations if provided
  if (audioCodec || videoCodec) {
    config.codec = {
      audio: audioCodec,
      video: videoCodec,
    };
  }

  return config;
}
