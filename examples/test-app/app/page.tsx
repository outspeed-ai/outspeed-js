"use client";
import {
  RealtimeAudio,
  useWebRTC,
  RealtimeAudioVisualizer,
  ERealtimeConnectionStatus,
  createConfig,
} from "@outspeed/react";
import { useEffect, useState } from "react";

const onMessage = (msg: any) => {
  console.log(msg);
};

const OutspeedUI = ({ connection }: { connection: any }) => {
  const remoteAudioTrack = connection.remoteAudioTrack;
  const [jsonPayload, setJsonPayload] = useState("");

  useEffect(() => {
    if (connection && connection.dataChannel) {
      connection.dataChannel.addEventListener("message", onMessage);
      return () => {
        connection.dataChannel.removeEventListener("message", onMessage);
      };
    }
  }, [connection.dataChannel]);

  return (
    <>
      <RealtimeAudio track={remoteAudioTrack} />
      <button onClick={() => connection.localAudioTrack?.pause()}>mute</button>
      <button onClick={() => connection.localAudioTrack?.resume()}>
        unmute
      </button>
      <button onClick={() => connection.dataChannel.send("hello")}>
        send message
      </button>
      <textarea
        onChange={(e) => {
          // Attempt to parse as JSON to validate
          setJsonPayload(e.target.value);
        }}
        placeholder="Enter JSON to send..."
      ></textarea>
      <button
        onClick={() => {
          try {
            let payload = JSON.parse(jsonPayload);
            // If valid JSON, send via data channel
            connection.dataChannel.send(payload);
          } catch (err) {
            // Invalid JSON, don't send
            console.error("Invalid JSON input");
          }
        }}
      >
        Send Json
      </button>
      {remoteAudioTrack && (
        <div style={{ height: "16rem", width: "16rem" }}>
          <RealtimeAudioVisualizer
            track={connection.localAudioTrack}
            threshold={120}
          />
        </div>
      )}
    </>
  );
};

export default function Page() {
  const connection = useWebRTC();

  const connectToOutspeed = () => {
    console.log("connecting");
    connection.connect({
      config: createConfig({
        functionURL: "http://localhost:8080",
        audioDeviceId: "",
        audioCodec: "opus/48000/2",
        dataChannelOptions: {},
        audioConstraints: {
          echoCancellation: true,
        },
      }),
    });
    console.log("connected");
  };

  const disconnectFromOutspeed = () => {
    console.log("disconnecting");
    connection.disconnect();
  };

  return (
    <div>
      <h1>Hello, Next.js!</h1>
      <div>
        {connection.connectionStatus === ERealtimeConnectionStatus.Connected ? (
          <button onClick={disconnectFromOutspeed}>Disconnect</button>
        ) : (
          <button onClick={connectToOutspeed}>Connect</button>
        )}
        {connection.connectionStatus ===
          ERealtimeConnectionStatus.Connected && (
          <OutspeedUI connection={connection} />
        )}
      </div>
    </div>
  );
}
