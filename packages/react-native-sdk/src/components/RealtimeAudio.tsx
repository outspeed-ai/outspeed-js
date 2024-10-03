import { RTCView } from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import React from "react";

export type TRealtimeAudioProps = typeof RTCView.defaultProps;

export function RealtimeAudio(props: TRealtimeAudioProps) {
  React.useEffect(() => {
    InCallManager.setSpeakerphoneOn(true);
  }, []);

  return <RTCView {...props} />;
}
