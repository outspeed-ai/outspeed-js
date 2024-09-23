import clsx from "clsx";
import { AudioLinesIcon, VideoIcon } from "lucide-react";

const data = [
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
];

export type TRealtimeExamples = {
  onClick: (id: string) => void;
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
              "border border-[#222] flex-1 p-4 rounded cursor-pointer hover:bg-accent hover:border-transparent md:max-w-[250px] md:flex-auto",
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
