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
      <div className="absolute bottom-0 left-0 px-4 py-2 bg-black bg-opacity-45 rounded-bl-md rounded-tr-md font-bold">
        {label}
      </div>
    </div>
  );
}
