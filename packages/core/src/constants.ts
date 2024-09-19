import { TAudioCodec, TVideoCodec } from "./shared/@types";

export const ICE_STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:5349" },
  { urls: "stun:stun4.l.google.com:5349" },
];
export const DEFAULT_VIDEO_CONSTRAINTS: MediaTrackConstraints = {};
export const DEFAULT_AUDIO_CONSTRAINTS: MediaTrackConstraints = {};
export const DEFAULT_SCREEN_CONSTRAINTS: DisplayMediaStreamOptions = {};

export const VIDEO_CODEC_OPTIONS: TVideoCodec[] = [
  "default",
  "VP8/90000",
  "H264/90000",
];

export const AUDIO_CODEC_OPTIONS: TAudioCodec[] = [
  "default",
  "opus/48000/2",
  "PCMU/8000",
  "PCMA/8000",
];
