import { Track } from "@outspeed/core";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { VideContainer } from "./video-container";
import { MediaAction } from "./media-action";
import { ChatAction } from "./chat-action";
import { DisconnectAction } from "./disconnect-action";
import { Clock } from "./clock";

export type TVideoStreamProps = {
  remoteTrack: Track | null;
  localTrack: Track | null;
  remoteAudioTrack: Track | null;
  localAudioTrack: Track | null;
  onCallEndClick: () => void;
};

export function VideoStream(props: TVideoStreamProps) {
  const { localTrack, localAudioTrack, onCallEndClick } = props;

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
        <div className="flex flex-1 p-4 rounded-md">
          <div className="flex-1 flex justify-start items-center space-x-4">
            <div className="uppercase font-bold">
              <Clock />
            </div>
          </div>
          <div className="flex flex-1 space-x-4 justify-center">
            <DisconnectAction onClick={onCallEndClick} />
            <MediaAction track={localAudioTrack} On={Mic} Off={MicOff} />
            <MediaAction track={localTrack} On={Video} Off={VideoOff} />
            <ChatAction />
          </div>
          <div className="flex-1 flex justify-end">
            <span className="font-bold text-muted">WebRTC Example</span>
          </div>
        </div>
      </div>
    </div>
  );
}
