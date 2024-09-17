import { useEffect, useRef } from "react";
import { Track } from "@outspeed/core";

export type RealtimeAudioProps = {
  track: Track | null;
  volume?: number;
};

export function RealtimeAudio(props: RealtimeAudioProps) {
  const { track, volume = 100 } = props;
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.srcObject = track.stream;
      audioRef.current.volume = volume / 100;
    }
  }, [track, volume]);

  return <audio className="rt-audio" ref={audioRef} autoPlay={true}></audio>;
}
