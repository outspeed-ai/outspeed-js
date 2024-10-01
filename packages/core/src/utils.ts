import { snakeCase } from "change-case";
import { TRealtimeConfig } from "./shared/@types";

// Returns a list of all available audio devices.
type TAllUserMedia = {
  videoInputDevices: MediaDeviceInfo[];
  audioInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
};

export async function getAllUserMediaWithoutAskingForPermission(): Promise<TAllUserMedia> {
  const audioInputDevices: MediaDeviceInfo[] = [];
  const audioOutputDevices: MediaDeviceInfo[] = [];
  const videoInputDevices: MediaDeviceInfo[] = [];

  const devices = await navigator.mediaDevices.enumerateDevices();

  for (const device of devices) {
    switch (device.kind) {
      case "audioinput":
        audioInputDevices.push(device);
        break;
      case "audiooutput":
        audioOutputDevices.push(device);
        break;
      case "videoinput":
        videoInputDevices.push(device);
        break;
    }
  }

  function addIndexIfLabelMissing(
    mediaDevices: MediaDeviceInfo[],
    type: string
  ): MediaDeviceInfo[] {
    return mediaDevices.map((device, idx) => {
      const label = device.label ? device.label : `${type} #${idx}`;
      return {
        deviceId: device.deviceId,
        groupId: device.groupId,
        kind: device.kind,
        label,
        toJSON: device.toJSON,
      };
    });
  }

  return {
    audioInputDevices: addIndexIfLabelMissing(audioInputDevices, "Audio Input"),
    audioOutputDevices: addIndexIfLabelMissing(
      audioOutputDevices,
      "Audio Output"
    ),
    videoInputDevices: addIndexIfLabelMissing(videoInputDevices, "Video"),
  };
}

export async function getAllUserMedia(): Promise<TAllUserMedia> {
  let stream: undefined | MediaStream;
  try {
    /**
     * Asking for user's permission so that we have access
     * to the name of user's devices available.
     */
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  } catch (error) {
    console.log("Unable to get user's permission");
  }

  const devices = await getAllUserMediaWithoutAskingForPermission();

  if (stream) {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }
  return devices;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  backoff: number = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      // Attempt the fetch request
      const response = await fetch(url, options);

      // If the response is ok (status in the range 200-299), return it
      if (response.ok) {
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

export function isAValidRTCSessionDescription(
  obj: unknown
): obj is RTCSessionDescriptionInit {
  // Check if the object is non-null and of type 'object'
  if (obj && typeof obj === "object") {
    const rtcObj = obj as Partial<RTCSessionDescriptionInit>;

    // Check if 'type' exists and is one of the valid values
    const isValidType =
      rtcObj.type === "offer" ||
      rtcObj.type === "answer" ||
      rtcObj.type === "rollback";

    // Check if 'sdp' exists and is a string
    const isValidSdp =
      rtcObj.sdp === undefined || typeof rtcObj.sdp === "string";

    return isValidType && isValidSdp;
  }

  return false;
}

export function isMessageEvent(event: unknown): event is MessageEvent {
  return event instanceof MessageEvent;
}

export function isRTCTrackEvent(event: unknown): event is RTCTrackEvent {
  return event instanceof RTCTrackEvent;
}

export function isRTCDataChannelEvent(
  event: unknown
): event is RTCDataChannelEvent {
  return event instanceof RTCDataChannelEvent;
}

export function isRTCPeerConnectionIceEvent(
  event: unknown
): event is RTCPeerConnectionIceEvent {
  return event instanceof RTCPeerConnectionIceEvent;
}

export function isRTCPeerConnectionIceErrorEvent(
  event: unknown
): event is RTCPeerConnectionIceErrorEvent {
  return event instanceof RTCPeerConnectionIceErrorEvent;
}

export function isValidConfig(obj: unknown): obj is TRealtimeConfig {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (Array.isArray(obj)) return false;

  // A valid config should be an object containing either functionURL or offerURL.

  const keys = Object.keys(obj);

  if (!keys.find((key) => key === "functionURL" || key === "offerURL")) {
    return false;
  }

  if ("functionURL" in obj) {
    if (typeof obj.functionURL !== "string") {
      return false;
    }

    if (!obj.functionURL) {
      return false;
    }

    return true;
  }

  if ("offerURL" in obj) {
    if (typeof obj.offerURL !== "string") {
      return false;
    }

    if (!obj.offerURL) {
      return false;
    }

    return true;
  }

  return false;
}

export const stringify = (obj: object): string => {
  return JSON.stringify(obj, (_, value) => {
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [snakeCase(k), v])
      );
    }
    return value;
  });
};

export const blobToBase64 = (blob: Blob): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result?.toString().split(",")[1] || null);
    reader.readAsDataURL(blob);
  });
};

/**
 * Converts a Base64 encoded string to an ArrayBuffer.
 *
 * @param base64 - The Base64 encoded string to convert.
 * @returns An ArrayBuffer representation of the Base64 encoded string.
 */
export function base64ToArrayBuffer(base64: string): ArrayBufferLike {
  // Decode the Base64 string into a binary string
  const binaryString = atob(base64);

  // Get the length of the binary string
  const length = binaryString.length;

  // Create a Uint8Array to hold the bytes
  const bytes = new Uint8Array(length);

  // Convert each character of the binary string to a byte
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Return the underlying ArrayBuffer of the Uint8Array
  return bytes.buffer;
}

/**
 * Creates a WAV file header for raw PCM data.
 *
 * @param sampleRate - The number of samples per second (Hz).
 * @param numChannels - The number of audio channels (1 = mono, 2 = stereo).
 * @param numFrames - The total number of audio frames in the data.
 * @returns The ArrayBuffer containing the WAV file header.
 */
export function createWavHeader(
  sampleRate: number,
  numChannels: number,
  numFrames: number
): ArrayBuffer {
  // Create a buffer of 44 bytes for the WAV header
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // Write the "RIFF" identifier
  writeString(view, 0, "RIFF");

  // Write the file length (36 + data length)
  view.setUint32(4, 36 + numFrames * numChannels * 2, true);

  // Write the "WAVE" format identifier
  writeString(view, 8, "WAVE");

  // Write the format chunk identifier "fmt "
  writeString(view, 12, "fmt ");

  // Write the length of the format chunk (16 for PCM)
  view.setUint32(16, 16, true);

  // Write the audio format (1 for PCM - raw uncompressed audio)
  view.setUint16(20, 1, true);

  // Write the number of channels (mono = 1, stereo = 2)
  view.setUint16(22, numChannels, true);

  // Write the sample rate (samples per second)
  view.setUint32(24, sampleRate, true);

  // Write the byte rate (sampleRate * numChannels * bytesPerSample)
  view.setUint32(28, sampleRate * numChannels * 2, true);

  // Write the block align (numChannels * bytesPerSample)
  view.setUint16(32, numChannels * 2, true);

  // Write the bits per sample (16 bits for PCM)
  view.setUint16(34, 16, true);

  // Write the data chunk identifier "data"
  writeString(view, 36, "data");

  // Write the length of the data chunk (numFrames * numChannels * bytesPerSample)
  view.setUint32(40, numFrames * numChannels * 2, true);

  return buffer;
}

/**
 * Writes a string to a DataView at the specified byte offset.
 *
 * @param view - The DataView representing the buffer.
 * @param offset - The byte offset to start writing the string.
 * @param str - The string to write.
 */
export function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i) & 0xff);
  }
}
