import React from "react";
import { useWebRTC, useRealtimeToast } from "@outspeed/react";
import { Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { MeetingLayout } from "../components/meeting-layout";
import { useOutletContext } from "react-router-dom";
import { TRealtimeAppContext } from "./types";

export function WebRTCScreenShareRealtimeApp() {
  const { config, onDisconnect } = useOutletContext<TRealtimeAppContext>();
  const { toast } = useRealtimeToast();

  const {
    connectionStatus,
    connect,
    disconnect,
    getRemoteAudioTrack,
    getLocalAudioTrack,
    getRemoteVideoTrack,
    getLocalVideoTrack,
    dataChannel,
  } = useWebRTC({ config });

  React.useEffect(() => {
    switch (connectionStatus) {
      case "SetupCompleted":
        connect();
        break;
      case "Disconnected":
        onDisconnect();
        break;
    }

    if (connectionStatus === "Failed") {
      toast({
        title: "Connection Status",
        description: "Failed to connect.",
        variant: "destructive",
      });
      disconnect();
      onDisconnect();
    }
  }, [connectionStatus, connect, onDisconnect, config]);

  function handleDisconnect() {
    if (connectionStatus === "Connected") {
      disconnect();
    }

    onDisconnect();
  }

  if (connectionStatus === "Connecting") {
    return (
      <div className="h-full flex flex-1 justify-center items-center">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (connectionStatus === "Failed") {
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
        <MeetingLayout
          title="WebRTC Example"
          onCallEndClick={handleDisconnect}
          localTrack={getLocalVideoTrack()}
          remoteTrack={getRemoteVideoTrack()}
          localAudioTrack={getLocalAudioTrack()}
          remoteAudioTrack={getRemoteAudioTrack()}
          dataChannel={dataChannel}
        />
      </div>
    </div>
  );
}
