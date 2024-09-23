import { useState, useEffect, useRef } from "react";

import { DataChannel, isMessageEvent } from "@outspeed/core";
import { useRealtimeToast } from "../hooks";
import { Cross2Icon } from "@radix-ui/react-icons";

export type RealtimeChatProps = {
  dataChannel: DataChannel<unknown>;
  /**
   * Heading of the chat window.
   *
   * @default "Chat"
   */
  heading?: string;

  noMessage?: string;

  userLabel?: string;

  avatarLabel?: string;

  /**
   * If defined then close button will be shown.
   */
  onCloseButtonClick?: () => void;
};

export function RealtimeChat(props: RealtimeChatProps) {
  const { toast } = useRealtimeToast();
  const {
    dataChannel,
    heading = "Chat",
    userLabel = "User",
    avatarLabel = "Avatar",
    noMessage = "",
    onCloseButtonClick,
  } = props;
  const chatRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<
    { content?: string; text?: string; type: "user" | "bot" }[]
  >([]);
  const input = useRef<HTMLInputElement>(null);

  function updateMessage(message: {
    content?: string;
    text?: string;
    type: "user" | "bot";
  }) {
    setMessages((currentMessages) => [...currentMessages, message]);

    setTimeout(() => {
      chatRef.current?.scroll({
        top: chatRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }, 300);
  }

  function sendMessage(msg: string) {
    updateMessage({ content: msg, type: "user" });

    dataChannel.send({
      content: msg,
      text: msg,
      role: "user",
    });
  }

  useEffect(() => {
    const onMessage = (evt: unknown) => {
      if (!isMessageEvent(evt)) {
        return;
      }

      if (typeof evt.data !== "string") {
        return;
      }

      try {
        const message = JSON.parse(evt.data);

        if (message.render) {
          toast({
            title: "New Message",
            description: (
              <div dangerouslySetInnerHTML={{ __html: message.render }} />
            ),
          });
          console.log();
        }

        updateMessage({ ...message, type: "bot" });
      } catch (error) {
        console.error(error);
      }
    };

    dataChannel.addEventListener("message", onMessage);
    return () => {
      dataChannel.removeEventListener("message", onMessage);
    };
  }, [dataChannel, toast]);

  return (
    <div
      id="chat"
      className="flex-1 h-full flex flex-col rounded-lg bg-foreground text-background"
    >
      <div className="p-2 font-bold flex justify-between items-center relative">
        <span>{heading}</span>
        {onCloseButtonClick && (
          <button
            onClick={onCloseButtonClick}
            className="hover:bg-red-100 p-2 rounded-full"
          >
            <Cross2Icon className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="overflow-auto flex flex-1" ref={chatRef}>
        <section className="flex-1 flex flex-col space-y-2 px-4 mt-4 pb-2">
          {messages.length === 0 && noMessage && (
            <div className="text-muted flex flex-1 justify-center items-center">
              {noMessage}
            </div>
          )}
          {messages.map((msg, index) => {
            const data = msg.content || msg.text;
            if (!data) return null;

            if (msg.type === "user") {
              return (
                <div
                  key={index}
                  className="ml-auto text-right inline-flex flex-col space-y-1 max-w-[200px]"
                >
                  <span className="font-bold">{userLabel}</span>
                  <span className="py-2 px-4 rounded-[8px] bg-background text-foreground">
                    {data}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className="mr-auto inline-flex flex-col space-y-1 max-w-[200px]"
              >
                <span className="font-bold">{avatarLabel}</span>
                <span className="py-2 px-4 rounded-[8px] bg-primary text-primary-foreground">
                  {data}
                </span>
              </div>
            );
          })}
        </section>
      </div>
      <div className="flex items-center space-x-4" style={{ marginTop: 10 }}>
        <input
          className="p-4 rounded-lg flex h-16 flex-1 bg-[#aaa] placeholder:text-gray-700 hover:bg-[#999] outline-none focus:outline-none"
          placeholder="Type a message & hit Enter"
          ref={input}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.current?.value) {
              sendMessage(input.current.value);
              input.current.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
