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
import { createActor } from "xstate";
import { realtimeConnectionMachine } from "../../machine";

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

describe("The RealtimeConnection Machine", () => {
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
  test("should be in Init state when created.", async () => {
    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");
  });

  test("should not transition to SetupCompleted if no config is provided for the SETUP event.", async () => {
    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we try to send "SETUP_CONNECTION" without a payload then it
    // should transition to next state.
    // @ts-expect-error Intentionally not passing a payload.
    actor.send({ type: "SETUP_CONNECTION" });
    expect(currentState).not.toBe("SetupCompleted");

    // It should state at Init
    expect(currentState).toBe("Init");
  });

  test("should not transition to Connecting state if setup is not completed.", async () => {
    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    actor.send({ type: "CONNECT" });
    expect(currentState).not.toBe("Connecting");

    // It should state at Init
    expect(currentState).toBe("Init");
  });

  test("should be transition to SetupCompleted if config is provided.", async () => {
    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");
  });

  test("should be in Failed state if unable to connect to the remote connection.", async () => {
    // If we set the first parameter as false, then the fetch will reject all the request
    // it receives. Meaning the machine will failed to connect to the remote connection.
    global.patchMockedFetch.update(false, undefined, {});

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");

    actor.send({ type: "CONNECT" });
    expect(currentState).toBe("Connecting");

    let interval: NodeJS.Timeout | null = null;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Connecting the machine can only transition
        // to Connected or Failed.
        if (currentState === "Failed" || currentState === "Connected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Failed");
  });

  test("should be in Connected state if connected to the remote connection.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://us.adapt.ai:8080/offer",
    });

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");

    actor.send({ type: "CONNECT" });
    expect(currentState).toBe("Connecting");

    let interval: NodeJS.Timeout | null = null;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Connecting the machine can only transition
        // to Connected or Failed.
        if (currentState === "Failed" || currentState === "Connected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Connected");
  });

  test("should able to disconnect from Connected state.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://us.adapt.ai:8080/offer",
    });

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");

    actor.send({ type: "CONNECT" });
    expect(currentState).toBe("Connecting");

    let interval: NodeJS.Timeout | null = null;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Connecting the machine can only transition
        // to Connected or Failed.
        if (currentState === "Failed" || currentState === "Connected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Connected");

    actor.send({ type: "DISCONNECT" });
    expect(currentState).toBe("Disconnecting");

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Disconnecting the machine can only transition
        // to Disconnected or Failed.
        if (currentState === "Failed" || currentState === "Disconnected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Disconnected");
  });

  test("shouldn't reset from Connected state.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://us.adapt.ai:8080/offer",
    });

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");

    actor.send({ type: "CONNECT" });
    expect(currentState).toBe("Connecting");

    let interval: NodeJS.Timeout | null = null;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Connecting the machine can only transition
        // to Connected or Failed.
        if (currentState === "Failed" || currentState === "Connected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Connected");

    actor.send({ type: "RESET" });
    // From Connected state machine cannot be reset.
    // To reset first we need to disconnect.
    expect(currentState).toBe("Connected");
  });

  test("should able to reset from Failed state.", async () => {
    // If we set the first parameter as false, then the fetch will reject all the request
    // it receives. Meaning the machine will failed to connect to the remote connection.
    global.patchMockedFetch.update(false, undefined, {});

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");

    actor.send({ type: "CONNECT" });
    expect(currentState).toBe("Connecting");

    let interval: NodeJS.Timeout | null = null;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Connecting the machine can only transition
        // to Connected or Failed.
        if (currentState === "Failed" || currentState === "Connected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Failed");

    actor.send({ type: "RESET" });
    expect(currentState).toBe("Init");
  });

  test("should able to reset from Disconnected state.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://us.adapt.ai:8080/offer",
    });

    const config = createConfig({
      functionURL: "https://infra.adapt.ai",
      audioDeviceId: "123",
      videoDeviceId: "123",
    });

    const actor = createActor(realtimeConnectionMachine);
    let currentState = "";

    actor.subscribe((snapshot) => {
      currentState = snapshot.value;
    });

    actor.start();
    // In the beginning the state should be Init.
    expect(currentState).toBe("Init");

    // If we pass the payload then it should transition to "SetupCompleted"
    actor.send({ type: "SETUP_CONNECTION", payload: { config } });
    expect(currentState).toBe("SetupCompleted");

    actor.send({ type: "CONNECT" });
    expect(currentState).toBe("Connecting");

    let interval: NodeJS.Timeout | null = null;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Connecting the machine can only transition
        // to Connected or Failed.
        if (currentState === "Failed" || currentState === "Connected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Connected");

    actor.send({ type: "DISCONNECT" });
    expect(currentState).toBe("Disconnecting");

    await new Promise((resolve) => {
      interval = setInterval(() => {
        // From Disconnecting the machine can only transition
        // to Disconnected or Failed.
        if (currentState === "Failed" || currentState === "Disconnected") {
          resolve("");
        }
      }, 1000);
    });

    if (interval) {
      clearInterval(interval);
    }

    expect(currentState).toBe("Disconnected");

    actor.send({ type: "RESET" });
    expect(currentState).toBe("Init");
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
