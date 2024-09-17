/**
 * A class to process session description protocol string.
 *
 * @example
 * const sdp = new SDP()
 * let filteredSDPString = sdp.filter(sdpString, "video", "H264")
 * filteredSDPString = sdp.filter(filteredSDPString, "audio", "PCMU/8000")
 * console.log(filteredSDPString)
 */

export class SDP {
  /**
   * Filters the SDP string to include only specified media kind and codec.
   * @param sdp The SDP string to be filtered.
   * @param kind The media kind to filter ('audio' or 'video').
   * @param codec The codec to filter by (e.g., 'H264', 'PCMU/8000').
   * @returns The filtered SDP string.
   * @example
   * const sdpString = "v=0\no=...\nm=audio 9 RTP/AVP 0 8 97\na=rtpmap:97 opus/48000/2\n...";
   * const filteredSDP = sdp.filter(sdpString, "audio", "opus/48000/2");
   * console.log(filteredSDP); // Outputs SDP with only 'opus' codec for audio.
   */
  static filter(sdp: string, kind: "audio" | "video", codec: string) {
    // Split the SDP string into individual lines for processing.
    const lines = sdp.split("\n");
    // Determine the codec payload types that are allowed.
    const allowed = SDP.getAllowedCodecs(lines, kind, codec);
    // Filter the SDP lines based on the allowed codecs.
    return SDP.filterSdp(lines, allowed, kind);
  }

  /**
   * Escapes all RegExp special characters in a string to avoid issues in regex operations.
   * @param string The string to escape.
   * @returns The escaped string.
   */
  static escapeRegExp(string: string): string {
    // Replace each special character with its escaped version.
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Identifies the allowed payload types for the specified codec within the SDP.
   * @param lines The SDP lines.
   * @param kind The media kind ('audio' or 'video').
   * @param codec The codec to filter by.
   * @returns An array of numbers representing the allowed payload types.
   */
  static getAllowedCodecs(
    lines: string[],
    kind: string,
    codec: string
  ): number[] {
    // Regex to find RTX format lines.
    const rtxRegex = /a=fmtp:(\d+) apt=(\d+)\r$/;
    // Regex to find lines that specify the codec.
    const codecRegex = new RegExp(
      `a=rtpmap:([0-9]+) ${SDP.escapeRegExp(codec)}`
    );
    const allowed: number[] = [];
    let isKind = false;

    for (const line of lines) {
      if (line.startsWith(`m=${kind} `)) {
        isKind = true;
      } else if (line.startsWith("m=")) {
        isKind = false;
      }

      if (isKind) {
        let match = line.match(codecRegex);
        if (match) {
          allowed.push(parseInt(match[1]));
        }

        match = line.match(rtxRegex);
        if (match && allowed.includes(parseInt(match[2]))) {
          allowed.push(parseInt(match[1]));
        }
      }
    }

    return allowed;
  }

  /**
   * Filters the SDP lines based on allowed payload types for the specified media kind.
   * @param lines The SDP lines.
   * @param allowed An array of allowed payload types.
   * @param kind The media kind ('audio' or 'video').
   * @returns The filtered SDP string.
   */
  static filterSdp(lines: string[], allowed: number[], kind: string): string {
    // Regex to identify lines that should be skipped if not allowed.
    const skipRegex = /a=(fmtp|rtcp-fb|rtpmap):([0-9]+)/;
    // Regex to modify the media descriptor line to only include allowed codecs.
    const videoRegex = new RegExp(`(m=${kind} .*?)( ([0-9]+))*\\s*$`);
    let sdp = "";
    let isKind = false;

    for (const line of lines) {
      if (line.startsWith(`m=${kind} `)) {
        isKind = true;
      } else if (line.startsWith("m=")) {
        isKind = false;
      }

      if (isKind) {
        const skipMatch = line.match(skipRegex);
        if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
          continue;
        } else if (line.match(videoRegex)) {
          sdp += line.replace(videoRegex, `$1 ${allowed.join(" ")}`) + "\n";
        } else {
          sdp += line + "\n";
        }
      } else {
        sdp += line + "\n";
      }
    }

    return sdp;
  }
}
