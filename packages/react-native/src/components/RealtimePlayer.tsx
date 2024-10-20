import { RTCView } from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import React from "react";

export type TRealtimePlayerProps = typeof RTCView.defaultProps;

export function RealtimePlayer(props: TRealtimePlayerProps) {
  React.useEffect(() => {
    InCallManager.setSpeakerphoneOn(true);
  }, []);

  return <RTCView {...props} />;
}
