import React from "react";
import { useRealtimeToast, useWebRTC } from "@outspeed/react";
import { Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { MeetingLayout } from "../components/meeting-layout";
import { useOutletContext } from "react-router-dom";
import { TRealtimeAppContext } from "./types";
import { ConsoleLogger } from "@outspeed/core";
import { ERealtimeConnectionStatus } from "@outspeed/react/connection-status";

export function VoiceBotRealtimeApp() {
  const { config, onDisconnect } = useOutletContext<TRealtimeAppContext>();
  const { toast } = useRealtimeToast();

  const {
    connectionStatus,
    response,
    connect,
    disconnect,
    remoteAudioTrack,
    localAudioTrack,
    dataChannel,
  } = useWebRTC({ config: { ...config, logger: ConsoleLogger.getLogger() } });

  React.useEffect(() => {
    switch (connectionStatus) {
      case ERealtimeConnectionStatus.New:
        connect();
        break;
      case ERealtimeConnectionStatus.Disconnected:
        onDisconnect();
        break;
    }

    if (connectionStatus === ERealtimeConnectionStatus.Failed) {
      toast({
        title: "Connection Status",
        description: "Failed to connect.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, connect, onDisconnect, config]);

  function handleDisconnect() {
    if (connectionStatus === ERealtimeConnectionStatus.Connected) {
      disconnect();
    }

    onDisconnect();
  }

  if (connectionStatus === ERealtimeConnectionStatus.Connecting) {
    return (
      <div className="h-full flex flex-1 justify-center items-center">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (connectionStatus === ERealtimeConnectionStatus.Failed) {
    return (
      <div className="h-full flex flex-1 justify-center items-center">
        <div className="flex items-center space-y-4 flex-col">
          <h2 className="text-3xl font-light">
            Failed to connect.{" "}
            {(response?.data as any)?.detail || "Please try again."}
          </h2>
          <details className="max-w-lg overflow-auto">
            <summary>See Response</summary>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="language-js text-sm">
                {JSON.stringify(response, undefined, 2)}
              </code>
            </pre>
          </details>
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
          title="Voice Bot"
          onCallEndClick={handleDisconnect}
          localTrack={null}
          remoteTrack={null}
          localAudioTrack={localAudioTrack}
          remoteAudioTrack={remoteAudioTrack}
          dataChannel={dataChannel}
        />
      </div>
    </div>
  );
}
