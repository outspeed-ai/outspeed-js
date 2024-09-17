import React from "react";
import { DataChannel, TRealtimeWebSocketConfig } from "@outspeed/core";

import { TakeUserInput } from "./TakeUserInput";
import { RealtimeAvatar } from "./AvatarComponent/Avatar";
import { RealtimeApp } from "./RealtimeApp";

export function AvatarApp() {
  const [config, setConfig] = React.useState<TRealtimeWebSocketConfig | null>(
    null
  );
  const [dataChannel, setDataChannel] = React.useState<DataChannel<unknown>>();

  function onSubmit(config: TRealtimeWebSocketConfig) {
    setConfig(config);
  }

  function onDisconnect() {
    setConfig(null);
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-full w-full">
      <RealtimeAvatar dataChannel={dataChannel} />
      {!config && <TakeUserInput onSubmit={onSubmit} />}
      {config && (
        <RealtimeApp
          onDataChannelUpdate={setDataChannel}
          config={config}
          onDisconnect={onDisconnect}
        />
      )}
    </div>
  );
}
