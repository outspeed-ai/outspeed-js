import { PhoneOff } from "lucide-react";
import { Button } from "../button";
export type TDisconnectActionProps = {};

export function DisconnectAction(props: TDisconnectActionProps) {
  return (
    <Button className="rounded-full" variant="destructive" size="icon">
      <PhoneOff className="h-4 w-4" />
    </Button>
  );
}
