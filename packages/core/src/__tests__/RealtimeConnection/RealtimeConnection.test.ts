import { test, describe, expect, beforeAll, afterAll, vi } from "vitest";
import {
  MOCK_AUDIO_INPUT_DEVICE,
  MOCK_VIDEO_INPUT_DEVICE,
  MockedRTCPeerConnection,
  MockedRTCSessionDescription,
  getMockedNavigator,
} from "../../__mocks__";
import { createConfig } from "../../create-config";
import { getMockedFetch } from "../../__mocks__/MockedFetch.mock";
import { RealtimeConnection } from "../../RealtimeConnection";

vi.mock("../../utils", async () => {
  const originalFetchWithRetry =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await vi.importActual("../../utils")).fetchWithRetry as any;

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchWithRetry: async (url: string, options: any, retries: number) => {
      return originalFetchWithRetry(url, options, retries, 10);
    },
    isAValidRTCSessionDescription: () => true,
  };
});

describe("The RealtimeConnection", () => {
  beforeAll(() => {
    // @ts-expect-error Mocking only the function that we need.
    global.MediaStream = vi.fn((tracks) => ({ getTracks: () => tracks }));
    const navigator = getMockedNavigator({
      userDevices: [MOCK_VIDEO_INPUT_DEVICE, MOCK_AUDIO_INPUT_DEVICE],
    });
    global.navigator = navigator as never;
    global.patchMockedFetch = getMockedFetch();
    global.fetch = global.patchMockedFetch.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.RTCSessionDescription = MockedRTCSessionDescription as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.RTCPeerConnection = MockedRTCPeerConnection as any;
  });
  test("should able to connect and disconnect.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://us.adapt.ai:8080/offer",
    });

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const connection = new RealtimeConnection(config);
    let response = await connection.connect();

    expect(response.ok).toBeTruthy();

    response = connection.disconnect();
    expect(response.ok).toBeTruthy();
  });

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).navigator;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).MediaStream;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).f;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).RTCSessionDescription;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).RTCPeerConnection;
  });
});
