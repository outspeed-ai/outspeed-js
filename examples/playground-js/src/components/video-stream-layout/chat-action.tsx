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
      className="rounded-full"
      variant={isEnabled ? "default" : "ghost"}
      size="icon"
      onClick={handleOnToggleChat}
    >
      {isEnabled ? (
        <MessageSquare className="h-4 w-4" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
    </Button>
  );
}
