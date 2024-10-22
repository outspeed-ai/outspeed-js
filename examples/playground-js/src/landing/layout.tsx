import clsx from "clsx";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { buttonVariants } from "../components/button";
import { FileIcon, Github } from "lucide-react";
import { TAppRouteLocationState, TLayoutOutletContext } from "./type";
import React, { useState } from "react";
import {
  TRealtimeWebSocketConfig,
  TRealtimeConfig,
  getUserMediaPermissionStatus,
} from "@outspeed/core";
import { RealtimeExamples } from "./RealtimeExamples";
import { isChrome, isSafari } from "react-device-detect";
import { BrowserNotSupported } from "../components/browser-not-supported";
import { TLoaderData } from "../types";
import { UserMediaPermissionModal } from "../components/user-media-permission-modal";
import { UserMediaPermissionExplanation } from "../components/user-media-permission-explanation";
import { UserMediaPermissionFailed } from "../components/user-media-permission-failed";

export type TLandingProps = {};

export function LandingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionID } = useLoaderData() as TLoaderData;
  const [userMediaPermissionStatus, setUserMediaPermissionStatus] = useState<
    "init" | "pending" | "success" | "dismissed" | "failed"
  >("init");

  const [isBrowserSupported, setIsBrowserSupported] = React.useState(false);

  const handleOnSubmit = React.useCallback(
    (config: TRealtimeConfig | TRealtimeWebSocketConfig, pathname: string) => {
      navigate(pathname, {
        state: {
          config,
          sessionID,
          formURL: location.pathname,
        } satisfies TAppRouteLocationState,
      });
    },
    [navigate, location.pathname]
  );

  const handlePermission = React.useCallback(async () => {
    const permissionStatus = await getUserMediaPermissionStatus();

    if (permissionStatus.state === "granted") {
      setUserMediaPermissionStatus("success");
      return;
    }

    if (permissionStatus.state === "denied") {
      setUserMediaPermissionStatus("failed");
      return;
    }

    setUserMediaPermissionStatus("pending");
    try {
      /**
       * Asking for user's permission so that we have access
       * to the name of user's devices available.
       */
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      stream.getTracks().forEach(function (track) {
        track.stop();
      });

      setUserMediaPermissionStatus("success");
    } catch (error) {
      console.error("[Handle User Media Permission Error]", error);

      const permissionStatus = await getUserMediaPermissionStatus();
      if (permissionStatus.state === "prompt") {
        setUserMediaPermissionStatus("dismissed");
      } else {
        setUserMediaPermissionStatus("failed");
      }
    }
  }, []);

  const checkBrowser = React.useCallback(() => {
    if (!isChrome && !isSafari) {
      setIsBrowserSupported(false);
    } else {
      setIsBrowserSupported(true);
    }
  }, []);

  React.useEffect(() => {
    checkBrowser();
  }, [checkBrowser]);

  React.useEffect(() => {
    handlePermission();
  }, []);

  if (!isBrowserSupported) {
    return <BrowserNotSupported />;
  }

  return (
    <div className="flex h-dvh w-full flex-col items-center md:items-stretch md:flex-row">
      <div className="flex-1 bg-[hsl(204,80%,5%)] w-full flex justify-center md:justify-end">
        <div className="flex-1 p-4 flex flex-col max-w-lg md:max-w-2xl">
          {/* Logo */}
          <div className="mt-10 flex justify-start">
            <a href="https://outspeed.com">
              <img src="/outspeed.svg" className="h-10" />
            </a>
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
          <RealtimeExamples />
          <Links className="hidden md:block" />
        </div>
      </div>
      <div className="flex-1 flex w-full justify-center md:justify-start">
        <div className="flex-1 flex flex-col max-w-lg justify-center md:px-10 md:max-w-2xl p-4">
          {userMediaPermissionStatus === "success" && (
            <>
              <div className="mb-4 p-4 text-red-500 text-lg border border-red-500 rounded">
                Please ensure that the app is running and Function URL is
                correct.
              </div>
              <Outlet
                context={
                  { onSubmit: handleOnSubmit } satisfies TLayoutOutletContext
                }
              />
            </>
          )}
          {userMediaPermissionStatus === "pending" && (
            <UserMediaPermissionModal />
          )}
          {userMediaPermissionStatus === "dismissed" && (
            /**
             * If user has dismissed the popup, then we are showing
             * a message that why we need camera and microphone access.
             *
             * Also, have a button that user can use top see the media
             * access permission popup again.
             */
            <UserMediaPermissionExplanation
              handlePermission={handlePermission}
            />
          )}
          {userMediaPermissionStatus === "failed" && (
            /**
             * If the user has denied the permission, then we can't do anything
             * using javascript to as for permission again, hence we are showing
             * a message explaining what user can do to reset permission.
             */
            <UserMediaPermissionFailed />
          )}
        </div>
      </div>
      <div className="w-full justify-center mt-16 flex md:hidden">
        <div className="max-w-lg flex-1 py-4 border-t">
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
        href="https://docs.outspeed.com/examples/quickstart"
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
