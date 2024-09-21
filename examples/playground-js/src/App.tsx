import "@outspeed/react/styles.css";
import { Landing } from "./Landing";
import React from "react";

export default function App() {
  const [config, setConfig] = React.useState<any>();

  if (!config) {
    return <Landing />;
  }

  return <div>Connected.</div>;
}
