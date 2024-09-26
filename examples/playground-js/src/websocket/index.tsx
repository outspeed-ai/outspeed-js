import React from "react";
import { useWebSocket } from "@outspeed/react";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { MeetingLayout } from "../components/meeting-layout";
import { Track } from "@outspeed/core";
import { ETrackOrigin } from "@outspeed/core";

export type TWebSocketRealtimeAppProps = {
  onDisconnect: () => void;
  config: TRealtimeWebSocketConfig;
};

export function WebSocketRealtimeApp(props: TWebSocketRealtimeAppProps) {
  const { config, onDisconnect } = props;

  const [localVideoStream, setLocalVideoStream] = React.useState<Track | null>(
    null
  );

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

  const updateLocalStream = React.useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    const videoTrack = stream.getVideoTracks()[0];
    setLocalVideoStream(new Track(videoTrack, ETrackOrigin.Local));
  }, []);

  React.useEffect(() => {
    updateLocalStream();
  }, [updateLocalStream]);

  React.useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  if (connectionStatus === "connecting") {
    return (
      <div className="h-full flex flex-1 justify-center items-center">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

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
        <MeetingLayout
          title="WebSocket Example"
          onCallEndClick={handleDisconnect}
          localTrack={localVideoStream}
          remoteTrack={null}
          localAudioTrack={getLocalAudioTrack()}
          remoteAudioTrack={getRemoteAudioTrack()}
          dataChannel={dataChannel}
        />
      </div>
    </div>
  );
}
