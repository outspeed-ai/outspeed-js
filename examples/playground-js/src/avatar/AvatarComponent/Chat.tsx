import React, { useState, useEffect, useRef } from "react";

import { DataChannel, isMessageEvent } from "@outspeed/core";

export type RealtimeChatProps = {
  dataChannel: DataChannel<unknown>;
};

export function RealtimeChat(props: RealtimeChatProps) {
  const { dataChannel } = props;
  const chatRef = useRef<HTMLAudioElement>(null);
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
      type: "message",
      data: msg,
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

      console.log("Message", evt.data);
    };

    dataChannel.addEventListener("message", onMessage);
    return () => {
      dataChannel.removeEventListener("message", onMessage);
    };
  }, [dataChannel]);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden max-h-[266px]">
      <section
        ref={chatRef}
        className="flex-1 flex flex-col overflow-auto space-y-2 px-2"
      >
        {messages.map((msg, index) => {
          const data = msg.content || msg.text;
          if (!data) return null;

          if (msg.type === "user") {
            return (
              <div
                key={index}
                className="ml-auto text-right inline-flex flex-col space-y-1 max-w-[200px]"
              >
                <span>User</span>
                <span className=" py-2 px-4 rounded-[8px] bg-secondary text-foreground">
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
              <span>Avatar</span>
              <span className=" py-2 px-4 rounded-[8px] bg-primary text-background">
                {data}
              </span>
            </div>
          );
        })}
      </section>
      <div className="overflow-hidden rounded" style={{ marginTop: 10 }}>
        <input
          className="px-2 py-4 w-full rounded bg-gray-100 hover:bg-gray-200 focus:bg-gray-50 focus:border-t"
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
