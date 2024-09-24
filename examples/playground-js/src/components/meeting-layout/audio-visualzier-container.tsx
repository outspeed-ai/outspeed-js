import { RealtimeAudioVisualizer } from "@outspeed/react";
import { Track } from "@outspeed/core";
import { MediaAction } from "./media-action";
import { Mic, MicOff } from "lucide-react";

export type TAudioVisualizerContainerProps = {
  track: Track | null;
  label: string;
  hasControls?: boolean;
  threshold?: number;
};

export function AudioVisualizerContainer(
  props: TAudioVisualizerContainerProps
) {
  const { track, label, hasControls, threshold } = props;

  return (
    <div className="flex-1 relative group flex justify-center rounded-lg items-center border py-10 overflow-hidden max-h-72 sm:max-h-[500px]">
      {hasControls && (
        <div className="absolute top-2 right-2 opacity-0 space-x-3 group-hover:opacity-100">
          <MediaAction track={track} Off={MicOff} On={Mic} />
        </div>
      )}
      <RealtimeAudioVisualizer track={track} threshold={threshold} />
      <div className="absolute bottom-2 text-sm left-2 px-2 py-1 bg-background rounded-md font-bold">
        {label}
      </div>
    </div>
  );
}
