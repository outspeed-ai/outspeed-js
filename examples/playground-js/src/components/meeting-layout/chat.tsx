import { DataChannel } from "@outspeed/core";
import { RealtimeChat } from "@outspeed/react";
import clsx from "clsx";
import React from "react";

export type TChatProps = {
  dataChannel: DataChannel<unknown>;
  isOpen: boolean;
  onRequestClose: () => void;
};

const DEFAULT_CHAT_BOX_HEIGHT = 500;

export function Chat(props: TChatProps) {
  const { dataChannel, isOpen, onRequestClose } = props;
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const handleResize = React.useCallback(() => {
    if (!chatContainerRef.current) {
      return;
    }

    const parent = chatContainerRef.current.parentElement;

    if (!parent) {
      chatContainerRef.current.style.height = `${DEFAULT_CHAT_BOX_HEIGHT}px`;
      return;
    }

    const height = parent.clientHeight;

    if (height) {
      chatContainerRef.current.style.height = `${height}px`;
    } else {
      chatContainerRef.current.style.height = `${DEFAULT_CHAT_BOX_HEIGHT}px`;
    }
  }, []);

  React.useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <div
      ref={chatContainerRef}
      className={clsx(
        "overflow-hidden transition-all flex self-end right-0",
        isOpen ? "w-[350px] ml-6 opacity-100" : "opacity-0 w-0"
      )}
    >
      <div className="w-full h-full flex">
        <RealtimeChat
          onCloseButtonClick={onRequestClose}
          userLabel="You"
          avatarLabel="Outspeed"
          heading="Messages"
          dataChannel={dataChannel}
          noMessage="Your conversation will appear here."
        />
      </div>
    </div>
  );
}
