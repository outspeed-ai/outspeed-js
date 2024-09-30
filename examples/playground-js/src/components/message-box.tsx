import { useRef } from "react";

import { DataChannel } from "@outspeed/core";

export type MessageBoxProps = {
  dataChannel: DataChannel<unknown>;
};

export function MessageBox(props: MessageBoxProps) {
  const { dataChannel } = props;
  const input = useRef<HTMLInputElement>(null);

  function sendMessage(msg: string) {
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
