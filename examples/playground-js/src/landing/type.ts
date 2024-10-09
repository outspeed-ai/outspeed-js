import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { TRealtimeConfig } from "@outspeed/core";

export type TLayoutOutletContext = {
  onSubmit: (
    config: TRealtimeConfig | TRealtimeWebSocketConfig,
    pathname: string
  ) => void;
};

export type TAppRouteLocationState = {
  config: TRealtimeConfig | TRealtimeWebSocketConfig;
  sessionID: number;
  formURL: string;
};
