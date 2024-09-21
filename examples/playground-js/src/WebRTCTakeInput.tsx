import React from "react";
import {
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeVideoInput,
  RealtimeFormButton,
} from "@outspeed/react";
import { TRealtimeConfig, createConfig, ConsoleLogger } from "@outspeed/core";

export type TWebRTCTakeInputProps = {
  onSubmit: (config: TRealtimeConfig) => void;
};

export function WebRTCTakeInput(props: TWebRTCTakeInputProps) {
  const { onSubmit } = props;
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [videoDeviceId, setVideoDeviceId] = React.useState("");
  const [functionURL, setFunctionURL] = React.useState("http://localhost:8080");

  function handleFormSubmit() {
    try {
      const config = createConfig({
        functionURL,
        audioDeviceId,
        videoDeviceId,
        logger: ConsoleLogger.getLogger(),
      });
      onSubmit(config);
    } catch (error) {
      console.error("Unable to create config", error);
    }
  }

  return (
    <div className="space-y-6 max-w-lg relative z-10">
      <RealtimeFunctionURLInput
        onChange={(e) => setFunctionURL(e.currentTarget.value)}
        value={functionURL}
        description="Once you've deployed your WebRTC backend application, you'll receive a URL. If you are running your backend locally, use http://localhost:8080."
      />
      <RealtimeAudioInput
        value={audioDeviceId}
        onChange={setAudioDeviceId}
        description="Select the microphone you want to use. If you don't see your microphone, make sure it is plugged in."
      />
      <RealtimeVideoInput
        value={videoDeviceId}
        onChange={setVideoDeviceId}
        description="Select the camera you want to use. If you don't see your camera, make sure it is plugged in."
      />
      <RealtimeFormButton onClick={handleFormSubmit}>Run</RealtimeFormButton>
    </div>
  );
}
