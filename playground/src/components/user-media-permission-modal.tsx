import { AudioLinesIcon, Video } from "lucide-react";

export function UserMediaPermissionModal() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="flex justify-start space-x-2 mb-4">
          <AudioLinesIcon />
          <Video />
        </div>

        <h2 className="text-2xl font-bold text-gray-50 mb-4">
          Allow Camera and Microphone Access
        </h2>

        <p className="text-gray-300 mb-6">
          To continue, please allow access to your camera and microphone when
          prompted by your browser. Our examples needs access to your camera and
          microphone.
        </p>
        <ul className="list-disc ml-6 space-y-3">
          <li>
            <span className="font-semibold">Camera Access</span>: We need this
            to capture and stream your video when required for video examples.
          </li>
          <li>
            <span className="font-semibold">Microphone Access</span>: This is
            needed to capture and stream your audio.
          </li>
        </ul>

        <p className="text-gray-500 text-sm mt-8">
          If you don't see the popup, check your browser's address bar for the
          permission request.
        </p>
      </div>
    </div>
  );
}
