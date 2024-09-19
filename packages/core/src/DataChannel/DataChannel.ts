/**
 * Abstract class representing a data channel.
 *
 * @template T - The type of data transmitted over the channel.
 */
export abstract class DataChannel<T> {
  /**
   * The underlying data channel object.
   */
  dataChannel: T;

  constructor(dataChannel: T) {
    this.dataChannel = dataChannel;
  }
  /**
   * Adds an event listener to the data channel.
   *
   * @param {("message" | "close" | "open")} type - The type of event to listen for.
   * @param {EventListener} listener - The callback function to invoke when the event occurs.
   */
  abstract addEventListener(
    type: "message" | "close" | "open",
    listener: EventListener
  ): void;

  /**
   * Removes an event listener from the data channel.
   *
   * @param {("message" | "close" | "open")} type - The type of event to stop listening for.
   * @param {EventListener} listener - The callback function to remove.
   */
  abstract removeEventListener(
    type: "message" | "close" | "open",
    listener: EventListener
  ): void;

  /**
   * Sends the data over the data channel.
   *
   * @param data - The data to send over the data channel
   */
  abstract send(obj: unknown): void;
}
