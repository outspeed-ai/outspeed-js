import { PhoneOff } from "lucide-react";
import { Button } from "../button";

export type TDisconnectActionProps = {
  onClick: () => void;
};

export function DisconnectAction(props: TDisconnectActionProps) {
  const { onClick } = props;
  return (
    <Button
      className="rounded-full w-10 h-10"
      variant="destructive"
      size="icon"
      onClick={onClick}
    >
      <PhoneOff className="h-5 w-5" />
    </Button>
  );
}
