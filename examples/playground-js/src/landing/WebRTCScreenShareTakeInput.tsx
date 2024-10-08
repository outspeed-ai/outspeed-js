import React from "react";
import {
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeFormButton,
  RealtimeShareScreenInput,
} from "@outspeed/react";
import { createConfig } from "@outspeed/core";
import { useOutletContext, useLocation } from "react-router-dom";
import { TLayoutOutletContext } from "./type";
import { SCREEN_SHARE_APP_ROUTE } from "../constants/routes";

export function WebRTCScreenShareTakeInput() {
  const location = useLocation();
  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const initialFunctionURL =
    queryParams.get("functionURL") || "http://localhost:8080";

  const { onSubmit } = useOutletContext<TLayoutOutletContext>();
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [functionURL, setFunctionURL] = React.useState(initialFunctionURL);
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

    if (screenShareInput !== "512p" && screenShareInput !== "1080p") {
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
          video: {
            width: screenShareInput === "512p" ? 512 : 1080,
            height: screenShareInput === "512p" ? 512 : 1080,
            frameRate: 5,
          },
        },
      });
      onSubmit(config, SCREEN_SHARE_APP_ROUTE);
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
          if (value === "512p" || value === "1080p") {
            setIsScreenShareInputMissing(false);
          }
        }}
        value={screenShareInput}
        isError={isScreenShareInputMissing}
        description="Select the resolution of shared video. 512x512 is recommended for now."
        errorMsg={
          isScreenShareInputMissing
            ? "In this example, please agree to share your screen as we will need this to proceed."
            : ""
        }
      />

      <RealtimeFormButton onClick={handleFormSubmit}>
        Share Screen
      </RealtimeFormButton>
    </div>
  );
}
