import { TAudioCodec, TRealtimeConfig } from "@outspeed/core";
import {
  RealtimeAudioInput,
  RealtimeFormButton,
  RealtimeFunctionURLInput,
  RealtimeVideoInput,
  ConsoleLogger,
} from "@outspeed/react";
import React from "react";

export type TTakeInputProps = {
  onSubmit: (config: TRealtimeConfig) => void;
};

export function TakeInput(props: TTakeInputProps) {
  const { onSubmit } = props;
  const [functionURL, setFunctionURL] = React.useState("http://localhost:8080");
  const [audioInput, setAudioInput] = React.useState("");
  const [videoInput, setVideoInput] = React.useState("");
  const [audioCodec, setAudioCodec] = React.useState("default");

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
          }
        : undefined,
      video: videoInput
        ? {
            deviceId: videoInput,
          }
        : undefined,
      codec: {
        audio: audioCodec as TAudioCodec,
      },
    });
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="max-w-lg flex-1 space-y-4">
        <h1 className="text-xl font-bold">WebRTC Input</h1>
        <RealtimeFunctionURLInput
          value={functionURL}
          onChange={(e) => setFunctionURL(e.currentTarget.value)}
        />
        <RealtimeAudioInput
          value={audioInput}
          onChange={(value) => setAudioInput(value)}
        />
        <RealtimeVideoInput
          value={videoInput}
          onChange={(value) => setVideoInput(value)}
        />
        <div className="space-y-2">
          <p className="font-medium">Select Audio Codec:</p>
          <div className="flex flex-col space-y-2">
            {["opus/48000/2", "PCMA/8000", "PCMU/8000", "default"].map(
              (codec) => (
                <label key={codec} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={codec}
                    checked={audioCodec === codec}
                    onChange={() => setAudioCodec(codec)}
                    className="text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{codec}</span>
                </label>
              )
            )}
          </div>
        </div>
        <RealtimeFormButton onClick={onSubmitForm}>
          Update Config
        </RealtimeFormButton>
      </div>
    </div>
  );
}
