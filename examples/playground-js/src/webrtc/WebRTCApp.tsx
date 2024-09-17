import React from "react";
import { RealtimeToast } from "@outspeed/react";
import { TRealtimeConfig } from "@outspeed/core";
import { TakeUserInput } from "./TakeUserInput";
import { RealtimeApp } from "./RealtimeApp";

export default function WebRTCApp() {
  const [config, setConfig] = React.useState<TRealtimeConfig | null>(null);

  function onSubmit(config: TRealtimeConfig) {
    setConfig(config);
  }

  function onDisconnect() {
    setConfig(null);
  }

  return (
    <>
      <RealtimeToast />
      {!config && <TakeUserInput onSubmit={onSubmit} />}
      {config && <RealtimeApp config={config} onDisconnect={onDisconnect} />}
    </>
  );
}
