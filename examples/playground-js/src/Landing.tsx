import { RealtimeExamples } from "./RealtimeExamples";
import { buttonVariants } from "./components/button";
import { FileIcon, Github } from "lucide-react";
import { WebRTCTakeInput } from "./WebRTCTakeInput";
import { TRealtimeConfig } from "@outspeed/core";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { WebSocketTakeInput } from "./WebSocketTakeInput";
import clsx from "clsx";

export type TLandingProps = {
  selectedExample: string;
  setSelectedExample: (selected: string) => void;
  onSubmit: (data: TRealtimeConfig | TRealtimeWebSocketConfig) => void;
};

export function Landing(props: TLandingProps) {
  const { onSubmit, selectedExample, setSelectedExample } = props;
  return (
    <div className="flex h-screen w-screen flex-col items-center md:items-stretch md:flex-row">
      <div className="flex-1 bg-[hsl(204,80%,5%)] w-full flex justify-center md:justify-end">
        <div className="flex-1 p-4 flex flex-col max-w-lg md:max-w-2xl">
          {/* Logo */}
          <div className="mt-10">
            <img src="/outspeed.svg" className="h-10" />
          </div>
          {/* Description */}
          <div className="mt-10 text-[#999] pr-10">
            <p>
              Outspeed offers networking and inference infrastructure for
              building fast, real-time voice and video AI applications.
            </p>
            <br />
            <p>
              Choose an example from the list below, update the input form on
              the right, and click "Run" to see it in action.
            </p>
          </div>
          <RealtimeExamples
            selected={selectedExample}
            onClick={(id) => setSelectedExample(id)}
          />
          <Links className="hidden md:block" />
        </div>
      </div>
      <div className="flex-1 flex w-full justify-center md:justify-start">
        <div className="flex-1 flex flex-col max-w-lg justify-center md:px-10 md:max-w-2xl p-4">
          {selectedExample === "webrtc" && (
            <WebRTCTakeInput onSubmit={onSubmit} />
          )}
          {selectedExample === "websocket" && (
            <WebSocketTakeInput onSubmit={onSubmit} />
          )}
        </div>
      </div>
      <div className="w-full justify-center mt-4 flex md:hidden">
        <div className="max-w-lg flex-1">
          <Links />
        </div>
      </div>
    </div>
  );
}

function Links(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div {...props} className={clsx("mt-4", props.className)}>
      <a
        target="_blank"
        href="https://github.com/outspeed-ai/outspeed-js"
        className={buttonVariants({
          variant: "ghost",
          className: "w-12 h-12",
          size: "icon",
        })}
      >
        <Github className="h-6 w-6" />
      </a>
      <a
        target="_blank"
        href="https://docs.outspeed.ai/guide/quickstart"
        className={buttonVariants({
          variant: "ghost",
          className: "w-12 h-12",
          size: "icon",
        })}
      >
        <FileIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
