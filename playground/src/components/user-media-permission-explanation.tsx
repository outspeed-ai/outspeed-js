import { Button } from "./button";

export type TUserMediaPermissionExplanationProps = {
  handlePermission: () => void;
};

export function UserMediaPermissionExplanation(
  props: TUserMediaPermissionExplanationProps
) {
  const { handlePermission } = props;

  return (
    <div className="leading-relaxed">
      <h4 className="mb-4 text-2xl font-bold">
        We Need Your Camera and Microphone Access
      </h4>

      <p className="mb-2">
        Our examples needs access to your camera and microphone.
      </p>
      <ul className="list-disc ml-6 space-y-3">
        <li>
          <span className="font-semibold">Camera Access</span>: We need this to
          capture and stream your video when required for video examples.
        </li>
        <li>
          <span className="font-semibold">Microphone Access</span>: This is
          needed to capture and stream your audio.
        </li>
      </ul>

      <div className="mt-6">
        <Button onClick={handlePermission}>Grant Access</Button>
      </div>
    </div>
  );
}
