import React from "react";
import { MediaStream, MediaStreamTrack } from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import { TRealtimeConfig } from "../@types";

import {
  RealtimeConnection,
  TRealtimeConnectionDataChannel,
} from "../connection";

export type TUseWebRTCConnectOptions = {
  config: TRealtimeConfig;
};

export enum ERealtimeConnectionStatus {
  New = "new",
  Connecting = "connecting",
  Connected = "connected",
  Disconnecting = "disconnecting",
  Disconnected = "disconnected",
  Failed = "failed",
}

export function useWebRTC() {
  const [connection, setConnection] = React.useState<RealtimeConnection>();
  const [connectionStatus, setConnectionStatus] =
    React.useState<ERealtimeConnectionStatus>(ERealtimeConnectionStatus.New);
  const [remoteStreams, setRemoteStreams] = React.useState<MediaStream[]>([]);
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

    setRemoteStreams((prev) => [
      ...prev,
      new MediaStream([track as MediaStreamTrack]),
    ]);
  }, []);

  const connect = React.useCallback(
    async (options: TUseWebRTCConnectOptions) => {
      setConnectionStatus(ERealtimeConnectionStatus.Connecting);
      const { config } = options;
      const _connection = new RealtimeConnection(config);
      _connection.peerConnection.addEventListener("track", _handleOnTrack);

      InCallManager.setForceSpeakerphoneOn(true);
      const response = await _connection.connect();

      if (response.ok) {
        setDataChannel(_connection.dataChannel);
        setConnection(_connection);
        setConnectionStatus(ERealtimeConnectionStatus.Connected);
      } else {
        InCallManager.setForceSpeakerphoneOn(false);
        setConnectionStatus(ERealtimeConnectionStatus.Failed);
      }
    },
    [_handleOnTrack]
  );

  const disconnect = React.useCallback(() => {
    if (!connection) return;

    try {
      setConnectionStatus(ERealtimeConnectionStatus.Disconnecting);
      connection.peerConnection.removeEventListener("track", _handleOnTrack);
      connection.disconnect();
      setConnectionStatus(ERealtimeConnectionStatus.Disconnected);
    } catch (error) {
      console.log(error);
      setConnectionStatus(ERealtimeConnectionStatus.Failed);
    }
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
    remoteStreams,
    getLocalAudioStream,
    getLocalVideoStream,
  };
}
