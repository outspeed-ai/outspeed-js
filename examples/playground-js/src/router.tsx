import { createBrowserRouter, json } from "react-router-dom";
import { LandingLayout } from "./landing/layout";
import {
  APP_ROUTE,
  BASE_ROUTE,
  SCREEN_SHARE_APP_ROUTE,
  SCREEN_SHARE_TAKE_INPUT_ROUTE,
  THANK_YOU_ROUTE,
  WEB_RTC_APP_ROUTE,
  WEB_RTC_TAKE_INPUT_ROUTE,
  WEBSOCKET_APP_ROUTE,
  WEBSOCKET_TAKE_INPUT_ROUTE,
} from "./constants/routes";
import { WebRTCTakeInput } from "./landing/WebRTCTakeInput";
import { WebSocketTakeInput } from "./landing/WebSocketTakeInput";
import { WebRTCScreenShareTakeInput } from "./landing/WebRTCScreenShareTakeInput";
import { RealtimeAppLayout } from "./realtime-app/layout";
import { WebRTCRealtimeApp } from "./realtime-app/webrtc";
import { WebSocketRealtimeApp } from "./realtime-app/websocket";
import { WebRTCScreenShareRealtimeApp } from "./realtime-app/webrtc-screen-share";
import { ThankYouScreen } from "./components/thank-you";
import { SomethingWentWrong } from "./components/something-went-wrong";
import { PageNotFound } from "./components/page-not-found";

/**
 * Every time the browser reloads, we will get a new sessionID.
 * We will use this sessionID to track whether the browser is
 * reloaded.
 */
const sessionID = new Date().getTime();

const router = createBrowserRouter([
  {
    path: BASE_ROUTE,
    element: <LandingLayout />,
    errorElement: <SomethingWentWrong />,
    loader: () => {
      return json({ sessionID });
    },
    children: [
      {
        path: "/",
        element: <WebRTCTakeInput />,
      },
      {
        path: WEB_RTC_TAKE_INPUT_ROUTE,
        element: <WebRTCTakeInput />,
      },
      {
        path: WEBSOCKET_TAKE_INPUT_ROUTE,
        element: <WebSocketTakeInput />,
      },
      {
        path: SCREEN_SHARE_TAKE_INPUT_ROUTE,
        element: <WebRTCScreenShareTakeInput />,
      },
    ],
  },
  {
    path: APP_ROUTE,
    element: <RealtimeAppLayout />,
    errorElement: <SomethingWentWrong />,
    loader: () => {
      return json({ sessionID });
    },
    children: [
      {
        path: WEB_RTC_APP_ROUTE,
        element: <WebRTCRealtimeApp />,
      },
      {
        path: WEBSOCKET_APP_ROUTE,
        element: <WebSocketRealtimeApp />,
      },
      {
        path: SCREEN_SHARE_APP_ROUTE,
        element: <WebRTCScreenShareRealtimeApp />,
      },
    ],
  },
  // Misc
  {
    path: THANK_YOU_ROUTE,
    loader: () => {
      return json({ sessionID });
    },
    element: <ThankYouScreen />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

export { router };
