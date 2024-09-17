import React from "react";
import { TRealtimeWebSocketConfig } from "@outspeed/core";

import { TakeUserInput } from "./TakeUserInput";
import { RealtimeApp } from "./RealtimeApp";

export function WebsocketApp() {
  const [config, setConfig] = React.useState<TRealtimeWebSocketConfig | null>(
    null
  );

  function onSubmit(config: TRealtimeWebSocketConfig) {
    setConfig(config);
  }

  function onDisconnect() {
    setConfig(null);
  }

  return (
    <>
      {!config && <TakeUserInput onSubmit={onSubmit} />}
      {config && <RealtimeApp config={config} onDisconnect={onDisconnect} />}
    </>
  );
}
