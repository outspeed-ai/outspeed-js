import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Examples</h1>
      <div className="flex flex-col space-y-2">
        <Link href="/webrtc" className="text-blue-500 underline">
          WebRTC
        </Link>
        <Link href="/websocket" className="text-blue-500 underline">
          WebSocket
        </Link>
      </div>
    </div>
  );
}
