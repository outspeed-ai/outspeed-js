import { Track } from "@outspeed/core";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { VideContainer } from "./video-container";
import { MediaAction } from "./media-action";
import { ChatAction } from "./chat-action";
import { DisconnectAction } from "./disconnect-action";
import { Clock } from "./clock";
import { DataChannel } from "@outspeed/core";
import React from "react";
import { RealtimeChat } from "@outspeed/react";
import clsx from "clsx";

export type TMeetingLayoutProps = {
  remoteTrack: Track | null;
  localTrack: Track | null;
  remoteAudioTrack: Track | null;
  localAudioTrack: Track | null;
  onCallEndClick: () => void;
  dataChannel?: DataChannel<unknown> | null;
  title: string;
};

export function MeetingLayout(props: TMeetingLayoutProps) {
  const { localTrack, localAudioTrack, onCallEndClick, dataChannel, title } =
    props;

  const [isChatOpened, setIsChatOpened] = React.useState(false);

  return (
    <div className="flex flex-col flex-1 relative">
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
            <ChatAction
              isEnabled={isChatOpened}
              setIsEnabled={setIsChatOpened}
            />
          </div>
          <div className="flex-1 flex justify-end">
            <span className="font-bold text-muted">{title}</span>
          </div>
        </div>
      </div>

      {/* Chat */}
      {dataChannel && (
        <div
          className={clsx(
            "overflow-hidden transition-all flex self-end absolute bottom-24 right-0 w-96",
            isChatOpened ? "h-[500px] opacity-100" : "h-0 opacity-0"
          )}
        >
          <div className="w-full h-[500px] flex">
            <RealtimeChat
              userLabel="You"
              avatarLabel="Outspeed"
              heading="Messages"
              dataChannel={dataChannel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
