import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { Track } from "@outspeed/core";

export type RealtimeAudioVisualizerProps = {
  track: Track | null;
};

export function RealtimeAudioVisualizer(props: RealtimeAudioVisualizerProps) {
  const { track } = props;
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  const audioMotionRef = useRef<AudioMotionAnalyzer | null>(null);

  useEffect(() => {
    if (audioMotionRef.current == null) {
      audioMotionRef.current = new AudioMotionAnalyzer(
        audioVisualizerRef.current!,
        {
          mode: 5,
          alphaBars: false,
          ansiBands: false,
          barSpace: 1,
          channelLayout: "single",
          colorMode: "bar-level",
          frequencyScale: "bark",
          gradient: "prism",
          ledBars: false,
          linearAmplitude: true,
          linearBoost: 1.5,
          lumiBars: false,
          maxFreq: 16000,
          minFreq: 30,
          radial: false,
          reflexRatio: 0.5,
          reflexAlpha: 1,
          roundBars: true,
          showPeaks: false,
          showScaleX: false,
          smoothing: 0.7,
          weightingFilter: "D",
          overlay: true,
          bgAlpha: 0,
          minDecibels: -50,
          outlineBars: true,
        }
      );
    }

    if (track && audioVisualizerRef.current) {
      const audioStream =
        audioMotionRef.current!.audioCtx.createMediaStreamSource(track.stream);

      audioMotionRef.current!.connectInput(audioStream);
      audioMotionRef.current!.volume = 0;
    }

    audioMotionRef.current!.start();

    return () => {
      audioMotionRef.current!.stop();
    };
  }, [track]);

  return <div className="h-full w-full" ref={audioVisualizerRef}></div>;
}
