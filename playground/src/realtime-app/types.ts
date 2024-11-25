import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { TRealtimeConfig } from "@outspeed/core";

export type TRealtimeAppContext = {
  config: TRealtimeConfig | TRealtimeWebSocketConfig;
  onDisconnect: () => void;
};
