export default `
class RealtimeWebsocketAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioData = [];
    this.index = 0;
    this.isTalking = false;
    this.port.onmessage = this.handleMessage.bind(this);
  }

  /**
   * Handles incoming messages from the main thread.
   * @param {MessageEvent} event - The message event containing audio data.
   */
  async handleMessage(event) {
    if (event.data.type === "arrayBuffer") {
      try {
        const audioData = this.decodeAudio(event.data.buffer);
        this.audioData.push(audioData);
      } catch (error) {
        this.port.postMessage({
          type: "error",
          message: "Audio decoding failed: " + error,
        });
        this.isTalking = false;
        this.port.postMessage("agent_stop_talking");
      }
    }
  }

  /**
   * Decodes the audio data from an ArrayBuffer.
   * @param {ArrayBuffer} b64ArrayBuffer - The raw audio data.
   */
  decodeAudio(b64ArrayBuffer) {
    try {
      const dataArray = new Uint8Array(b64ArrayBuffer);
      const view = new DataView(dataArray.buffer);
      const pcmData = new Float32Array(dataArray.byteLength / 2);
      for (let i = 0; i < pcmData.length; i++) {
        pcmData[i] = view.getInt16(i * 2, true) / Math.pow(2, 16 - 1);
      }
      return pcmData;
    } catch (error) {
      console.error("Error decoding audio:", error);
      throw error;
    }
  }

  process(_, outputs) {
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; ++i) {
        if (this.audioData.length > 0) {
          if (!this.isTalking) {
            this.isTalking = true;
            this.port.postMessage("agent_start_talking");
          }
          outputChannel[i] = this.audioData[0][this.index];
          this.index++;
          if (this.index == this.audioData[0].length) {
            this.audioData.shift();
            this.index = 0;
          }
        } else {
          outputChannel[i] = 0;
          if (this.isTalking) {
            this.isTalking = false;
            this.port.postMessage("agent_stop_talking");
          }
        }
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", RealtimeWebsocketAudioProcessor);
`;
