import { Link } from "react-router-dom";
import { Button } from "../components/button";

export default function WebRTCScreenShareApp() {
  return (
    <div className="flex flex-1 justify-center items-center flex-col">
      <h1 className="font-extralight text-2xl mb-4">Work in progress.</h1>
      <Link to="/">
        <Button>See all examples</Button>
      </Link>
    </div>
  );
}
