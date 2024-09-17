import { WebsocketApp } from "./websocket/WebsocketApp";
import { AvatarApp } from "./avatar/AvatarApp";
import WebRTCApp from "./webrtc/WebRTCApp";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RealtimeExamples } from "./RealtimeExamples";
import WebRTCScreenShareApp from "./webrtc-screen-share/WebRTCScreenShareApp";
import "@outspeed/react/styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RealtimeExamples />,
  },
  {
    path: "/webrtc",
    element: <WebRTCApp />,
  },
  {
    path: "/websocket",
    element: <WebsocketApp />,
  },
  {
    path: "/webrtc-screen-share",
    element: <WebRTCScreenShareApp />,
  },
  {
    path: "/avatar",
    element: <AvatarApp />,
  },
]);

export default function App() {
  return (
    <div className="container h-screen p-4 flex flex-col">
      <h3 className="font-extrabold">Adapt Playground.</h3>
      <hr className="mt-4" />
      <div className="flex justify-center items-center py-4 flex-1">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}
