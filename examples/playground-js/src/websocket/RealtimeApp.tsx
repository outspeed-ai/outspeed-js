import React from "react";
import { useWebSocket, RealtimeChat } from "@outspeed/react";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { View } from "./View";

export type TRealtimeAppProps = {
  onDisconnect: () => void;
  config: TRealtimeWebSocketConfig;
};

export function RealtimeApp(props: TRealtimeAppProps) {
  const { config, onDisconnect } = props;

  const {
    connect,
    disconnect,
    getRemoteAudioTrack,
    getLocalAudioTrack,
    dataChannel,
    connectionStatus,
  } = useWebSocket({
    config,
  });

  const handleDisconnect = React.useCallback(() => {
    disconnect();
    onDisconnect();
  }, [disconnect, onDisconnect]);

  React.useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  if (connectionStatus === "connecting")
    return (
      <div className="h-full flex flex-1 justify-center items-center">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );

  if (connectionStatus === "failed") {
    return (
      <div className="h-full flex flex-1 justify-center items-center">
        <div className="flex items-center space-y-4 flex-col">
          <h2 className="text-3xl font-light">
            Failed to connect. Please try again.
          </h2>
          <Button
            className="inline-flex max-w-24"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-1">
      <div className="flex-1 flex">
        <View
          onCallEndClick={handleDisconnect}
          localAudioTrack={getLocalAudioTrack()}
          remoteAudioTrack={getRemoteAudioTrack()}
        />
      </div>
      {dataChannel && (
        <div className="w-[350px] px-4 hidden md:block">
          <RealtimeChat dataChannel={dataChannel} />
        </div>
      )}
    </div>
  );
}
