import React from "react";
import { mediaDevices } from "react-native-webrtc";

export type TMediaDeviceInfo = {
  deviceId: string;
  facing: string;
  groupId: string;
  kind: "videoinput" | "audioinput" | "audiooutput";
  label: string;
};

export function useAvailableMediaDevices() {
  const [availableAudioDevices, setAvailableAudioDevices] = React.useState(
    [] as TMediaDeviceInfo[]
  );
  const [availableVideoDevices, setAvailableVideoDevices] = React.useState(
    [] as TMediaDeviceInfo[]
  );

  const updateAvailableMediaDevicesOnMount = React.useCallback(async () => {
    try {
      const devices =
        (await mediaDevices.enumerateDevices()) as TMediaDeviceInfo[];

      const audioInputDevices = [] as TMediaDeviceInfo[];
      const videoInputDevices = [] as TMediaDeviceInfo[];

      devices.map((device) => {
        if (device.kind.includes("audioinput")) {
          audioInputDevices.push(device);
        } else if (device.kind.includes("videoinput")) {
          videoInputDevices.push(device);
        }
      });

      setAvailableAudioDevices(audioInputDevices);
      setAvailableVideoDevices(videoInputDevices);
    } catch (error) {
      console.error("Unable to get all user media devices.");
    }
  }, []);

  React.useEffect(() => {
    updateAvailableMediaDevicesOnMount();
  }, [updateAvailableMediaDevicesOnMount]);

  return {
    availableAudioDevices,
    availableVideoDevices,
  };
}
