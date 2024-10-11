import React from "react";
import {
  RealtimeWebSocketConnection,
  Track,
  TRealtimeWebSocketConfig,
  TResponse,
} from "@outspeed/core";

export type TUseWebSocketOptions = {
  config: TRealtimeWebSocketConfig;
};

export type TWebSocketConnectionStatus =
  | "new"
  | "connecting"
  | "connected"
  | "failed"
  | "disconnected";

export function useWebSocket(options: TUseWebSocketOptions) {
  const { config } = options;
  const [connection, setConnection] =
    React.useState<RealtimeWebSocketConnection | null>(null);
  const [connectionStatus, setConnectionStatus] =
    React.useState<TWebSocketConnectionStatus>("new");
  const [response, setResponse] = React.useState<TResponse>({});
  const [remoteTrack, setRemoteTrack] = React.useState<Track | null>(null);

  const connect = React.useCallback(async () => {
    setConnectionStatus("connecting");
    const ws = new RealtimeWebSocketConnection(config);
    const response = await ws.connect();
    if (!response.ok) {
      // This will release media, if it is setup.
      await ws.disconnect();
      setConnectionStatus("failed");
      setResponse(response);
      return console.error("Failed to connect", response);
    }
    setConnection(ws);
    setConnectionStatus("connected");
    setResponse(response);
  }, [config]);

  const disconnect = React.useCallback(async () => {
    if (!connection) {
      return;
    }

    await connection.disconnect();

    setConnectionStatus("disconnected");
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
