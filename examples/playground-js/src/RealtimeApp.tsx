import { TRealtimeConfig } from "@outspeed/core";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { WebRTCRealtimeApp } from "./webrtc";
import { WebSocketRealtimeApp } from "./websocket";
import { AvatarRealtimeApp } from "./avatar";

export type TRealtimeAppProps = {
  selected: string;
  config: TRealtimeWebSocketConfig | TRealtimeConfig;
  onDisconnect: () => void;
};
export function RealtimeApp(props: TRealtimeAppProps) {
  const { config, onDisconnect, selected } = props;

  return (
    <div className="flex justify-center h-dvh w-dvw">
      <div className="flex flex-1 max-w-[1344px] p-4">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="mt-10 flex justify-start">
            <a href="https://outspeed.com">
              <img src="/outspeed.svg" className="h-10" />
            </a>
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
          {selected === "avatar" && (
            <AvatarRealtimeApp
              config={config as TRealtimeWebSocketConfig}
              onDisconnect={onDisconnect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
