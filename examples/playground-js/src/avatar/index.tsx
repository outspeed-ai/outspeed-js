import React from "react";
import { useWebSocket } from "@outspeed/react";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { MessageBox } from "../components/message-box";
import { Avatar } from "./avatar";

export type TRealtimeAppProps = {
  onDisconnect: () => void;
  config: TRealtimeWebSocketConfig;
};

export function AvatarRealtimeApp(props: TRealtimeAppProps) {
  const { config, onDisconnect } = props;

  const {
    connect,
    disconnect,
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

  return (
    <div className="h-full flex flex-1 justify-center items-center">
    <div className="max-w-lg space-y-4 rounded-md border w-full flex flex-col items-center py-4">
      {dataChannel && (
        <>

        <Avatar 
          dataChannel={dataChannel} 
          avatarConfig={{
            url: "https://models.readyplayer.me/6694986c34432ca7edeb2d33.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
            body: "F",
            avatarMood: "neutral"
          }}
        />
        <div className="w-full px-4 hidden md:block mt-auto">
          <MessageBox dataChannel={dataChannel} />
        </div>
        </>
      )}
      <div className="px-4">
        <Button className="w-full" onClick={handleDisconnect}>
          Disconnect
        </Button>
    </div>
      </div>
    </div>
  );
}
