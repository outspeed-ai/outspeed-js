
export class Base64Converter {
    private b64Lookup: Uint8Array | number[];

    constructor() {
        const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        this.b64Lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
        for (let i = 0; i < b64Chars.length; i++) {
            this.b64Lookup[b64Chars.charCodeAt(i)] = i;
        }
    }

    /**
     * Convert a Base64 MP3 chunk to ArrayBuffer.
     * @param {string} chunk Base64 encoded chunk
     * @return {ArrayBuffer} ArrayBuffer
     */
    public b64ToArrayBuffer(chunk: string): ArrayBuffer {
    // Calculate the needed total buffer length
    let bufLen = 3 * chunk.length / 4;
    if (chunk[chunk.length - 1] === '=') {
        bufLen--;
        if (chunk[chunk.length - 2] === '=') {
        bufLen--;
        }
    }

    // Create the ArrayBuffer
    const arrBuf = new ArrayBuffer(bufLen);
    const arr = new Uint8Array(arrBuf);
    let i, p = 0, c1, c2, c3, c4;

    // Populate the buffer
    for (i = 0; i < chunk.length; i += 4) {
        c1 = this.b64Lookup[chunk.charCodeAt(i)];
        c2 = this.b64Lookup[chunk.charCodeAt(i+1)];
        c3 = this.b64Lookup[chunk.charCodeAt(i+2)];
        c4 = this.b64Lookup[chunk.charCodeAt(i+3)];
        arr[p++] = (c1 << 2) | (c2 >> 4);
        arr[p++] = ((c2 & 15) << 4) | (c3 >> 2);
        arr[p++] = ((c3 & 3) << 6) | (c4 & 63);
    }

    return arrBuf;
    }
}

  /**
  * Return gaussian distributed random value between start and end with skew.
  * @param {number} start Start value
  * @param {number} end End value
  * @param {number} [skew=1] Skew
  * @param {number} [samples=5] Number of samples, 1 = uniform distribution.
  * @return {number} Gaussian random value.
  */
  export function gaussianRandom(start: number, end: number, skew: number = 1, samples: number = 5): number {
    // IMP: console.log(`gaussianRandom function called at ${new Date().toISOString()}`);
    let r = 0;
    for (let i = 0; i < samples; i++) r += Math.random();
    return start + Math.pow(r / samples, skew) * (end - start);
  }

  /**
  * Create a sigmoid function.
  * @param {number} k Sharpness of ease.
  * @return {function} Sigmoid function.
  */
  export function sigmoidFactory(k: number): (t: number) => number {
    // IMP: console.log(`sigmoidFactory function called at ${new Date().toISOString()}`);
    function base(t: number): number { return (1 / (1 + Math.exp(-k * t))) - 0.5; }
    const corr: number = 0.5 / base(1);
    return function (t: number): number { return corr * base(2 * Math.max(Math.min(t, 1), 0) - 1) + 0.5; };
  }

  /**
  * Convert value from one range to another.
  * @param {number} value Value
  * @param {number[]} r1 Source range
  * @param {number[]} r2 Target range
  * @return {number} Scaled value
  */
  export function convertRange(value: number, r1: number[], r2: number[]): number {
    console.log(`convertRange function called at ${new Date().toISOString()}`);
    return (value-r1[0]) * (r2[1]-r2[0]) / (r1[1]-r1[0]) + r2[0];
  }