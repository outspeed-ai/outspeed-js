import clsx from "clsx";
import { AudioLinesIcon, ScreenShare, VideoIcon } from "lucide-react";
import { TRoutes } from "./constants";
import React from "react";

type TExampleData = {
  id: TRoutes;
  title: string;
  description: string;
  icons: {
    title: string;
    children: React.ReactNode;
  }[];
};

const data: TExampleData[] = [
  {
    title: "WebRTC",
    description:
      "In this example, we will establish a WebRTC connection to stream both local and remote audio and video tracks.",
    id: "webrtc",
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
    title: "Web Socket",
    description:
      "In this example, we will establish a Web Socket connection to stream both local and remote audio tracks.",
    id: "websocket",
    icons: [
      {
        title: "Audio",
        children: <AudioLinesIcon />,
      },
    ],
  },
  {
    title: "Screen Share",
    description:
      "In this example, we will set up a WebRTC connection to stream both screen recording and a local audio track.",
    id: "webrtc-screen=share",
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
];

export type TRealtimeExamples = {
  onClick: (id: TRoutes) => void;
  selected: string;
};

export function RealtimeExamples(props: TRealtimeExamples) {
  const { onClick, selected } = props;

  return (
    <div className="flex-1 mt-20">
      <div className="flex flex-wrap gap-4 flex-col sm:flex-row">
        {data.map((item) => (
          <div
            className={clsx(
              "border flex-1 p-4 rounded cursor-pointer hover:bg-accent hover:border-transparent md:max-w-[250px] md:flex-auto",
              selected === item.id && "border-primary hover:!border-primary"
            )}
            key={item.title}
            onClick={() => onClick(item.id)}
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
