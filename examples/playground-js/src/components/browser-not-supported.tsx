export function BrowserNotSupported() {

  return (
    <div className="flex justify-center h-dvh w-dvw">
      <div className="flex flex-1 max-w-[1344px] p-4">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="mt-10">
            <a href="https://outspeed.com">
                <img src="/outspeed.svg" className="h-10" />
            </a>
          </div>
          <div className="h-full flex flex-1 justify-center items-center">
            <div className="flex items-center space-y-4 flex-col">
              <h2 className="text-3xl font-light">
                This application only supports Chrome and Safari.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
