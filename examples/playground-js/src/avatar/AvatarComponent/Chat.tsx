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

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden max-h-[266px]">
      <div className="overflow-hidden rounded" style={{ marginTop: 10 }}>
        <input
          className="px-2 py-4 w-full rounded bg-gray-800 hover:bg-gray-700 focus:bg-gray-900 focus:border-t text-white"
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
