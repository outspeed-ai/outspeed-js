import { useState, useEffect, useRef } from "react";

import { DataChannel, isMessageEvent } from "@outspeed/core";
import { Loader2 } from "lucide-react";
// @ts-ignore
import { TalkingHead } from "./talkinghead";
import { Progress } from "../../components/progress";

export type RealtimeAvatarProps = {
  dataChannel?: DataChannel<unknown>;
};

export function RealtimeAvatar(props: RealtimeAvatarProps) {
  const { dataChannel } = props;
  const avatarRef = useRef<HTMLDivElement>(null);
  const [avatar, setAvatar] = useState<TalkingHead | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);

  useEffect(() => {
    if (avatarRef.current && !avatar) {
      const head = new TalkingHead(avatarRef.current, {
        cameraZoomEnable: true,
        cameraPanEnable: true,
        cameraView: "head",
        avatarMood: "neutral",
        // Stats display that can be used when testing performance
        statsNode: document.body,
        statsStyle:
          "position: fixed; bottom: 0px; left: 0px; cursor: pointer; opacity: 0.9; z-index: 10000;",
      });
      setAvatar(head);
    }
  }, []);

  useEffect(() => {
    if (avatar) {
      avatar.showAvatar(
        {
          url: "https://models.readyplayer.me/6694986c34432ca7edeb2d33.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
          body: "F",
          avatarMood: "neutral",
        },
        // @ts-expect-error
        (ev: any) => {
          if (ev.lengthComputable) {
            let val = Math.min(100, Math.round((ev.loaded / ev.total) * 100));
            if (val !== 100) {
              setProgressValue(val);
            } else {
              setTimeout(() => {
                // To avoid white screen.
                // We are setting it 100 after 2 seconds of interval.
                setProgressValue(100);
              }, 2000);
            }
          }
        }
      );
    }
  }, [avatar]);

  useEffect(() => {
    const onMessage = (evt: unknown) => {
      console.log("Recevied message", evt, isMessageEvent(evt));
      if (!isMessageEvent(evt)) {
        return;
      }

      if (typeof evt.data !== "string") {
        return;
      }

      try {
        // TODO HERE
        const message = JSON.parse(evt.data);
        console.log("Parsed message");
        console.log(message);
        if (avatar) {
          avatar.speakTextHttp(message.data);
        } else {
          console.log("avatar is null");
        }
      } catch (error) {
        console.error(error);
      }
    };

    dataChannel?.addEventListener("message", onMessage);
    return () => {
      dataChannel?.removeEventListener("message", onMessage);
    };
  }, [dataChannel, avatar]);

  return (
    <div
      id="avatar-container"
      className="flex-1 relative flex rounded-lg border overflow-hidden h-[500px]"
    >
      <div
        ref={avatarRef}
        className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-300 rounded-lg"
      />
      {progressValue !== 100 && (
        <div className="absolute inset-0 flex items-center p-4">
          <div className="absolute left-0 right-0 top-0 bottom-0 bg-black opacity-50"></div>
          <div className="flex flex-col items-center space-y-4 w-full">
            <Loader2 size="30%" className="animate-spin" />
            <Progress value={progressValue} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}