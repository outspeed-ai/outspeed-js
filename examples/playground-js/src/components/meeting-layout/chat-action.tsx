import { MessageSquare } from "lucide-react";
import { Button } from "../button";

export type TChatActionProps = {
  isEnabled: boolean;
  setIsEnabled: (state: boolean) => void;
};

export function ChatAction(props: TChatActionProps) {
  const { isEnabled, setIsEnabled } = props;

  return (
    <Button
      className="rounded-full w-10 h-10 hidden sm:inline-flex"
      variant={isEnabled ? "default" : "outline"}
      size="icon"
      onClick={() => setIsEnabled(!isEnabled)}
    >
      {isEnabled ? (
        <MessageSquare className="h-5 w-5" />
      ) : (
        <MessageSquare className="h-5 w-5" />
      )}
    </Button>
  );
}
