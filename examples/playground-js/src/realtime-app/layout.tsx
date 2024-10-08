import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { TAppRouteLocationState } from "../landing/type";
import { TRealtimeAppContext } from "./types";
import React from "react";
import { BASE_ROUTE, THANK_YOU_ROUTE } from "../constants/routes";
import { RealtimeToast } from "@outspeed/react";
import { TLoaderData } from "../types";

export function RealtimeAppLayout() {
  const location = useLocation();
  const { sessionID } = useLoaderData() as TLoaderData;

  const state = location.state as TAppRouteLocationState;

  const navigate = useNavigate();

  const handleDisconnect = React.useCallback(() => {
    navigate(THANK_YOU_ROUTE);
  }, [navigate]);

  React.useEffect(() => {
    /**
     * If the state is `undefined` or if `state.sessionID` does not match the
     * expected `sessionID`, we redirect to the homepage.
     *
     * The state is undefined typically due to a bug.
     *
     * `state.sessionID` not matching `sessionID` indicates a browser reload.
     */
    if (!state || state.sessionID !== sessionID) {
      navigate(BASE_ROUTE);
    }
  }, [state, sessionID]);

  if (!state || !state.config) {
    return null;
  }

  return (
    <div className="flex justify-center h-dvh w-dvw">
      <RealtimeToast />
      <div className="flex flex-1 max-w-[1344px] p-4">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="mt-10 flex justify-start">
            <a href="https://outspeed.com">
              <img src="/outspeed.svg" className="h-10" />
            </a>
          </div>
          <Outlet
            context={
              {
                config: state.config,
                onDisconnect: handleDisconnect,
              } satisfies TRealtimeAppContext
            }
          />
        </div>
      </div>
    </div>
  );
}
