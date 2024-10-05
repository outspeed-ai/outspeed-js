import { Base64Converter } from './utils'

export class SpeechHandler {
  private talkingHead: any;
  private audioCtx: AudioContext;
  private audioSpeechSource: AudioBufferSourceNode;
  private audioBackgroundSource: AudioBufferSourceNode;
  private audioSpeechGainNode: GainNode;
  private audioBackgroundGainNode: GainNode;
  private audioReverbNode: ConvolverNode;
  private isAudioPlaying: boolean;
  private audioPlaylist: any[];
  private speechQueue: any[];
  private b64Converter: Base64Converter;

  constructor(talkingHead: any) {
    this.talkingHead = talkingHead;
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.audioSpeechSource = this.audioCtx.createBufferSource();
    this.audioBackgroundSource = this.audioCtx.createBufferSource();
    this.audioSpeechGainNode = this.audioCtx.createGain();
    this.audioBackgroundGainNode = this.audioCtx.createGain();
    this.audioReverbNode = this.audioCtx.createConvolver();
    this.setReverb(null); // Set dry impulse as default
    
    this.audioBackgroundGainNode.connect(this.audioReverbNode);
    this.audioSpeechGainNode.connect(this.audioReverbNode);
    this.audioReverbNode.connect(this.audioCtx.destination);
    
    this.isAudioPlaying = false;
    this.audioPlaylist = [];
    this.speechQueue = [];

    // Create a lookup table for base64 decoding
    this.b64Converter = new Base64Converter();
    
    this.setReverb(null); // Set dry impulse as default
    this.setMixerGain(this.talkingHead.opt.mixerGainSpeech, this.talkingHead.opt.mixerGainBackground); // Volume

  }

  /**
   * Adds a new line to the speech queue.
   * @param {object} line - The line object to be added to the speech queue.
   */
  push(line: object) {
    console.log("Called speechHandler.push with line : ", line)
    this.speechQueue.push(line);
  }

  /**
   * Resumes the audio context.
   * This method is used to resume audio playback after it has been suspended.
   */
  resume() {
    this.audioCtx.resume()
  }

  /**
   * Suspends the audio context.
   * This method is used to pause audio playback and reduce CPU/battery usage.
   */
  suspend() {
    this.audioCtx.suspend()
  }

  /**
   * Starts the speaking process.
   * This method initiates the speaking process by calling startSpeaking().
   * If an error occurs during the process, it will be caught and logged.
   */
  start() {
    try {
      this.startSpeaking();
    } catch (error) {
      console.error('Error in start', error);
    }
  }

  /**
   * Pauses the current speech playback.
   * This method stops the current audio source, clears the audio playlist,
   * and sets the audio playing flag to false.
   */
  pause() {
    try { this.audioSpeechSource.stop(); } catch(error) {}
    this.audioPlaylist.length = 0;
    this.isAudioPlaying = false;
  }

  /**
   * Stops all speech playback and clears all queues.
   * This method stops the current audio source, clears both the audio playlist
   * and the speech queue, and sets the audio playing flag to false.
   */
  stop() {
    try { this.audioSpeechSource.stop(); } catch(error) {}
    this.isAudioPlaying = false;
    this.audioPlaylist.length = 0;
    this.speechQueue.length = 0;
  }

  /**
  * Set slowdown.
  * @param {number} rate Slowdown factor.
  */
  setSlowdownRate(rate: number): void {
    this.audioSpeechSource.playbackRate.value = 1 / rate;
    this.audioBackgroundSource.playbackRate.value = 1 / rate;
  }

  /**
  * Setup the convolver node based on an impulse.
  * @param {string} [url=null] URL for the impulse, dry impulse if null
  */
  async setReverb( url=null ) {
    if ( url ) {
      // load impulse response from file
      let response = await fetch(url);
      let arraybuffer = await response.arrayBuffer();
      this.audioReverbNode.buffer = await this.audioCtx.decodeAudioData(arraybuffer);
    } else {
      // dry impulse
      const samplerate = this.audioCtx.sampleRate;
      const impulse = this.audioCtx.createBuffer(2, samplerate, samplerate);
      impulse.getChannelData(0)[0] = 1;
      impulse.getChannelData(1)[0] = 1;
      this.audioReverbNode.buffer = impulse;
    }
  }

  /**
  * Set audio gain.
  * @param {number | null} speech Gain for speech, if null do not change
  * @param {number | null} background Gain for background audio, if null do not change
  */
  setMixerGain(speech: number | null, background: number | null): void {
    if (speech !== null) {
      this.audioSpeechGainNode.gain.value = speech || 0;
    }
    if (background !== null) {
      this.audioBackgroundGainNode.gain.value = background || 0;
    }
  }

    /**
  * Take the next queue item from the speech queue, convert it to text, and
  * load the audio file.
  * @param {boolean} [force=false] If true, forces to proceed (e.g. after break)
  */
  async startSpeaking(force = false ) {
    if ( !this.talkingHead.armature || (this.talkingHead.isSpeaking && !force) ) return;
    this.talkingHead.stateName = 'talking';
    this.talkingHead.isSpeaking = true;

    // wait for a message otherwise do the idle thing
    if ( this.speechQueue.length ) {
      let line = this.speechQueue.shift();
      if ( line.emoji ) {

        // Look at the camera
        this.talkingHead.lookAtCamera(500);

        // Only emoji
        let duration = line.emoji.dt.reduce((a: number, b: number): number => a + b, 0);
        this.talkingHead.animQueue.push( this.talkingHead.animFactory( line.emoji ) );
        setTimeout( this.startSpeaking.bind(this), duration, true );
      } else if ( line.break ) {
        console.log("in break!")
        // Break
        setTimeout( this.startSpeaking.bind(this), line.break, true );
      } else if ( line.audio ) {
        console.log("in line.audio!")

        // Look at the camera
        this.talkingHead.lookAtCamera(500);
        this.talkingHead.speakWithHands();

        // Make a playlist
        this.audioPlaylist.push({ anim: line.anim, audio: line.audio });
        this.talkingHead.onSubtitles = line.onSubtitles || null;
        this.talkingHead.resetLips();
        if ( line.mood ) this.talkingHead.setMood( line.mood );
        this.playAudio();

      } else if ( line.text ) {
        // Look at the camera
        console.log("in line.text!")
        this.talkingHead.lookAtCamera(500);

        // Spoken text
        try {
          const data = line.data

          if ( data && data.audioContent ) {

            // Audio data
            const buf = this.b64Converter.b64ToArrayBuffer(data.audioContent);
            const audio = await this.audioCtx.decodeAudioData( buf );
            this.talkingHead.speakWithHands();

            // Workaround for Google TTS not providing all timepoints
            const times = [ 0 ];
            let markIndex = 0;
            line.text.forEach( (x: any, i: number) => {
              if ( i > 0 ) {
                let ms = times[ times.length - 1 ];
                if ( data.timepoints[markIndex] ) {
                  ms = data.timepoints[markIndex].timeSeconds * 1000;
                  if ( data.timepoints[markIndex].markName === ""+x.mark ) {
                    markIndex++;
                  }
                }
                times.push( ms );
              }
            });

            // Word-to-audio alignment
            const timepoints = [ { mark: 0, time: 0, duration: 0 } ];
            times.forEach( (x,i) => {
              if ( i>0 ) {
                let prevDuration = x - times[i-1];
                if ( prevDuration > 150 ) prevDuration - 150; // Trim out leading space
                timepoints[i-1].duration = prevDuration;
                timepoints.push( { mark: i, time: x, duration: 0 });
              }
            });
            let d = 1000 * audio.duration; // Duration in ms
            if ( d > this.talkingHead.opt.ttsTrimEnd ) d = d - this.talkingHead.opt.ttsTrimEnd; // Trim out silence at the end
            timepoints[timepoints.length-1].duration = d - timepoints[timepoints.length-1].time;

            // Re-set animation starting times and rescale durations
            line.anim.forEach( (x: any) => {
              const timepoint = timepoints[x.mark];
              if ( timepoint ) {
                for(let i=0; i<x.ts.length; i++) {
                  x.ts[i] = timepoint.time + (x.ts[i] * timepoint.duration) + this.talkingHead.opt.ttsTrimStart;
                }
              }
            });

            // Add to the playlist
            this.audioPlaylist.push({ anim: line.anim, audio: audio });
            this.talkingHead.onSubtitles = line.onSubtitles || null;
            this.talkingHead.resetLips();
            if ( line.mood ) this.talkingHead.setMood( line.mood );
            this.playAudio();

          } else {
            this.startSpeaking(true);
          }
        } catch (error) {
          console.error("Error:", error);
          this.startSpeaking(true);
        }
      } else if ( line.anim ) {
        // Only subtitles
        this.talkingHead.onSubtitles = line.onSubtitles || null;
        this.talkingHead.resetLips();
        if ( line.mood ) this.talkingHead.setMood( line.mood );
        line.anim.forEach((x: any, i: number) => {
          for (let j = 0; j < x.ts.length; j++) {
            x.ts[j] = this.talkingHead.animClock + 10 * i;
          }
          this.talkingHead.animQueue.push(x);
        });
        setTimeout( this.startSpeaking.bind(this), 10 * line.anim.length, true );
      } else if ( line.marker ) {
        if ( typeof line.marker === "function" ) {
          line.marker();
        }
        this.startSpeaking(true);
      } else {
        this.startSpeaking(true);
      }
    } else {
      this.talkingHead.stateName = 'idle';
      this.talkingHead.isSpeaking = false;
    }
  }

  /**
  * Play audio playlist using Web Audio API.
  * @param {boolean} [force=false] If true, forces to proceed
  */
  async playAudio(force=false) {
    console.log(`playAudio function called at ${new Date().toISOString()}`);
    if ( !this.talkingHead.armature || (this.isAudioPlaying && !force) ) return;
    this.isAudioPlaying = true;
    if ( this.audioPlaylist.length ) {
      const item = this.audioPlaylist.shift();

      // If Web Audio API is suspended, try to resume it
      if ( this.audioCtx.state === "suspended" || this.audioCtx.state === "closed" ) {
        const resume = this.audioCtx.resume();
        const timeout = new Promise((_r, rej) => setTimeout(() => rej("p2"), 1000));
        try {
          await Promise.race([resume, timeout]);
        } catch(e) {
          console.log("Can't play audio. Web Audio API suspended. This is often due to calling some speak method before the first user action, which is typically prevented by the browser.");
          this.playAudio(true);
          return;
        }
      }

      // AudioBuffer
      let audio;
      if ( Array.isArray(item.audio) ) {
        // Convert from PCM samples
        let buf = this.concatArrayBuffers( item.audio );
        audio = this.pcmToAudioBuffer(buf);
      } else {
        audio = item.audio;
      }

      // Create audio source
      this.audioSpeechSource = this.audioCtx.createBufferSource();
      this.audioSpeechSource.buffer = audio;
      this.audioSpeechSource.playbackRate.value = 1 / this.talkingHead.animSlowdownRate;
      this.audioSpeechSource.connect(this.audioSpeechGainNode);
      this.audioSpeechSource.addEventListener('ended', () => {
        this.audioSpeechSource.disconnect();
        this.playAudio(true);
      }, { once: true });

      // Rescale lipsync and push to queue
      const delay = 100;
      if ( item.anim ) {
        item.anim.forEach( (x: any) => {
          for(let i=0; i<x.ts.length; i++) {
            x.ts[i] = this.talkingHead.animClock + x.ts[i] + delay;
          }
          this.talkingHead.animQueue.push(x);
        });
      }

      // Play
      this.audioSpeechSource.start(delay/1000);

    } else {
      this.isAudioPlaying = false;
      this.startSpeaking(true);
    }
  }

  /**
  * Concatenate an array of ArrayBuffers.
  * @param {ArrayBuffer[]} bufs Array of ArrayBuffers
  * @return {ArrayBuffer} Concatenated ArrayBuffer
  */
  concatArrayBuffers(bufs: ArrayBuffer[]): ArrayBuffer {
    let len = 0;
    for( let i=0; i<bufs.length; i++ ) {
      len += bufs[i].byteLength;
    }
    let buf = new ArrayBuffer(len);
    let arr = new Uint8Array(buf);
    let p = 0;
    for( let i=0; i<bufs.length; i++ ) {
      arr.set( new Uint8Array(bufs[i]), p);
      p += bufs[i].byteLength;
    }
    return buf;
  }
  /**
  * Convert PCM buffer to AudioBuffer.
  * NOTE: Only signed 16bit little endian supported.
  * @param {ArrayBuffer} buf PCM buffer
  * @return {AudioBuffer} AudioBuffer
  */
  pcmToAudioBuffer(buf: ArrayBuffer): AudioBuffer {
    const arr: Int16Array = new Int16Array(buf);
    const floats: Float32Array = new Float32Array(arr.length);
    for( let i=0; i<arr.length; i++ ) {
      floats[i] = (arr[i] >= 0x8000) ? -(0x10000 - arr[i]) / 0x8000 : arr[i] / 0x7FFF;
    }
    const audio = this.audioCtx.createBuffer(1, floats.length, this.talkingHead.opt.pcmSampleRate );
    audio.copyToChannel( floats, 0 , 0 );
    return audio;
  }
}