import React, { useState, useEffect, useRef } from "react";

import { DataChannel, isMessageEvent } from "@outspeed/core";
import { useRealtimeToast } from "../hooks";

export type RealtimeChatProps = {
  dataChannel: DataChannel<unknown>;
};

export function RealtimeChat(props: RealtimeChatProps) {
  const { toast } = useRealtimeToast();
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
      content: msg,
      text: msg,
      role: "user",
    });
  }

  const fixChatContainerHeight = React.useCallback(() => {
    const chatContainer = document.getElementById("chat");
    if (chatContainer) {
      chatContainer.style.height = `${window.innerHeight - 100}px`;
    }
  }, []);

  useEffect(() => {
    fixChatContainerHeight();
    window.addEventListener("resize", fixChatContainerHeight);

    return () => {
      window.removeEventListener("resize", fixChatContainerHeight);
    };
  }, [fixChatContainerHeight]);

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
  }, [dataChannel]);

  return (
    <div
      id="chat"
      className="flex-1 h-full flex flex-col border rounded overflow-hidden"
    >
      <div className="p-2 font-bold border-b">Chat</div>
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
