import { Button } from "../button";
import React from "react";
import { Track } from "@outspeed/core";
import { LucideProps } from "lucide-react";

export type TMediaActionProps = {
  track: Track | null;
  On: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  Off: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

export function MediaAction(props: TMediaActionProps) {
  const { track, On, Off } = props;
  const [isEnabled, setIsEnabled] = React.useState(true);

  function handleOnToggle() {
    if (!track) return;

    if (track.isMute()) {
      track.resume();
    } else {
      track.pause();
    }

    setIsEnabled((prevState) => !prevState);
  }

  return (
    <Button
      className="rounded-full w-10 h-10"
      variant="outline"
      size="icon"
      onClick={handleOnToggle}
    >
      {isEnabled ? <On className="h-5 w-5" /> : <Off className="h-5 w-5" />}
    </Button>
  );
}
