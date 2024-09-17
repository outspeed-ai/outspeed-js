import { test, describe, expect, beforeAll, afterAll, vi } from "vitest";
import {
  MockedRTCPeerConnection,
  MockedRTCSessionDescription,
} from "../../__mocks__";
import { RealtimeConnectionNegotiator } from "../../RealtimeConnection/RealtimeConnectionNegotiator";
import { getMockedFetch } from "../../__mocks__/MockedFetch.mock";

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

describe("The RealtimeConnectionNegotiator", () => {
  beforeAll(() => {
    global.patchMockedFetch = getMockedFetch();
    global.fetch = global.patchMockedFetch.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.RTCSessionDescription = MockedRTCSessionDescription as any;
  });

  test("should return error if failed to setLocalDescription.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://infra.adapt.ai",
    });
    const peerConnection = new MockedRTCPeerConnection({
      shouldFailLocalDescription: true,
    });

    const config = {
      functionURL: "https://infra.adapt.ai",
    };

    const negotiator = new RealtimeConnectionNegotiator(
      peerConnection as never,
      config
    );

    const response = await negotiator.negotiateAndUpdatePeerConnection();

    expect(response.ok).toBeFalsy();
    expect(response.error).toBe("Failed to create and set local offer.");
  });

  test("should return error if failed to create and set local offer", async () => {
    const peerConnection = new MockedRTCPeerConnection({
      shouldFailLocalDescription: true,
    });

    const config = {
      functionURL: "https://infra.adapt.ai",
    };

    const negotiator = new RealtimeConnectionNegotiator(
      peerConnection as never,
      config
    );

    const response = await negotiator.negotiateAndUpdatePeerConnection();

    // As in the mocked constructor, shouldFailLocalDescription is set to true, so the response should be an error
    expect(response.ok).toBeFalsy();
  });

  test("should return error if failed to get offer URL", async () => {
    global.patchMockedFetch.update(false, "some random error", 0);

    const peerConnection = new MockedRTCPeerConnection();

    const config = {
      functionURL: "https://infra.adapt.ai",
    };

    const negotiator = new RealtimeConnectionNegotiator(
      peerConnection as never,
      config
    );

    const response = await negotiator.negotiateAndUpdatePeerConnection();

    // For fetch we are asking to reject the promise, so the response should be an error.
    expect(response.ok).toBeFalsy();
    expect(response.error).toBe("Failed during getting offer URL.");

    // Also it should called fetch more than 3 times
    expect(global.patchMockedFetch.totalCalled()).toBeGreaterThan(3);
  });

  test("should return error if failed to setRemoteDescription.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://infra.adapt.ai",
    });
    const peerConnection = new MockedRTCPeerConnection({
      shouldFailRemoteDescription: true,
    });

    const config = {
      functionURL: "https://infra.adapt.ai",
    };

    const negotiator = new RealtimeConnectionNegotiator(
      peerConnection as never,
      config
    );

    const response = await negotiator.negotiateAndUpdatePeerConnection();

    expect(response.ok).toBeFalsy();
    expect(response.error).toBe(
      "Failed during sending offer or during setting remote description."
    );
  });

  test("should able to negotiate and update peer connection.", async () => {
    global.patchMockedFetch.update(true, undefined, {
      address: "https://infra.adapt.ai",
    });
    const peerConnection = new MockedRTCPeerConnection();

    const config = {
      functionURL: "https://infra.adapt.ai",
    };

    const negotiator = new RealtimeConnectionNegotiator(
      peerConnection as never,
      config
    );

    const response = await negotiator.negotiateAndUpdatePeerConnection();

    expect(response.ok).toBeTruthy();
  });

  test("should able to negotiate and update peer connection if offer url is given.", async () => {
    global.patchMockedFetch.update(true, undefined, { ok: true });

    const peerConnection = new MockedRTCPeerConnection();

    const config = {
      offerURL: "https://us0.getadapt.ai:8080/offer",
    };

    const negotiator = new RealtimeConnectionNegotiator(
      peerConnection as never,
      config
    );

    const response = await negotiator.negotiateAndUpdatePeerConnection();

    expect(response.ok).toBeTruthy();
    /**
     * If offerURL is provided, the it shouldn't call fetch to get offerURL.
     *
     * total fetch call should be 1 because we are calling fetch to send the offer
     * to the server/backend.
     */
    expect(global.patchMockedFetch.totalCalled()).toBe(1);
  });

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).f;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).RTCSessionDescription;
  });
});
