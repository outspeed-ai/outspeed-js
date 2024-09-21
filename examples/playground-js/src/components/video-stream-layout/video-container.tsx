import { RealtimeVideo } from "@outspeed/react";
import { Track } from "@outspeed/core";

export type TVideContainerProps = {
  track: Track | null;
  label: string;
};

export function VideContainer(props: TVideContainerProps) {
  const { track, label } = props;

  return (
    <div className="flex-1 relative">
      <RealtimeVideo track={track} />
      <div className="absolute bottom-2 text-sm left-2 px-2 py-1 bg-background rounded-md font-bold">
        {label}
      </div>
    </div>
  );
}
