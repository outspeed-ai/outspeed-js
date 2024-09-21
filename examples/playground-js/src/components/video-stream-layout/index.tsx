import {
  RealtimeAudio,
  RealtimeAudioVisualizer,
  RealtimeConnectionStatus,
  RealtimeVideo,
} from "@outspeed/react";
import { Track } from "@outspeed/core";
import React from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "../button";
import { VideContainer } from "./video-container";
import { MediaAction } from "./media-action";
import { ChatAction } from "./chat-action";
import { DisconnectAction } from "./disconnect-action";

export type TVideoStreamProps = {
  remoteTrack: Track | null;
  localTrack: Track | null;
  remoteAudioTrack: Track | null;
  localAudioTrack: Track | null;
  onCallEndClick: () => void;
};

export function VideoStream(props: TVideoStreamProps) {
  const { localTrack, localAudioTrack } = props;

  return (
    <div className="flex flex-col flex-1">
      {/* Video section */}
      <div className="flex-1 items-center flex">
        <div className="flex flex-1 justify-center space-x-6">
          <VideContainer track={localTrack} label="Outspeed" />
          <VideContainer track={localTrack} label="You" />
        </div>
      </div>

      {/* Call Section */}
      <div className="pb-4 flex">
        <div className="bg-[#222] flex flex-1 p-4 rounded-md">
          <DisconnectAction />
          <div className="flex flex-1 space-x-4 justify-center">
            <MediaAction track={localAudioTrack} On={Mic} Off={MicOff} />
            <MediaAction track={localTrack} On={Video} Off={VideoOff} />
          </div>
          <ChatAction />
        </div>
      </div>
    </div>
  );
}
