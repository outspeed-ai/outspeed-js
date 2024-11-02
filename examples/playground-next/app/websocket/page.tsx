"use client";
import React from "react";
import { TakeInput } from "./form";
import { TRealtimeConfig, TRealtimeWebSocketConfig } from "@outspeed/core";
import { ConnectionScreen } from "./connection-screen";

export default function WebSocketPage() {
  const [config, setConfig] = React.useState<TRealtimeWebSocketConfig>();

  return (
    <div>
      <TakeInput onSubmit={(c) => setConfig(c)} />
      {config && (
        <ConnectionScreen
          config={config}
          onDisconnect={() => setConfig(undefined)}
        />
      )}
    </div>
  );
}
