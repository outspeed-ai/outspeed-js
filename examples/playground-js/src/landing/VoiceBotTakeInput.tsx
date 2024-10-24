import React from "react";
import {
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeFormButton,
} from "@outspeed/react";
import { createConfig } from "@outspeed/core";
import { useOutletContext, useLocation } from "react-router-dom";
import { TLayoutOutletContext } from "./type";
import { VOICE_BOT_APP_ROUTE } from "../constants/routes";

export function VoiceBotTakeInput() {
  const location = useLocation();
  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const initialFunctionURL =
    queryParams.get("functionURL") || "http://localhost:8080";

  const { onSubmit } = useOutletContext<TLayoutOutletContext>();
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [functionURL, setFunctionURL] = React.useState(initialFunctionURL);
  const [isAudioMissing, setIsAudioMissing] = React.useState(false);
  const [isFunctionURLMissing, setIsFunctionURLMissing] = React.useState(false);

  function handleFormSubmit() {
    let isFormValid = true;
    if (!audioDeviceId) {
      setIsAudioMissing(true);
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
        audioCodec: "opus/48000/2",
      });
      onSubmit(config, VOICE_BOT_APP_ROUTE);
    } catch (error) {
      console.error("Unable to create config", error);
    }
  }

  return (
    <div className="space-y-6 max-w-lg relative z-10">
      <div className="font-bold text-3xl mb-8">Voice Bot</div>
      <RealtimeFunctionURLInput
        isError={isFunctionURLMissing}
        onChange={(e) => {
          setIsFunctionURLMissing(false);
          setFunctionURL(e.currentTarget.value);
        }}
        value={functionURL}
        description="Once you've deployed your Voice Bot backend application, you'll receive a URL. If you are running your backend locally, use http://localhost:8080."
        errorMsg={isFunctionURLMissing ? "Function url is required." : ""}
      />
      <RealtimeAudioInput
        isError={isAudioMissing}
        value={audioDeviceId}
        onChange={(value) => {
          setIsAudioMissing(false);
          setAudioDeviceId(value);
        }}
        description="Select the microphone you want to use. If you don't see your microphone, make sure it is plugged in."
        errorMsg={isAudioMissing ? "Please select audio device." : ""}
      />
      <RealtimeFormButton onClick={handleFormSubmit}>Run</RealtimeFormButton>
    </div>
  );
}
