import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { BASE_ROUTE } from "../constants/routes";
import React from "react";
import { TAppRouteLocationState } from "../landing/type";
import { TLoaderData } from "../types";

export function ThankYouScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TAppRouteLocationState;
  const { sessionID } = useLoaderData() as TLoaderData;

  React.useEffect(() => {
    /**
     * If session is not equal to state.sessionID, meaning user has reloaded the
     * page, hence redirecting the user to the homepage.
     */
    if (!state || state.sessionID !== sessionID) {
      navigate(state?.formURL || BASE_ROUTE);
    }
  }, []);

  return (
    <div className="flex justify-center h-dvh w-dvw">
      <div className="flex flex-1 max-w-[1344px] p-4">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="mt-10">
            <img src="/outspeed.svg" className="h-10" />
          </div>
          <div className="h-full flex flex-1 justify-center items-center">
            <div className="flex items-center space-y-4 flex-col">
              <h2 className="text-3xl font-light">
                Thanks for trying the example.
              </h2>
              <Button
                className="inline-flex"
                onClick={() => navigate(state?.formURL || BASE_ROUTE)}
              >
                Go to homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
