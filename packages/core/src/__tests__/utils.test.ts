import { expect, test, describe } from "vitest";
import { isMessageEvent, isValidConfig } from "../utils";

describe("The isMessageEvent", () => {
  test("should properly identify message event type.", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let e: any = "";
    expect(isMessageEvent(e)).toBeFalsy();

    e = {};
    expect(isMessageEvent(e)).toBeFalsy();

    e = null;
    expect(isMessageEvent(e)).toBeFalsy();

    e = undefined;
    expect(isMessageEvent(e)).toBeFalsy();

    e = new Event("Message");
    expect(isMessageEvent(e)).toBeFalsy();

    e = new MessageEvent("message");
    expect(isMessageEvent(e)).toBeTruthy();
  });
});

describe("The isValidConfig", () => {
  test("should validate config correctly", () => {
    let config: any;

    expect(isValidConfig(config)).toBeFalsy();

    config = null;
    expect(isValidConfig(config)).toBeFalsy();

    config = "";
    expect(isValidConfig(config)).toBeFalsy();

    config = 0;
    expect(isValidConfig(config)).toBeFalsy();

    config = 1;
    expect(isValidConfig(config)).toBeFalsy();

    config = {};
    expect(isValidConfig(config)).toBeFalsy();

    config = { random: "124" };
    expect(isValidConfig(config)).toBeFalsy();

    config = { functionURL: 1 };
    expect(isValidConfig(config)).toBeFalsy();

    config = { functionURL: 0 };
    expect(isValidConfig(config)).toBeFalsy();

    config = { functionURL: "" };
    expect(isValidConfig(config)).toBeFalsy();

    config = { offerURL: 1 };
    expect(isValidConfig(config)).toBeFalsy();

    config = { offerURL: 0 };
    expect(isValidConfig(config)).toBeFalsy();

    config = { offerURL: "" };
    expect(isValidConfig(config)).toBeFalsy();

    config = { functionURL: "https://infra.adapt.in" };
    expect(isValidConfig(config)).toBeTruthy();

    config = { offerURL: "https://us.adapt.in/offer" };
    expect(isValidConfig(config)).toBeTruthy();

    config = {
      functionURL: "https://infra.adapt.in",
      offerURL: "https://us.adapt.in/offer",
    };
    expect(isValidConfig(config)).toBeTruthy();
  });
});
