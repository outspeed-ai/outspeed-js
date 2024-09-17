import { test, describe, expect, beforeAll, afterAll, vi } from "vitest";
import {
  MOCK_AUDIO_INPUT_DEVICE,
  MOCK_SCREEN_INPUT_DEVICE,
  MOCK_VIDEO_INPUT_DEVICE,
  MockedRTCPeerConnection,
  getMockedNavigator,
} from "../../__mocks__";
import { RealtimeConnectionMediaManager } from "../../RealtimeConnection";
import { createConfig } from "../../create-config";

describe("The RealtimeConnectionMediaManager", () => {
  beforeAll(() => {
    global.MediaStream = vi.fn();
  });
  test("should setup with only audio access.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      userDevices: [MOCK_AUDIO_INPUT_DEVICE],
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "AudioInput1",
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeTruthy();
    expect(mediaManager.localStreams.audio.length).toBe(1);
    expect(mediaManager.localStreams.video.length).toBe(0);
    expect(mediaManager.localStreams.screen.length).toBe(0);
    // To add audio track, it should be called one time
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(1);
  });

  test("should setup with only video access.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      userDevices: [MOCK_VIDEO_INPUT_DEVICE],
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      videoDeviceId: "VideoInput1",
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeTruthy();
    expect(mediaManager.localStreams.audio.length).toBe(0);
    expect(mediaManager.localStreams.video.length).toBe(1);
    expect(mediaManager.localStreams.screen.length).toBe(0);
    // To add video track, it should be called one time
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(1);
  });

  test("should setup with both audio and video access.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      userDevices: [MOCK_VIDEO_INPUT_DEVICE, MOCK_AUDIO_INPUT_DEVICE],
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      videoDeviceId: "VideoInput1",
      audioDeviceId: "AudioInput1",
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeTruthy();
    expect(mediaManager.localStreams.audio.length).toBe(1);
    expect(mediaManager.localStreams.video.length).toBe(1);
    expect(mediaManager.localStreams.screen.length).toBe(0);

    // To add audio  and video track, it should be called two times
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(2);
  });

  test("should setup with only screen share access.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      userDevices: [MOCK_VIDEO_INPUT_DEVICE, MOCK_AUDIO_INPUT_DEVICE],
      screenDevices: [MOCK_SCREEN_INPUT_DEVICE],
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      screenConstraints: {},
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeTruthy();
    expect(mediaManager.localStreams.audio.length).toBe(0);
    expect(mediaManager.localStreams.video.length).toBe(0);
    expect(mediaManager.localStreams.screen.length).toBe(1);

    // To add screen track, it should be called one time.
    // In the mock we are only adding video input, therefore expecting
    // it should be called once.
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(1);
  });

  test("should setup with audio, video and screen access.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      userDevices: [MOCK_VIDEO_INPUT_DEVICE, MOCK_AUDIO_INPUT_DEVICE],
      screenDevices: [MOCK_SCREEN_INPUT_DEVICE],
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      videoDeviceId: "VideoInput1",
      audioDeviceId: "AudioInput1",
      screenConstraints: {},
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeTruthy();
    expect(mediaManager.localStreams.audio.length).toBe(1);
    expect(mediaManager.localStreams.video.length).toBe(1);
    expect(mediaManager.localStreams.screen.length).toBe(1);
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(3);
  });

  test("should handle the case if access to the requested user media is rejected.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      userDevices: [MOCK_VIDEO_INPUT_DEVICE, MOCK_AUDIO_INPUT_DEVICE],
      shouldReject: true,
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      videoDeviceId: "VideoInput1",
      audioDeviceId: "AudioInput1",
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeFalsy();
    expect(mediaManager.localStreams.audio.length).toBe(0);
    expect(mediaManager.localStreams.video.length).toBe(0);
    expect(mediaManager.localStreams.screen.length).toBe(0);
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(0);
  });

  test("should handle the case if access to the requested display media is rejected.", async () => {
    // To fix type we are using never.
    const peerConnection = new MockedRTCPeerConnection();

    const navigator = getMockedNavigator({
      screenDevices: [MOCK_SCREEN_INPUT_DEVICE],
      shouldReject: true,
    });

    global.navigator = navigator as never;

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      screenConstraints: {},
    });

    const mediaManager = new RealtimeConnectionMediaManager(
      peerConnection as never,
      config
    );

    const response = await mediaManager.setup();

    expect(response.ok).toBeFalsy();
    expect(mediaManager.localStreams.audio.length).toBe(0);
    expect(mediaManager.localStreams.video.length).toBe(0);
    expect(mediaManager.localStreams.screen.length).toBe(0);
    expect(peerConnection.addTrack).toHaveBeenCalledTimes(0);
  });

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).navigator;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).MediaStream;
  });
});
