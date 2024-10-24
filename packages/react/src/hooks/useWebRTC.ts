import React from "react";
import {
  RealtimeConnection,
  TRealtimeConnectionListener,
  TRealtimeConnectionListenerType,
} from "@outspeed/core/RealtimeConnection";
import { isRTCTrackEvent } from "@outspeed/core/utils";
import { WebRTCDataChannel } from "@outspeed/core/WebRTCDataChannel";
import { Track, ETrackOrigin, ETrackKind } from "@outspeed/core/Track";
import { TRealtimeConfig, TResponse } from "@outspeed/core/@types";
import { ERealtimeConnectionStatus } from "../connection-status";

export type TUseWebRTCReturn<T = unknown> = {
  ok?: boolean;
  error?: {
    msg: string;
  };
  data?: T;
};

export type TUseWebRTCOptions = {
  config: TRealtimeConfig;
};

export function useWebRTC(options: TUseWebRTCOptions) {
  const { config } = options;
  const [remoteTracks, setRemoteTracks] = React.useState<Track[]>([]);
  const [dataChannel, setDataChannel] =
    React.useState<WebRTCDataChannel | null>(null);

  const [connection] = React.useState(new RealtimeConnection(config));
  const [connectionResponse, setConnectionResponse] = React.useState<TResponse>(
    {}
  );
  const [connectionStatus, setConnectionStatus] =
    React.useState<ERealtimeConnectionStatus>(ERealtimeConnectionStatus.New);

  const _eventListeners = React.useRef<
    Partial<
      Record<TRealtimeConnectionListenerType, TRealtimeConnectionListener[]>
    >
  >({});

  const _handleOnTrack = React.useCallback((event: unknown) => {
    if (!isRTCTrackEvent(event)) {
      return;
    }

    const track = new Track(event.track, ETrackOrigin.Remote);
    setRemoteTracks((prev) => [...prev, track]);
  }, []);

  const _registerEventListener = React.useCallback(
    (
      type: TRealtimeConnectionListenerType,
      listener: TRealtimeConnectionListener
    ) => {
      if (_eventListeners.current[type]) {
        _eventListeners.current[type]?.push(listener);
      } else {
        _eventListeners.current[type] = [listener];
      }
    },
    []
  );

  const _unregisterEventListener = React.useCallback(
    (
      type: TRealtimeConnectionListenerType,
      listener: TRealtimeConnectionListener
    ) => {
      if (!_eventListeners.current[type]) {
        return;
      }
      _eventListeners.current[type] = _eventListeners.current[type]?.filter(
        (fn) => fn !== listener
      );
    },
    []
  );

  const addEventListener = React.useCallback(
    (
      type: TRealtimeConnectionListenerType,
      listener: TRealtimeConnectionListener
    ): TUseWebRTCReturn => {
      if (!connection) {
        return {
          error: {
            msg: "Failed to add event listener.",
          },
        };
      }

      connection.addEventListener(type, listener);
      _registerEventListener(type, listener);

      return {
        ok: true,
      };
    },
    [_registerEventListener, connection]
  );

  const removeEventListener = React.useCallback(
    (
      type: TRealtimeConnectionListenerType,
      listener: TRealtimeConnectionListener
    ): TUseWebRTCReturn => {
      if (!connection) {
        return {
          error: {
            msg: "Failed to remove event listener.",
          },
        };
      }

      connection.removeEventListener(type, listener);
      _unregisterEventListener(type, listener);

      return {
        ok: true,
      };
    },
    [_unregisterEventListener, connection]
  );

  const removeAllOnPacketReceiveListeners = React.useCallback(() => {
    if (!connection) {
      return {
        error: {
          msg: "Failed to add event listener.",
        },
      };
    }

    connection.removeAllOnPacketReceiverListeners();
  }, [connection]);

  const connect = React.useCallback(async () => {
    if (connectionStatus !== ERealtimeConnectionStatus.New) {
      return {
        error: {
          msg: `You cannot call connect() if the connection state is: ${connectionStatus}. It can only be called if the connection state is ${ERealtimeConnectionStatus.New}.`,
        },
      };
    }

    if (!connection) {
      return {
        error: {
          msg: "connect() is called but connection is not defined.",
        },
      };
    }

    addEventListener("track", _handleOnTrack);
    setConnectionStatus(ERealtimeConnectionStatus.Connecting);
    const response = await connection.connect();

    if (response.ok) {
      setConnectionStatus(ERealtimeConnectionStatus.Connected);
    } else {
      setConnectionStatus(ERealtimeConnectionStatus.Failed);
    }

    setConnectionResponse(response);

    return response;
  }, [addEventListener, _handleOnTrack, connection, connectionStatus]);

  const disconnect = React.useCallback(() => {
    if (connectionStatus !== ERealtimeConnectionStatus.Connected) {
      return {
        error: {
          msg: `You cannot call disconnect(), if the connection state is: ${connectionStatus}. It can only be called if the connection state is ${ERealtimeConnectionStatus.Connected}`,
        },
      };
    }

    // Before disconnecting, we are removing all the registered event listeners.
    (
      Object.keys(_eventListeners.current) as TRealtimeConnectionListenerType[]
    ).forEach((type) => {
      const listeners = _eventListeners.current[type];
      if (!listeners) return;
      listeners.forEach((listener) => removeEventListener(type, listener));
    });
    _eventListeners.current = {};
    setRemoteTracks([]);

    /**
     * Removing all packet received event listeners.
     */
    removeAllOnPacketReceiveListeners();

    setConnectionStatus(ERealtimeConnectionStatus.Disconnecting);
    const response = connection.disconnect();

    if (response.ok) {
      setConnectionStatus(ERealtimeConnectionStatus.Disconnected);
    } else {
      setConnectionStatus(ERealtimeConnectionStatus.Failed);
    }

    return response;
  }, [
    connection,
    connectionStatus,
    removeEventListener,
    removeAllOnPacketReceiveListeners,
  ]);

  const getLocalTracks = React.useCallback(
    (type: ETrackKind): TUseWebRTCReturn<Track[] | null> => {
      if (!connection) {
        return {
          error: {
            msg: "Connection is not defined.",
          },
        };
      }

      if (connectionStatus !== ERealtimeConnectionStatus.Connected) {
        return {
          error: {
            msg: "Not connected.",
          },
        };
      }

      try {
        const data = connection.mediaManager.localStreams[type];
        return {
          ok: true,
          data,
        };
      } catch (error) {
        console.error(error);
        return {
          error: {
            msg: `Unknown error occurred during retrieving local {${type} stream.`,
          },
        };
      }
    },

    [connection, connectionStatus]
  );

  const localAudioTrack = React.useMemo(() => {
    const res = getLocalTracks(ETrackKind.Audio);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getLocalTracks]);

  const localVideoTrack = React.useMemo(() => {
    const res = getLocalTracks(ETrackKind.Video);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getLocalTracks]);

  const getRemoteTracks = React.useCallback(
    (type: ETrackKind): TUseWebRTCReturn<Track[] | null> => {
      try {
        const data = remoteTracks.filter(
          (media) => media.kind === type && media.stream.active === true
        );

        return {
          ok: true,
          data,
        };
      } catch (error) {
        console.error(error);
        return {
          error: {
            msg: "Unknown error occurred during retrieving remote stream.",
          },
        };
      }
    },

    [remoteTracks]
  );

  const remoteAudioTrack = React.useMemo(() => {
    const res = getRemoteTracks(ETrackKind.Audio);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getRemoteTracks]);

  const remoteVideoTrack = React.useMemo(() => {
    const res = getRemoteTracks(ETrackKind.Video);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getRemoteTracks]);

  React.useEffect(() => {
    if (!connection) return;

    if (
      connection.dataChannel &&
      connectionStatus === ERealtimeConnectionStatus.Connected
    ) {
      setDataChannel(new WebRTCDataChannel(connection.dataChannel));
    }

    return () => {
      setDataChannel(null);
    };
  }, [connection, connectionStatus]);

  return {
    connectionStatus,
    response: connectionResponse,
    connect,
    disconnect,
    dataChannel,
    addEventListener,
    removeEventListener,
    getLocalTracks,
    localAudioTrack,
    localVideoTrack,
    getRemoteTracks,
    remoteAudioTrack,
    remoteVideoTrack,
  };
}
