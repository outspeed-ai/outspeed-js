import { useEffect, useRef } from "react";
import { Track } from "@outspeed/core";

export type RealtimeVideoProps = {
  track: Track | null;
};

export function RealtimeVideo(props: RealtimeVideoProps) {
  const { track } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (track && videoRef.current) {
      videoRef.current.srcObject = track.stream;
    }
  }, [track]);

  return (
    <video
      className="rounded-md object-cover h-full w-full"
      ref={videoRef}
      autoPlay={true}
      playsInline={true}
    ></video>
  );
}
