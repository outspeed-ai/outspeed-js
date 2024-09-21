import React from "react";
import {
  RealtimeForm,
  RealtimeFunctionURLInput,
  RealtimeAudioInput,
  RealtimeFormButton,
} from "@outspeed/react";
import { TRealtimeWebSocketConfig, ConsoleLogger } from "@outspeed/core";

export type TWebSocketTakeInputProps = {
  onSubmit: (config: TRealtimeWebSocketConfig) => void;
};

export function WebSocketTakeInput(props: TWebSocketTakeInputProps) {
  const { onSubmit } = props;
  const [audioDeviceId, setAudioDeviceId] = React.useState("");
  const [functionURL, setFunctionURL] = React.useState(
    "http://localhost:8080/"
  );

  function handleFormSubmit() {
    try {
      const config = {
        functionURL,
        audio: {
          deviceId: audioDeviceId,
          echoCancellation: true,
        },
        logger: ConsoleLogger.getLogger(),
      } satisfies TRealtimeWebSocketConfig;

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
        description="Once you've deployed your WebSocket backend application, you'll receive a URL. If you are running your backend locally, use http://localhost:8080."
      />
      <RealtimeAudioInput
        value={audioDeviceId}
        onChange={setAudioDeviceId}
        description="Select the microphone you want to use. If you don't see your microphone, make sure it is plugged in."
      />
      <RealtimeFormButton onClick={handleFormSubmit}>Run</RealtimeFormButton>
    </div>
  );
}
