import { MessageSquare } from "lucide-react";
import { Button } from "../button";
import React from "react";

export type TChatActionProps = {};

export function ChatAction(props: TChatActionProps) {
  const [isEnabled, setIsEnabled] = React.useState(false);

  function handleOnToggleChat() {
    setIsEnabled((prevState) => !prevState);
  }

  return (
    <Button
      className="rounded-full w-10 h-10"
      variant={isEnabled ? "default" : "outline"}
      size="icon"
      onClick={handleOnToggleChat}
    >
      {isEnabled ? (
        <MessageSquare className="h-5 w-5" />
      ) : (
        <MessageSquare className="h-5 w-5" />
      )}
    </Button>
  );
}
