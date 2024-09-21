import { WebsocketApp } from "./websocket/WebsocketApp";
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
]);

export default function App() {
  return (
    <div className="container h-screen flex flex-col">
      <h3 className="font-extrabold py-4">Outspeed Playground</h3>
      <div className="flex justify-center items-center flex-1">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}
