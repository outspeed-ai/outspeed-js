import {
  setup,
  assign,
  fromPromise,
  MachineSnapshot,
  StateValue,
} from "xstate";
import { RealtimeConnection } from "../RealtimeConnection/RealtimeConnection";
import { TRealtimeConfig, TResponse } from "../shared/@types";

export type TRealtimeConnectionMachinePossibleState = {
  Init: StateValue;
  SetupCompleted: StateValue;
  Connecting: StateValue;
  Connected: StateValue;
  Disconnecting: StateValue;
  Disconnected: StateValue;
  Failed: StateValue;
  End: StateValue;
};

export type TRealtimeConnectionMachineEvents =
  | { type: "SETUP_CONNECTION"; payload: { config: TRealtimeConfig } }
  | { type: "CONNECT" }
  | { type: "CONNECTED" }
  | { type: "FAILED" }
  | { type: "DISCONNECT" }
  | { type: "DISCONNECTED" }
  | { type: "RESET" }
  | { type: "END" };

export type TRealtimeConnectionMachineContext = {
  connection: RealtimeConnection | null;
  connectionResponse: TResponse;
};

export type TRealtimeConnectionMachineActor = MachineSnapshot<
  TRealtimeConnectionMachineContext,
  TRealtimeConnectionMachineEvents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  "",
  unknown,
  Record<string, unknown>,
  Record<string, undefined>
>;

export type TRealtimeConnectionMachineSendFn = (
  event: TRealtimeConnectionMachineEvents
) => void;

export const realtimeConnectionMachine = setup({
  types: {} as {
    events: TRealtimeConnectionMachineEvents;
    states: TRealtimeConnectionMachinePossibleState;
    context: TRealtimeConnectionMachineContext;
  },
  actions: {
    storeConnectionReponse: assign({
      connectionResponse: ({ event }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = event as any;
        if (typeof response === "object" && response) {
          return response.output || response.error;
        }

        return { error: "Unknown error." };
      },
    }),
  },
  actors: {
    connect: fromPromise(
      async ({ input }: { input: TRealtimeConnectionMachineContext }) => {
        const { connection } = input;

        if (!connection) {
          throw new Error(
            "Connect is called without creating an instance of RealtimeConnection"
          );
        }
        const response = await connection.connect();

        if (response.ok) {
          return response;
        }

        if (response) {
          throw response;
        }

        throw new Error("Unable to connect");
      }
    ),
    disconnect: fromPromise(
      async ({ input }: { input: TRealtimeConnectionMachineContext }) => {
        const { connection } = input;

        if (!connection) {
          throw new Error(
            "Cannot disconnect if the RealtimeConnection instance is already undefined or null"
          );
        }
        const response = connection.disconnect();

        if (response.ok) {
          return response;
        }

        throw new Error("Unable to disconnect");
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEl9cAXAYgGUBRAFQFUAFAfQGEB5AOT4MuTMvwDaABgC6iUAAcA9rGq4F+WSAAeiAIwA2CSQCcJowHYAHDrNmATLYkBmCwBoQAT0QWLJPX7MSEkaOAKyBFiEALAC+0W5oWHiEpFxqhJhUBFA0vAJCTAwAIpIySCCKyplqGtoIIQ4kOraRRnomOpG2ZpEhbp4IFrYktmFOTo6Oeo5dFrHxGDgExCSp+OmZ+NkAYgCCZAAyRSUaFSrVZbX1hk0tbUYdXT19up0kgYFGEe1GLY5zIAlFskVmkwBlIDRCmQ6LlBMIyHwAOLHMqnKrqC5eCbDKxdCR2IwSWx6MzPAZDEaBRzjSbTSz-QFJZaFXCwTCgjJZSHQ2H5I7SE5KM4Y0C1HQ6KwkEI6EJ6EJmcU2WwWPRkwbDUbUia0maxOIgfAKCBwDSMpZEQWVVQirSIAC0qo89r0DIWTNIFGoluFNUQnTVRkafj0KpatmpZhCf31ZuBq3WWW96N9CGcOhIX1CtmCEkikQkvSdA0D+j8oaM4fxstdiXNILWYKokCT1pTIb0w061hsOip3jVQ0jgTzNimE0jNaBzNZ7IbnM2LfOot0RMHjjzHTz+KVA5IQ9zkVH2qsk-dJBZbI5TYgi5tYsmkRIjkJJNzIWCecd-Ulo3e4sJxKRDop51ls6C4AANs2qJCsmmIICSPjKjcXT6CEIQRGSHTppSEi9noOiOJYeZ6tEQA */
  context: {
    connection: null,
    connectionResponse: {},
  },
  initial: "Init",
  states: {
    Init: {
      on: {
        SETUP_CONNECTION: {
          guard: ({ event }) => {
            if (!event.payload || !event.payload.config) {
              return false;
            }
            return true;
          },
          actions: assign(({ event }) => ({
            connection: new RealtimeConnection(event.payload.config),
          })),
          target: "SetupCompleted",
          description:
            "Configurations will be passed as a payload. If there is no configuration then the machine will not transition to the next step. Once, the machine has the configuration it will create an instance of RealtimeConnection and saved it in context.",
        },
      },
    },
    SetupCompleted: {
      on: {
        CONNECT: {
          target: "Connecting",
        },
      },

      description:
        "Once we are in setup completed, we can add event listeners to the instance on RealtimeConnection.",
    },
    Connecting: {
      invoke: {
        id: "create-connection",
        src: "connect",
        input: ({ context }) => context,
        onDone: {
          target: "Connected",
          actions: "storeConnectionReponse",
        },
        onError: {
          target: "Failed",
          actions: "storeConnectionReponse",
        },
      },
      description: "The machine is connecting to the backend.",
    },
    Failed: {
      on: {
        END: {
          target: "End",
        },
        RESET: {
          target: "Init",
        },
      },
      description: "The machine failed to setup.",
    },
    Connected: {
      on: {
        DISCONNECT: {
          target: "Disconnecting",
        },
      },
      description: "Machine is connected to the backend.",
    },
    Disconnecting: {
      invoke: {
        id: "disconnect-connection",
        src: "disconnect",
        input: ({ context }) => context,
        onDone: {
          target: "Disconnected",
        },
        onError: {
          target: "Failed",
        },
      },
      description: "Machine is trying to disconnect from the backend.",
    },
    Disconnected: {
      on: {
        END: {
          target: "End",
        },
        RESET: {
          target: "Init",
        },
      },
      description: "The machine is disconnected.",
    },
    End: {
      type: "final",
    },
  },
});
