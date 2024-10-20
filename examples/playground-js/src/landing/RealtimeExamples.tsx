import clsx from "clsx";
import { AudioLinesIcon, ScreenShare, VideoIcon } from "lucide-react";
import {
  VOICE_BOT_TAKE_INPUT_ROUTE,
  HUMAN_AVATAR_TAKE_INPUT_ROUTE,
  SPORTS_COMMENTATOR_TAKE_INPUT_ROUTE,
  WEBSOCKET_TAKE_INPUT_ROUTE,
} from "../constants/routes";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type TExampleData = {
  link: string;
  title: string;
  description: string;
  icons: {
    title: string;
    children: React.ReactNode;
  }[];
};

const data: TExampleData[] = [
  {
    title: "Human Avatar",
    description:
      "In this example, we will establish a WebRTC connection to stream both local and remote audio and video tracks.",
    link: HUMAN_AVATAR_TAKE_INPUT_ROUTE,
    icons: [
      {
        title: "Audio",
        children: <AudioLinesIcon />,
      },
      {
        title: "Video",
        children: <VideoIcon />,
      },
    ],
  },
  {
    title: "Voice Bot",
    description:
      "In this example, we will establish a WebRTC connection to stream both local and remote audio tracks.",
    link: VOICE_BOT_TAKE_INPUT_ROUTE,
    icons: [
      {
        title: "Audio",
        children: <AudioLinesIcon />,
      },
    ],
  },
  {
    title: "Sports Commentator",
    description:
      "In this example, we will set up a WebRTC connection to stream both screen recording and a local audio track.",
    link: SPORTS_COMMENTATOR_TAKE_INPUT_ROUTE,
    icons: [
      {
        title: "Audio",
        children: <AudioLinesIcon />,
      },
      {
        title: "Screen Share",
        children: <ScreenShare />,
      },
    ],
  },
  {
    title: "Websocket App",
    description:
      "In this example, we will establish a Web Socket connection to stream both local and remote audio tracks.",
    link: WEBSOCKET_TAKE_INPUT_ROUTE,
    icons: [
      {
        title: "Audio",
        children: <AudioLinesIcon />,
      },
    ],
  },
];

export function RealtimeExamples() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex-1 mt-20">
      <div className="flex flex-wrap gap-4 flex-col md:flex-row">
        {data.map((item) => (
          <div
            className={clsx(
              "border flex-1 p-4 rounded cursor-pointer hover:bg-accent hover:border-transparent md:max-w-[250px] md:flex-auto",
              pathname === item.link && "border-primary hover:!border-primary"
            )}
            key={item.title}
            onClick={() => navigate(item.link)}
          >
            <div className="font-bold mb-4">{item.title}</div>
            <div className="flex space-x-3 mb-4">
              {item.icons.map((icon) => (
                <div key={icon.title}>{icon.children}</div>
              ))}
            </div>
            <div>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
