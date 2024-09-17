import React from "react";
import { useWebSocket } from "@outspeed/react";
import { DataChannel, TRealtimeWebSocketConfig } from "@outspeed/core";
import { Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { RealtimeChat } from "./AvatarComponent/Chat";

export type TRealtimeAppProps = {
  onDisconnect: () => void;
  config: TRealtimeWebSocketConfig;
  onDataChannelUpdate: (dataChannel: DataChannel<unknown>) => void;
};

export function RealtimeApp(props: TRealtimeAppProps) {
  const { config, onDisconnect, onDataChannelUpdate } = props;

  const {
    connect,
    disconnect,
    dataChannel,
    connectionStatus,
    getLocalAudioTrack,
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

  React.useEffect(() => {
    if (dataChannel) {
      onDataChannelUpdate(dataChannel);
    }
  }, [dataChannel]);

  if (connectionStatus === "connecting")
    return (
      <div className="max-w-lg h-[352px] space-y-4 py-4 px-8 rounded-md border flex-1 w-full flex justify-center items-center max-h-[352px]">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );

  if (connectionStatus === "failed") {
    return (
      <div className="max-w-lg h-[352px] space-y-4 py-4 px-8 rounded-md border flex-1 w-full flex justify-center items-center max-h-[352px]">
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

  getLocalAudioTrack()?.pause();

  return (
    <div className="max-w-lg space-y-4 py-4 rounded-md border flex-1 w-full h-[352px] flex flex-col max-h-[352px]">
      {dataChannel && (
        <div className="w-full px-4 hidden md:block mt-auto">
          <RealtimeChat dataChannel={dataChannel} />
        </div>
      )}
      <div className="px-4">
        <Button className="w-full" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    </div>
  );
}
