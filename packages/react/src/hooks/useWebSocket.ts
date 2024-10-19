import React from "react";
import { Track } from "@outspeed/core/Track";
import { RealtimeWebSocketConnection } from "@outspeed/core/RealtimeWebSocketConnection";
import { TRealtimeWebSocketConfig, TResponse } from "@outspeed/core/@types";
import { ERealtimeConnectionStatus } from "../shared/connection-status";

export type TUseWebSocketOptions = {
  config: TRealtimeWebSocketConfig;
};

export function useWebSocket(options: TUseWebSocketOptions) {
  const { config } = options;
  const [connection, setConnection] =
    React.useState<RealtimeWebSocketConnection | null>(null);
  const [connectionStatus, setConnectionStatus] =
    React.useState<ERealtimeConnectionStatus>(ERealtimeConnectionStatus.New);
  const [response, setResponse] = React.useState<TResponse>({});
  const [remoteTrack, setRemoteTrack] = React.useState<Track | null>(null);

  const connect = React.useCallback(async () => {
    setConnectionStatus(ERealtimeConnectionStatus.Connecting);
    const ws = new RealtimeWebSocketConnection(config);
    const response = await ws.connect();
    if (!response.ok) {
      // This will release media, if it is setup.
      await ws.disconnect();
      setConnectionStatus(ERealtimeConnectionStatus.Failed);
      setResponse(response);
      return console.error("Failed to connect", response);
    }
    setConnection(ws);
    setConnectionStatus(ERealtimeConnectionStatus.Connected);
    setResponse(response);
  }, [config]);

  const disconnect = React.useCallback(async () => {
    if (!connection) {
      return;
    }

    setConnectionStatus(ERealtimeConnectionStatus.Disconnecting);
    await connection.disconnect();
    setConnectionStatus(ERealtimeConnectionStatus.Disconnected);
  }, [connection]);

  const getLocalAudioTrack = React.useCallback(() => {
    if (!connection) return null;

    return connection.mediaManager.track;
  }, [connection]);

  const getRemoteAudioTrack = React.useCallback(() => {
    if (remoteTrack) return remoteTrack;
    if (!connection) return null;

    const response = connection.mediaManager.getRemoteAudioTrack();

    if (!response.ok || !response.data) return null;

    setRemoteTrack(response.data);
    return response.data;
  }, [connection, remoteTrack]);

  return {
    connect,
    disconnect,
    connectionStatus,
    dataChannel: connection?.dataChannel,
    getLocalAudioTrack,
    getRemoteAudioTrack,
    connection,
    response,
  };
}
