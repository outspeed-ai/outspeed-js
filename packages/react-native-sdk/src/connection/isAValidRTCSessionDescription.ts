import { RTCSessionDescription } from "react-native-webrtc";

export function isAValidRTCSessionDescription(
  obj: unknown
): obj is RTCSessionDescription {
  // Check if the object is non-null and of type 'object'
  if (obj && typeof obj === "object") {
    const rtcObj = obj as Partial<RTCSessionDescription>;

    // Check if 'type' exists and is one of the valid values
    const isValidType =
      rtcObj.type === "offer" ||
      rtcObj.type === "answer" ||
      rtcObj.type === "rollback";

    // Check if 'sdp' exists and is a string
    const isValidSdp =
      rtcObj.sdp === undefined || typeof rtcObj.sdp === "string";

    return isValidType && isValidSdp;
  }

  return false;
}
