import React from "react";
import { RealtimeExamples } from "./RealtimeExamples";
import { Button, buttonVariants } from "./components/button";
import { Github } from "lucide-react";

export function Landing() {
  const [selectedExample, setSelectedExample] = React.useState("webrtc");

  return (
    <div className="flex h-screen w-screen">
      <div className="flex-1 bg-[hsl(204,80%,5%)] flex justify-end">
        <div className="flex-1 max-w-2xl p-4 flex flex-col">
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
          <div className="mt-auto flex justify-end">
            <a
              target="_blank"
              href="https://github.com/outspeed-ai/outspeed-js"
              className={buttonVariants({
                variant: "ghost",
                className: "w-10 h-10",
                size: "icon",
              })}
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="flex-1 flex justify-start p-4">
        <div className="flex-1 max-w-2xl ">Form section</div>
      </div>
    </div>
  );
}
