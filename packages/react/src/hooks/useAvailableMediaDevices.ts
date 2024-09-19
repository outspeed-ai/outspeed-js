import React from "react";
import { getAllUserMedia } from "@outspeed/core";

export function useAvailableMediaDevices() {
  const [availableAudioDevices, setAvailableAudioDevices] = React.useState(
    [] as MediaDeviceInfo[]
  );
  const [availableVideoDevices, setAvailableVideoDevices] = React.useState(
    [] as MediaDeviceInfo[]
  );

  const updateAvailableMediaDevicesOnMount = React.useCallback(async () => {
    try {
      const devices = await getAllUserMedia();

      setAvailableAudioDevices(devices.audioInputDevices);
      setAvailableVideoDevices(devices.videoInputDevices);
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
