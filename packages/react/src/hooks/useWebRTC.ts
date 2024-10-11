import { useActor } from "@xstate/react";
import React from "react";
import {
  isRTCTrackEvent,
  realtimeConnectionMachine,
  TRealtimeConnectionListener,
  TRealtimeConnectionListenerType,
  TRealtimeConfig,
  Track,
  WebRTCDataChannel,
  ETrackOrigin,
  ETrackKind,
} from "@outspeed/core";

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
  const [actor, send] = useActor(realtimeConnectionMachine);
  const [remoteTracks, setRemoteTracks] = React.useState<Track[]>([]);
  const [dataChannel, setDataChannel] =
    React.useState<WebRTCDataChannel | null>(null);

  const { config } = options;

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
      const connection = actor.context.connection;

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
    [_registerEventListener, actor.context.connection]
  );

  const removeEventListener = React.useCallback(
    (
      type: TRealtimeConnectionListenerType,
      listener: TRealtimeConnectionListener
    ): TUseWebRTCReturn => {
      const connection = actor.context.connection;

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
    [_unregisterEventListener, actor.context.connection]
  );

  const removeAllOnPacketReceiveListeners = React.useCallback(() => {
    const connection = actor.context.connection;

    if (!connection) {
      return {
        error: {
          msg: "Failed to add event listener.",
        },
      };
    }

    connection.removeAllOnPacketReceiverListeners();
  }, [actor.context.connection]);

  const connect = React.useCallback(() => {
    if (!actor.can({ type: "CONNECT" })) {
      return {
        error: {
          msg: `You cannot call connect() if the connection state is: ${actor.value}. It can only be called if the connection state is SetupCompleted.`,
        },
      };
    }

    addEventListener("track", _handleOnTrack);

    send({ type: "CONNECT" });

    return {
      ok: true,
    };
  }, [actor, addEventListener, _handleOnTrack, send]);

  const disconnect = React.useCallback((): TUseWebRTCReturn => {
    if (!actor.can({ type: "DISCONNECT" })) {
      return {
        error: {
          msg: `You cannot call disconnect(), if the connection state is: ${actor.value}. It can only be called if the connection state is Connected`,
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

    send({ type: "DISCONNECT" });

    return {
      ok: true,
    };
  }, [actor, send, removeEventListener, removeAllOnPacketReceiveListeners]);

  const getLocalTracks = React.useCallback(
    (type: ETrackKind): TUseWebRTCReturn<Track[] | null> => {
      const connection = actor.context.connection;

      if (!connection) {
        return {
          error: {
            msg: "Connection is not defined.",
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

    [actor]
  );

  const getLocalAudioTrack = React.useCallback(() => {
    const res = getLocalTracks(ETrackKind.Audio);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getLocalTracks]);

  const getLocalVideoTrack = React.useCallback(() => {
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

  const getRemoteAudioTrack = React.useCallback(() => {
    const res = getRemoteTracks(ETrackKind.Audio);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getRemoteTracks]);

  const getRemoteVideoTrack = React.useCallback(() => {
    const res = getRemoteTracks(ETrackKind.Video);

    if (res.data) {
      return res.data[0];
    }

    return null;
  }, [getRemoteTracks]);

  const reset = React.useCallback((): TUseWebRTCReturn => {
    if (!actor.can({ type: "RESET" })) {
      return {
        error: {
          msg: `You cannot reset if the connection state is: ${actor.value}. It can be called if the connection state is Disconnected or Failed.`,
        },
      };
    }

    send({ type: "RESET" });

    return {
      ok: true,
    };
  }, [send, actor]);

  React.useEffect(() => {
    if (actor.can({ type: "SETUP_CONNECTION", payload: { config } })) {
      send({ type: "SETUP_CONNECTION", payload: { config } });
    }
  }, [actor, send, config]);

  React.useEffect(() => {
    const connection = actor.context.connection;

    if (!connection) return;

    if (connection.dataChannel && actor.value === "Connected") {
      setDataChannel(new WebRTCDataChannel(connection.dataChannel));
    }

    return () => {
      setDataChannel(null);
    };
  }, [actor]);

  return {
    connectionStatus: actor.value,
    response: actor.context.connectionResponse,
    connect,
    disconnect,
    reset,
    dataChannel,
    addEventListener,
    removeEventListener,
    getLocalAudioTrack,
    getLocalVideoTrack,
    getLocalTracks,
    getRemoteAudioTrack,
    getRemoteVideoTrack,
    getRemoteTracks,
  };
}
