export const EXAMPLES = ["webrtc", "websocket", "webrtc-screen=share"] as const;
export type TRoutes = (typeof EXAMPLES)[number];
