export type TRealtimeConnectionStatusProps = {
  connectionStatus: string;
};

export function RealtimeConnectionStatus(
  props: TRealtimeConnectionStatusProps
) {
  const { connectionStatus } = props;

  const status = connectionStatus.toLowerCase();

  return (
    <>
      {status === "connecting" && (
        <div className="flex items-center ml-2 border px-2 rounded-[4px] overflow-hidden text-yellow-900">
          <div className="h-2 w-2 rounded-full bg-yellow-300 mr-2 animate-ping"></div>
          <span>{status}</span>
        </div>
      )}
      {status === "connected" && (
        <div className="flex items-center ml-2 border px-2 rounded-[4px] overflow-hidden text-green-800">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
          <span>{status}</span>
        </div>
      )}
      {status === "failed" && (
        <div className="flex items-center ml-2 border px-2 rounded-[4px] overflow-hidden text-red-800">
          <div className="h-2 w-2 rounded-full bg-red-400 mr-2"></div>
          <span>{status}</span>
        </div>
      )}
      {status === "disconnected" && (
        <div className="flex items-center ml-2 border px-2 rounded-[4px] overflow-hidden text-red-800">
          <div className="h-2 w-2 rounded-full bg-red-400 mr-2"></div>
          <span>{status}</span>
        </div>
      )}
    </>
  );
}
