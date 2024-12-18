export function UserMediaPermissionFailed() {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Permission Denied!</strong>
      <p className="mt-2">
        It looks like you denied access to your camera or microphone.
      </p>
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

      <p className="mt-4 mb-2">To reset the permission on:</p>
      <ul className="list-disc ml-6 mt-2">
        <li>
          <span className="font-semibold">Chrome</span> follow the instructions{" "}
          <a
            href="https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DDesktop"
            target="_blank"
            className="text-blue-800 underline"
          >
            available here
          </a>
          .
        </li>

        <li>
          <span className="font-semibold">iPhone/iPad (iOS)</span> Go to
          Settings. Scroll down and find Safari. Tap on Camera or Microphone.
          Change the setting to either Ask or Allow.
        </li>
        <li>
          <span className="font-semibold">MacOS Safari</span> Click Safari in
          the menu bar and select Settings (or Preferences on older versions).
          Go to the Websites tab. In the left-hand panel, find Camera and
          Microphone. Locate this Outspeed's playground URL and set the
          permission to Allow or Ask. If it's already set to Ask, try refreshing
          the page.
        </li>
      </ul>
    </div>
  );
}
