import { useState, useEffect, useRef } from "react";

import { DataChannel, isMessageEvent } from "@outspeed/core";
// @ts-ignore
import { TalkingHead } from "./talkinghead";
import { Progress } from "../../components/progress";
import { image } from "./avatar-base64";

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
        // {
        //   "url": "./models/brunette.glb",
        //   "body": "F",
        //   "avatarMood": "neutral",
        //   "fi": "Brunetti"
        // }
        {
          url: "https://models.readyplayer.me/66e7f82164fc839991d89550.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
          body: "F",
          avatarMood: "neutral",
          ttsLang: "en-GB",
          ttsVoice: "en-GB-Standard-A",
          lipsyncLang: "en",
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
      console.log("We have messasges");
      if (!isMessageEvent(evt)) {
        return;
      }

      if (typeof evt.data !== "string") {
        return;
      }

      try {
        // TODO HERE
        const message = JSON.parse(evt.data);
        if (avatar) {
          avatar.speakTextHttp(message);
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
      id="chat"
      className="h-96 w-96 flex items-center relative border rounded"
    >
      <div ref={avatarRef} className="h-full w-full" />
      {progressValue !== 100 && (
        <div className="absolute inset-0 flex items-center p-4">
          <img src={image} className="absolute left-0 right-0 bottom-0" />
          <div className="absolute left-0 right-0 top-0 bottom-0 bg-black opacity-25"></div>
          <Progress value={progressValue} />
        </div>
      )}
    </div>
  );
}
