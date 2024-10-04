import "@outspeed/react/styles.css";
import { Landing } from "./Landing";
import React from "react";
import { TRealtimeWebSocketConfig } from "@outspeed/core";
import { TRealtimeConfig } from "@outspeed/core";
import { RealtimeApp } from "./RealtimeApp";
import { ThankYouScreen } from "./ThankYou";
import { isSafari, isChrome } from "react-device-detect";
import { BrowserNotSupported } from "./components/browser-not-supported";


export default function App() {
  const [config, setConfig] = React.useState<
    TRealtimeWebSocketConfig | TRealtimeConfig
  >();
  const [selectedExample, setSelectedExample] = React.useState("webrtc");
  const [showThankYou, setShowThankYou] = React.useState(false);

  const onDisconnect = React.useCallback(() => {
    setConfig(undefined);
    setShowThankYou(true);
  }, []);

  if (!isChrome && !isSafari) {
    return <BrowserNotSupported />;
  }

  if (showThankYou) {
    return (
      <ThankYouScreen
        onClick={() => {
          setShowThankYou(false);
        }}
      />
    );
  }

  if (!config) {
    return (
      <Landing
        selectedExample={selectedExample}
        setSelectedExample={setSelectedExample}
        onSubmit={(_c) => setConfig(_c)}
      />
    );
  }

  return (
    <RealtimeApp
      onDisconnect={onDisconnect}
      selected={selectedExample}
      config={config}
    />
  );
}
