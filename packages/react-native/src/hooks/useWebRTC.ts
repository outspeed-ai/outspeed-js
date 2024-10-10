import React from "react";
import { MediaStream, MediaStreamTrack } from "react-native-webrtc";
import { TRealtimeConfig } from "@outspeed/core";

import {
  RealtimeConnection,
  TRealtimeConnectionDataChannel,
} from "../connection";

export type TUseWebRTCConnectOptions = {
  config: TRealtimeConfig;
};

export type TUseWebRTCConnectionPossibleStates =
  | "Init"
  | "Connecting"
  | "Connected"
  | "Disconnecting"
  | "Disconnected"
  | "Failed";

export function useWebRTC() {
  const [connection, setConnection] = React.useState<RealtimeConnection>();
  const [connectionStatus, setConnectionStatus] =
    React.useState<TUseWebRTCConnectionPossibleStates>("Init");
  const [remoteTracks, setRemoteTracks] = React.useState<MediaStream[]>([]);
  const [dataChannel, setDataChannel] =
    React.useState<TRealtimeConnectionDataChannel | null>(null);

  const _handleOnTrack = React.useCallback((event: unknown) => {
    if (typeof event !== "object" || !event || !("track" in event)) {
      return;
    }

    const track = event.track;

    if (typeof track === "object" || !track) {
      return;
    }

    setRemoteTracks((prev) => [
      ...prev,
      new MediaStream([track as MediaStreamTrack]),
    ]);
  }, []);

  const connect = React.useCallback(
    async (options: TUseWebRTCConnectOptions) => {
      setConnectionStatus("Connecting");
      const { config } = options;
      const _connection = new RealtimeConnection(config);
      _connection.peerConnection.addEventListener("track", _handleOnTrack);

      const response = await _connection.connect();

      if (response.ok) {
        setDataChannel(_connection.dataChannel);
        setConnection(_connection);
        setConnectionStatus("Connected");
      } else {
        setConnectionStatus("Failed");
      }
    },
    [_handleOnTrack]
  );

  const disconnect = React.useCallback(() => {
    if (!connection) return;

    connection.peerConnection.removeEventListener("track", _handleOnTrack);
    connection.disconnect();
  }, [connection, _handleOnTrack]);

  const getLocalAudioStream = React.useCallback(() => {
    if (!connection || !connection.mediaManager) return;

    return connection.mediaManager.localStreams.audio[0];
  }, [connection]);

  const getLocalVideoStream = React.useCallback(() => {
    if (!connection || !connection.mediaManager) return;

    return connection.mediaManager.localStreams.video[0];
  }, [connection]);

  return {
    connect,
    disconnect,
    connection,
    connectionStatus,
    dataChannel,
    remoteTracks,
    getLocalAudioStream,
    getLocalVideoStream,
  };
}
