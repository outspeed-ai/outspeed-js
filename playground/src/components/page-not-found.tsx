import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import { BASE_ROUTE } from "../constants/routes";

export function PageNotFound() {
  const navigate = useNavigate();
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
              <h2 className="text-3xl font-light">Page not found.</h2>
              <Button
                className="inline-flex"
                onClick={() => navigate(BASE_ROUTE)}
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
