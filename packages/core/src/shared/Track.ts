export enum ETrackKind {
  Audio = "audio",
  Video = "video",
}

export enum ETrackOrigin {
  Remote = "remote",
  Local = "local",
}

/**
 * Class representing a media track.
 */
export class Track {
  /**
   * Unique identifier for the track.
   */
  id: string;

  /**
   * The underlying media stream.
   */
  stream: MediaStream;

  /**
   * Origin of the track.
   */
  origin: ETrackOrigin;

  /**
   * Track kind
   */
  kind: ETrackKind;

  /**
   * The underlying MediaStreamTrack object.
   */
  track: MediaStreamTrack;

  constructor(track: MediaStreamTrack, origin: ETrackOrigin) {
    this.id = track.id;
    this.stream = new MediaStream([track]);
    this.origin = origin;
    this.track = track;
    switch (track.kind) {
      case "audio":
        this.kind = ETrackKind.Audio;
        break;
      case "video":
        this.kind = ETrackKind.Video;
        break;
      default:
        throw new Error("Unknown track kind");
    }
  }

  /**
   * Pauses the media track.
   */
  pause() {
    this.track.enabled = false;
  }

  /**
   * Resumes the media track.
   */
  resume() {
    this.track.enabled = true;
  }

  isMute() {
    return this.track.enabled === false;
  }
}
