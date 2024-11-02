"use client";
import React from "react";
import { TakeInput } from "./form";
import { TRealtimeConfig } from "@outspeed/core";
import { ConnectionScreen } from "./connection-screen";

export default function WebRTCPage() {
  const [config, setConfig] = React.useState<TRealtimeConfig>();

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
