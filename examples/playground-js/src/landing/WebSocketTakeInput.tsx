import React from "react";
import {
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeFormButton,
} from "@outspeed/react";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { useOutletContext } from "react-router-dom";
import { TLayoutOutletContext } from "./type";
import { WEBSOCKET_APP_ROUTE } from "../constants/routes";

export function WebSocketTakeInput() {
  const { onSubmit } = useOutletContext<TLayoutOutletContext>();
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [functionURL, setFunctionURL] = React.useState(
    "http://localhost:8080/"
  );
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
      const config = {
        functionURL,
        audio: {
          deviceId: audioDeviceId,
          echoCancellation: true,
        },
      } satisfies TRealtimeWebSocketConfig;

      onSubmit(config, WEBSOCKET_APP_ROUTE);
    } catch (error) {
      console.error("Unable to create config", error);
    }
  }

  return (
    <div className="space-y-6 max-w-lg relative z-10">
      <div className="font-bold text-3xl mb-8">Web Socket</div>
      <RealtimeFunctionURLInput
        isError={isFunctionURLMissing}
        onChange={(e) => {
          setIsFunctionURLMissing(false);
          setFunctionURL(e.currentTarget.value);
        }}
        value={functionURL}
        description="Once you've deployed your WebSocket backend application, you'll receive a URL. If you are running your backend locally, use http://localhost:8080."
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
