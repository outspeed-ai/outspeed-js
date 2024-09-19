import { test, describe, expect } from "vitest";
import { createConfig } from "../create-config";

describe("The create-config", () => {
  test("should throw an error if the input is not valid.", () => {
    // @ts-expect-error This is a test
    expect(() => createConfig()).toThrowError();

    // @ts-expect-error This is a test
    expect(() => createConfig(undefined)).toThrowError();

    // @ts-expect-error This is a test
    expect(() => createConfig(null)).toThrowError();

    expect(() => createConfig({})).toThrowError();
  });

  test("should return a valid config if function or offer url is defined.", () => {
    expect(createConfig({ functionURL: "https://infra.adapt.ai" })).toEqual({
      functionURL: "https://infra.adapt.ai",
      offerURL: undefined,
      videoTransform: undefined,
      dataChannelOptions: { ordered: true },
      rtcConfig: undefined,
      audio: false,
      video: false,
      screen: undefined,
      logger: undefined,
      codec: { audio: "PCMU/8000", video: undefined },
    });

    expect(createConfig({ offerURL: "https://infra.adapt.ai" })).toEqual({
      offerURL: "https://infra.adapt.ai",
      functionURL: undefined,
      videoTransform: undefined,
      dataChannelOptions: { ordered: true },
      rtcConfig: undefined,
      audio: false,
      video: false,
      screen: undefined,
      logger: undefined,
      codec: { audio: "PCMU/8000", video: undefined },
    });
  });

  test("should set correct audio and video config.", () => {
    expect(
      createConfig({
        functionURL: "https://infra.adapt.ai",
        audioCodec: "default",
        videoCodec: "H264/90000",
        audioDeviceId: "123",
        videoDeviceId: "123",
      })
    ).toEqual({
      functionURL: "https://infra.adapt.ai",
      offerURL: undefined,
      videoTransform: undefined,
      dataChannelOptions: { ordered: true },
      rtcConfig: undefined,
      audio: {
        deviceId: "123",
      },
      video: {
        deviceId: "123",
      },
      screen: undefined,
      logger: undefined,
      codec: { audio: "default", video: "H264/90000" },
    });
  });
});
