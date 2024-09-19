import { vi } from "vitest";

export type TMockedUserDevice = {
  deviceId: string;
  kind: "videoinput" | "audioinput" | "audiooutput";
  label: string;
};

export type TGetMockedNavigatorOptions = {
  /**
   * User devices to return
   */
  userDevices?: TMockedUserDevice[];
  /**
   * Screen devices to return
   */
  screenDevices?: TMockedUserDevice[];
  /**
   * If true the promise should reject.
   *
   * @default false
   */
  shouldReject?: boolean;
};

export const MOCK_AUDIO_INPUT_DEVICE: TMockedUserDevice = {
  deviceId: "audio1",
  kind: "audioinput",
  label: "AudioInput 1",
};

export const MOCK_VIDEO_INPUT_DEVICE: TMockedUserDevice = {
  deviceId: "video1",
  kind: "videoinput",
  label: "Camera 1",
};

export const MOCK_SCREEN_INPUT_DEVICE: TMockedUserDevice = {
  deviceId: "screen1",
  kind: "videoinput",
  label: "Screen 1",
};

export function makeStreamFromUserDevices(userDevices: TMockedUserDevice[]) {
  const tracks = userDevices.map((device) => ({
    kind: device.kind.includes("audio") ? "audio" : "video",
    stop: vi.fn(),
  }));

  return {
    getTracks: vi.fn(() => tracks),
  };
}

export function getMockedNavigator(options = {} as TGetMockedNavigatorOptions) {
  const {
    userDevices = [],
    screenDevices = [],
    shouldReject = false,
  } = options;

  return {
    mediaDevices: {
      getUserMedia: vi.fn(() =>
        shouldReject
          ? Promise.reject()
          : Promise.resolve(makeStreamFromUserDevices(userDevices))
      ),
      getDisplayMedia: vi.fn(() =>
        shouldReject
          ? Promise.reject()
          : Promise.resolve(makeStreamFromUserDevices(screenDevices))
      ),
      enumerateDevices: vi.fn(() => Promise.resolve(userDevices)),
    },
  };
}
