import {
  ConsoleLogger,
  TAudioCodec,
  TRealtimeConfig,
  TRealtimeWebSocketConfig,
} from "@outspeed/core";
import {
  RealtimeAudioInput,
  RealtimeFormButton,
  RealtimeFunctionURLInput,
  RealtimeVideoInput,
} from "@outspeed/react";
import React from "react";

export type TTakeInputProps = {
  onSubmit: (config: TRealtimeWebSocketConfig) => void;
};

export function TakeInput(props: TTakeInputProps) {
  const { onSubmit } = props;
  const [functionURL, setFunctionURL] = React.useState("http://localhost:8080");
  const [audioInput, setAudioInput] = React.useState("");

  function onSubmitForm() {
    /**
     * In real-world example ideally we should first
     * validate the input before submitting. But it is
     * fine to do this in the playground.
     */
    onSubmit({
      functionURL,
      logger: ConsoleLogger.getLogger(),
      audio: audioInput
        ? {
            deviceId: audioInput,
            echoCancellation: true,
          }
        : undefined,
    });
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="max-w-lg flex-1 space-y-4">
        <h1 className="text-xl font-bold">WebSocket Input</h1>
        <RealtimeFunctionURLInput
          value={functionURL}
          onChange={(e) => setFunctionURL(e.currentTarget.value)}
        />
        <RealtimeAudioInput
          value={audioInput}
          onChange={(value) => setAudioInput(value)}
        />
        <RealtimeFormButton onClick={onSubmitForm}>
          Update Config
        </RealtimeFormButton>
      </div>
    </div>
  );
}
