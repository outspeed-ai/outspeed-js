<p align="center">
  <a href="https://outspeed.com" target="_blank">
    <picture>
      <source srcset="./assets/logo-white.webp" media="(prefers-color-scheme: dark)" />
      <source srcset="./assets/logo-black.webp" media="(prefers-color-scheme: light)" />
      <img src="./assets/logo.jpg" alt="Sentry" width="280">
    </picture>
  </a>
</p>

The `outspeed-js` library provides a simple API that facilitates easy connection to the `outspeed` backend, enabling streaming of local audio, video, and screen content. This is a monorepo containing all packages related to web and JavaScript.

# Documentation

You can read the [docs](http://docs.outspeed.com/) to learn more about the SDK.

# Installation

To install `outspeed-js` in your existing React application, run the following command:

```bash
npm i @outspeed/core @outspeed/react

# or
yarn add @outspeed/core @outspeed/react

# or
pnpm i @outspeed/core @outspeed/react
```

This will add `@outspeed/core` and `@outspeed/react` to your project's dependencies.

# Usage

We assume you've already deployed your backend using [`outspeed`](https://github.com/outspeed-ai/outspeed) and have a function URL available. If not, please follow the instructions provided [here](https://github.com/outspeed-ai/outspeed). Additionally, the backend should be using `WebRTC`.

To establish a connection, you can use the `useWebRTC` hook as shown below:

```tsx
import React from "react";
import { useWebRTC, RealtimeVideo } from "@outspeed/react";

export default function App() {
  const { connect, connectionStatus, getRemoteVideoTrack, getLocalVideoTrack } =
    useWebRTC({
      config: {
        functionURL: "<my-function-url>", // Add your function URL.
        audio: true,
        video: true,
      },
    });

  return (
    <div>
      <span>Connection Status: {connectionStatus}</span>

      {connectionStatus === "SetupCompleted" && (
        <button onClick={connect}>Connect</button>
      )}

      {/* To show remote video stream */}
      <RealtimeVideo track={getRemoteVideoTrack()} />

      {/* To show local video stream */}
      <RealtimeVideo track={getLocalVideoTrack()} />
    </div>
  );
}
```

The code establishes a peer connection with the backend and streams local audio and video to it. If the backend is configured to return the audio and video, they will be displayed as well.

# Development

To get started with development, ensure you have the following tools installed:

- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download/package-manager)
- [pnpm](https://pnpm.io/installation) (This monorepo built with `pnpm workspaces`)

### Getting Started

#### Step 1: Clone the repository

Copy the repo to your local machine.

```bash
git clone https://github.com/outspeed-ai/outspeed-js
```

#### Step 2: Install all the dependencies

Move to `outspeed-js` directory and run the following command.

```bash
pnpm install
```

This will install dependencies for all the packages in the monorepo.

#### Step 3: Run the playground

To run the example playground (a React app) in development mode, run the following command:

```bash
pnpm playground:dev
```

The playground is in `./examples/playground-js`, and any edits you make will be reflected in real-time.

#### Step 4: Run packages in dev mode

Running the packages in dev mode ensures that any changes you make to the packages are automatically rebuilt. The playground will then pick up these latest changes, allowing you to see your updates reflected in real time. Run the following command:

```bash
pnpm dev
```

# Build

To build the packages for production, follow these steps:

#### Build core and react packages:

Run the following command to build both `@outspeed/core` and `@outspeed/react`:

```bash
pnpm build
```

#### Build the playground

To build the playground for production, run:

```bash
pnpm playground:build
```

#### Serve the playground in production mode

```bash
pnpm playground:serve
```

# License

This project is licensed under the Apache License, Version 2.0. You may obtain a copy of the License at [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---

Feel free to explore the source code, contribute, and experiment with the playground. If you’re new to WebRTC or WebSocket, you may find it helpful to refer to additional learning resources like Mozilla’s [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) documentation and [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) specification.

# Publishing

```bash
pnpm publish -r --no-git-checks  --access public
```
