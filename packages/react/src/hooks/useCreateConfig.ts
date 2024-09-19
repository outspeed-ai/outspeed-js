import React from "react";
import {
  createConfig,
  Logger,
  TAudioCodec,
  TRealtimeConfig,
  TVideoCodec,
  TVideoTransform,
} from "@outspeed/core";

/**
 * The shape of the variables used to create a configuration.
 */
export type TUseCreateConfigVariables = {
  functionURL: string;
  setFunctionURL: React.Dispatch<React.SetStateAction<string>>;
  offerURL: string;
  setOfferURL: React.Dispatch<React.SetStateAction<string>>;
  audioDeviceId: string;
  setAudioDeviceId: React.Dispatch<React.SetStateAction<string>>;
  audioConstraints: MediaTrackConstraints | undefined;
  setAudioConstraints: React.Dispatch<
    React.SetStateAction<MediaTrackConstraints | undefined>
  >;
  videoDeviceId: string;
  setVideoDeviceId: React.Dispatch<React.SetStateAction<string>>;
  videoConstraints: MediaTrackConstraints | undefined;
  setVideoConstraints: React.Dispatch<
    React.SetStateAction<MediaTrackConstraints | undefined>
  >;
  screenConstraints?: DisplayMediaStreamOptions;
  setScreenConstraints: React.Dispatch<
    React.SetStateAction<DisplayMediaStreamOptions | undefined>
  >;
  audioCodec: TAudioCodec;
  setAudioCodec: React.Dispatch<React.SetStateAction<TAudioCodec>>;
  videoCodec?: TVideoCodec;
  setVideoCodec?: React.Dispatch<React.SetStateAction<TVideoCodec>>;
  videoTransform: TVideoTransform;
  setVideoTransform: React.Dispatch<React.SetStateAction<TVideoTransform>>;
  dataChannelOptions?: RTCDataChannelInit;
  setDataChannelOptions: React.Dispatch<
    React.SetStateAction<RTCDataChannelInit | undefined>
  >;
  rtcConfig?: RTCConfiguration;
  setRTCConfig: React.Dispatch<
    React.SetStateAction<RTCConfiguration | undefined>
  >;
  logger?: Logger;
  setLogger: React.Dispatch<React.SetStateAction<Logger | undefined>>;
};

/**
 * The return type of the `useCreateConfig` hook, including the `getConfig` method.
 */
export type TUseCreateConfigReturn = TUseCreateConfigVariables & {
  /**
   * Generates and returns the real-time configuration object.
   * @returns {TRealtimeConfig} The generated configuration object.
   */
  getConfig: () => TRealtimeConfig;
};

/**
 * A custom hook to manage and create a real-time configuration.
 *
 * @returns {TUseCreateConfigReturn} The state variables and the function to generate the real-time configuration.
 */
export function useCreateConfig(): TUseCreateConfigReturn {
  const [functionURL, setFunctionURL] = React.useState("");
  const [offerURL, setOfferURL] = React.useState("");
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [videoDeviceId, setVideoDeviceId] = React.useState("");
  const [audioConstraints, setAudioConstraints] =
    React.useState<MediaTrackConstraints>();
  const [videoConstraints, setVideoConstraints] =
    React.useState<MediaTrackConstraints>();
  const [screenConstraints, setScreenConstraints] =
    React.useState<DisplayMediaStreamOptions>();
  const [audioCodec, setAudioCodec] = React.useState<TAudioCodec>("PCMU/8000");
  const [videoCodec, setVideoCodec] = React.useState<TVideoCodec>("default");
  const [videoTransform, setVideoTransform] =
    React.useState<TVideoTransform>("none");
  const [dataChannelOptions, setDataChannelOptions] =
    React.useState<RTCDataChannelInit>();
  const [rtcConfig, setRTCConfig] = React.useState<RTCConfiguration>();
  const [logger, setLogger] = React.useState<Logger>();

  /**
   * Generates the real-time configuration object based on the current state.
   *
   * @returns {TRealtimeConfig} The generated configuration object.
   */
  const getConfig = React.useCallback(() => {
    return createConfig({
      functionURL,
      audioDeviceId,
      videoDeviceId,
      audioCodec,
      audioConstraints,
      dataChannelOptions,
      logger,
      offerURL,
      rtcConfig,
      screenConstraints,
      videoCodec,
      videoConstraints,
      videoTransform,
    });
  }, [
    functionURL,
    audioDeviceId,
    videoDeviceId,
    audioCodec,
    audioConstraints,
    dataChannelOptions,
    logger,
    offerURL,
    rtcConfig,
    screenConstraints,
    videoCodec,
    videoConstraints,
    videoTransform,
  ]);

  return {
    functionURL,
    setFunctionURL,
    offerURL,
    setOfferURL,
    audioDeviceId,
    setAudioDeviceId,
    videoDeviceId,
    setVideoDeviceId,
    audioConstraints,
    setAudioConstraints,
    videoConstraints,
    setVideoConstraints,
    screenConstraints,
    setScreenConstraints,
    audioCodec,
    setAudioCodec,
    videoCodec,
    setVideoCodec,
    videoTransform,
    setVideoTransform,
    dataChannelOptions,
    setDataChannelOptions,
    rtcConfig,
    setRTCConfig,
    logger,
    setLogger,
    getConfig,
  };
}
