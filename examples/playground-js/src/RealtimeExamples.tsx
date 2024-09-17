import { AudioLinesIcon, ScreenShare, VideoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RealtimeExamples() {
  const navigate = useNavigate();

  const data = [
    {
      title: "WebRTC",
      description:
        "In this example, we will establish a WebRTC connection to stream both local and remote audio and video tracks.",
      link: "/webrtc",
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
        "In this example, we will establish a WebSocket connection to stream both local and remote audio tracks.",
      link: "/websocket",
      icons: [
        {
          title: "Audio",
          children: <AudioLinesIcon />,
        },
      ],
    },
    {
      title: "WebRTC Screen Share",
      description:
        "In this example, we will set up a WebRTC connection to stream both local audio and screen, as well as the remote screen track.",
      link: "/webrtc-screen-share",
      icons: [
        {
          title: "Audio",
          children: <AudioLinesIcon />,
        },
        {
          title: "Video",
          children: <VideoIcon />,
        },
        {
          title: "Screen",
          children: <ScreenShare />,
        },
      ],
    },
  ];

  return (
    <div className="flex-1 h-full">
      <div className="font-bold mb-4 text-xl">Examples</div>
      <div className="flex flex-wrap gap-4">
        {data.map((item) => (
          <div
            className="border max-w-[250px] p-4 rounded hover:bg-slate-50 cursor-pointer"
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
