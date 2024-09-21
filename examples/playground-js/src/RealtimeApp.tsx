import { TRealtimeConfig } from "@outspeed/core";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { WebRTCRealtimeApp } from "./webrtc";
import { WebSocketRealtimeApp } from "./websocket/RealtimeApp";

export type TRealtimeAppProps = {
  selected: string;
  config: TRealtimeWebSocketConfig | TRealtimeConfig;
  onDisconnect: () => void;
};
export function RealtimeApp(props: TRealtimeAppProps) {
  const { config, onDisconnect, selected } = props;

  return (
    <div className="flex justify-center h-screen w-screen">
      <div className="flex flex-1 max-w-[1376px] p-4">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="mt-10">
            <img src="/outspeed.svg" className="h-10" />
          </div>
          {selected === "webrtc" && (
            <WebRTCRealtimeApp config={config} onDisconnect={onDisconnect} />
          )}
          {selected === "websocket" && (
            <WebSocketRealtimeApp
              config={config as TRealtimeWebSocketConfig}
              onDisconnect={onDisconnect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
