import { Button } from "./components/button";

export type TThankYouScreenProps = {
  onClick: () => void;
};
export function ThankYouScreen(props: TThankYouScreenProps) {
  const { onClick } = props;

  return (
    <div className="flex justify-center h-screen w-screen">
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
              <Button className="inline-flex" onClick={onClick}>
                Go to homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
