import React from "react";

function getFormattedTime(now: Date) {
  return now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function Clock() {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getFormattedTime(new Date()));
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return <span>{time}</span>;
}

export default Clock;
