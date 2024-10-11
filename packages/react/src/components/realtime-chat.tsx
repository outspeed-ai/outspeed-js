import { useState, useEffect, useRef } from "react";

import { DataChannel, isMessageEvent } from "@outspeed/core";
import { useRealtimeToast } from "../hooks";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Input } from "./__internal/input";

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
      className="flex-1 h-full flex flex-col rounded-lg bg-[var(--chat-bg)] text-[var(--chat-fg)]"
    >
      <div className="px-4 py-2 font-bold flex justify-between items-center relative">
        <span>{heading}</span>
        {onCloseButtonClick && (
          <button
            onClick={onCloseButtonClick}
            className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground"
          >
            <Cross1Icon className="h-3 w-3" />
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
                  className="ml-auto text-right inline-flex flex-col space-y-2 max-w-[200px]"
                >
                  <span className="font-light text-sm">{userLabel}</span>
                  <span className="py-2 px-4 rounded-b-[8px] rounded-tl-[8px] bg-[var(--chat-user-bg)] text-[var(--chat-user-fg)]">
                    {data}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className="mr-auto inline-flex flex-col space-y-2 max-w-[200px]"
              >
                <span className="font-light text-sm">{avatarLabel}</span>
                <span className="py-2 px-4 rounded-b-[8px] rounded-tr-[8px] bg-[var(--chat-agent-bg)] text-[var(--chat-agent-fg)]">
                  {data}
                </span>
              </div>
            );
          })}
        </section>
      </div>
      <div className="flex items-center p-2" style={{ marginTop: 10 }}>
        <Input
          className="border-0 bg-[var(--chat-input-bg)] text-[var(--chat-input-fg)]"
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
