import { createBrowserRouter, json } from "react-router-dom";
import { LandingLayout } from "./landing/layout";
import {
  APP_ROUTE,
  BASE_ROUTE,
  HUMAN_AVATAR_APP_ROUTE,
  HUMAN_AVATAR_TAKE_INPUT_ROUTE,
  VOICE_BOT_APP_ROUTE,
  VOICE_BOT_TAKE_INPUT_ROUTE,
  THANK_YOU_ROUTE,
  SPORTS_COMMENTATOR_APP_ROUTE,
  SPORTS_COMMENTATOR_TAKE_INPUT_ROUTE,
  WEBSOCKET_APP_ROUTE,
  WEBSOCKET_TAKE_INPUT_ROUTE,
} from "./constants/routes";
import { HumanAvatarTakeInput } from "./landing/HumanAvatarTakeInput";
import { VoiceBotTakeInput } from "./landing/VoiceBotTakeInput";
import { SportsCommentatorTakeInput } from "./landing/SportsCommentatorTakeInput";
import { RealtimeAppLayout } from "./realtime-app/layout";
import { VoiceBotRealtimeApp } from "./realtime-app/voice-bot";
import { HumanAvatarRealtimeApp } from "./realtime-app/human-avatar";
import { SportsCommentatorRealtimeApp } from "./realtime-app/sports-commentator";
import { ThankYouScreen } from "./components/thank-you";
import { SomethingWentWrong } from "./components/something-went-wrong";
import { PageNotFound } from "./components/page-not-found";
import { WebSocketTakeInput } from "./landing/WebSocketTakeInput";
import { WebSocketRealtimeApp } from "./realtime-app/websocket";

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
        element: <VoiceBotTakeInput />,
      },
      {
        path: HUMAN_AVATAR_TAKE_INPUT_ROUTE,
        element: <HumanAvatarTakeInput />,
      },
      {
        path: VOICE_BOT_TAKE_INPUT_ROUTE,
        element: <VoiceBotTakeInput />,
      },
      {
        path: SPORTS_COMMENTATOR_TAKE_INPUT_ROUTE,
        element: <SportsCommentatorTakeInput />,
      },
      {
        path: WEBSOCKET_TAKE_INPUT_ROUTE,
        element: <WebSocketTakeInput />,
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
        path: VOICE_BOT_APP_ROUTE,
        element: <VoiceBotRealtimeApp />,
      },
      {
        path: HUMAN_AVATAR_APP_ROUTE,
        element: <HumanAvatarRealtimeApp />,
      },
      {
        path: SPORTS_COMMENTATOR_APP_ROUTE,
        element: <SportsCommentatorRealtimeApp />,
      },
      {
        path: WEBSOCKET_APP_ROUTE,
        element: <WebSocketRealtimeApp />,
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
