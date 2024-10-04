import React from "react";
import {
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeFormButton,
  RealtimeShareScreenInput,
} from "@outspeed/react";
import { TRealtimeConfig, createConfig, ConsoleLogger } from "@outspeed/core";

export type TWebRTCScreenShareTakeInputProps = {
  onSubmit: (config: TRealtimeConfig) => void;
};

export function WebRTCScreenShareTakeInput(
  props: TWebRTCScreenShareTakeInputProps
) {
  const { onSubmit } = props;
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [functionURL, setFunctionURL] = React.useState("http://localhost:8080");
  const [isMediaMissing, setIsMediaMissing] = React.useState(false);
  const [isFunctionURLMissing, setIsFunctionURLMissing] = React.useState(false);
  const [screenShareInput, setScreenShareInput] = React.useState("");
  const [isScreenShareInputMissing, setIsScreenShareInputMissing] =
    React.useState(false);

  function handleOnMediaInputChange(kind: "audio" | "video", value: string) {
    setIsMediaMissing(false);

    switch (kind) {
      case "audio":
        setAudioDeviceId(value);
        break;
    }
  }

  function handleFormSubmit() {
    let isFormValid = true;
    if (!audioDeviceId) {
      setIsMediaMissing(true);
      isFormValid = false;
    }

    if (!functionURL) {
      setIsFunctionURLMissing(true);
      isFormValid = false;
    }

    if (screenShareInput !== "yes") {
      setIsScreenShareInputMissing(true);
      isFormValid = false;
    }

    if (!isFormValid) {
      return;
    }

    try {
      const config = createConfig({
        functionURL,
        audioDeviceId,
        screenConstraints: {
          video: true,
        },
        logger: ConsoleLogger.getLogger(),
      });
      onSubmit(config);
    } catch (error) {
      console.error("Unable to create config", error);
    }
  }

  return (
    <div className="space-y-6 max-w-lg relative z-10">
      <div className="font-bold text-3xl mb-8">Screen Share</div>
      <RealtimeFunctionURLInput
        isError={isFunctionURLMissing}
        onChange={(e) => {
          setIsFunctionURLMissing(false);
          setFunctionURL(e.currentTarget.value);
        }}
        value={functionURL}
        description="Once you've deployed your Screen Share backend application, you'll receive a URL. If you are running your backend locally, use http://localhost:8080."
        errorMsg={isFunctionURLMissing ? "Function url is required." : ""}
      />
      <RealtimeAudioInput
        isError={isMediaMissing}
        value={audioDeviceId}
        onChange={(value) => handleOnMediaInputChange("audio", value)}
        description="Select the microphone you want to use. If you don't see your microphone, make sure it is plugged in."
        errorMsg={isMediaMissing ? "Audio device is required." : ""}
      />

      <RealtimeShareScreenInput
        onChange={(value) => {
          setScreenShareInput(value);
          if (value === "yes") {
            setIsScreenShareInputMissing(false);
          }
        }}
        value={screenShareInput}
        isError={isScreenShareInputMissing}
        description='Select "Yes" to confirm that you want to share your screen.'
        errorMsg={
          isScreenShareInputMissing
            ? "In this example, please agree to share your screen as we will need this to proceed."
            : ""
        }
      />

      <RealtimeFormButton onClick={handleFormSubmit}>Run</RealtimeFormButton>
    </div>
  );
}
