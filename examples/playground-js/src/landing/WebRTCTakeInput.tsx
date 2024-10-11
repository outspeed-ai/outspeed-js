import React from "react";
import {
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeVideoInput,
  RealtimeFormButton,
} from "@outspeed/react";
import { createConfig } from "@outspeed/core";
import { useOutletContext, useLocation } from "react-router-dom";
import { TLayoutOutletContext } from "./type";
import { WEB_RTC_APP_ROUTE } from "../constants/routes";

export function WebRTCTakeInput() {
  const { onSubmit } = useOutletContext<TLayoutOutletContext>();
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [videoDeviceId, setVideoDeviceId] = React.useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFunctionURL =
    queryParams.get("functionURL") || "http://localhost:8080";
  const [functionURL, setFunctionURL] = React.useState(initialFunctionURL);
  const [isMediaMissing, setIsMediaMissing] = React.useState(false);
  const [isFunctionURLMissing, setIsFunctionURLMissing] = React.useState(false);

  function handleOnMediaInputChange(kind: "audio" | "video", value: string) {
    setIsMediaMissing(false);

    switch (kind) {
      case "audio":
        setAudioDeviceId(value);
        break;
      case "video":
        setVideoDeviceId(value);
        break;
    }
  }

  function handleFormSubmit() {
    let isFormValid = true;
    if (!audioDeviceId && !videoDeviceId) {
      setIsMediaMissing(true);
      isFormValid = false;
    }

    if (!functionURL) {
      setIsFunctionURLMissing(true);
      isFormValid = false;
    }

    if (!isFormValid) {
      return;
    }

    try {
      const config = createConfig({
        functionURL,
        audioDeviceId,
        videoDeviceId,
      });
      onSubmit(config, WEB_RTC_APP_ROUTE);
    } catch (error) {
      console.error("Unable to create config", error);
    }
  }

  return (
    <div className="space-y-6 max-w-lg relative z-10">
      <div className="font-bold text-3xl mb-8">WebRTC</div>
      <RealtimeFunctionURLInput
        isError={isFunctionURLMissing}
        onChange={(e) => {
          setIsFunctionURLMissing(false);
          setFunctionURL(e.currentTarget.value);
        }}
        value={functionURL}
        description="Once you've deployed your WebRTC backend application, you'll receive a URL. If you are running your backend locally, use http://localhost:8080."
        errorMsg={isFunctionURLMissing ? "Function url is required." : ""}
      />
      <RealtimeAudioInput
        isError={isMediaMissing}
        value={audioDeviceId}
        onChange={(value) => handleOnMediaInputChange("audio", value)}
        description="Select the microphone you want to use. If you don't see your microphone, make sure it is plugged in."
        errorMsg={
          isMediaMissing ? "Either audio or video input is required." : ""
        }
      />
      <RealtimeVideoInput
        isError={isMediaMissing}
        value={videoDeviceId}
        onChange={(value) => handleOnMediaInputChange("video", value)}
        description="Select the camera you want to use. If you don't see your camera, make sure it is plugged in."
        errorMsg={
          isMediaMissing ? "Either audio or video input is required." : ""
        }
      />
      <RealtimeFormButton onClick={handleFormSubmit}>Run</RealtimeFormButton>
    </div>
  );
}
