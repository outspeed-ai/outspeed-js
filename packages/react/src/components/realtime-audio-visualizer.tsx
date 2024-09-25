import { Track } from "@outspeed/core";
import React from "react";

export type RealtimeAudioVisualizerProps = {
  track: Track | null;
  threshold?: number;
};

export function RealtimeAudioVisualizer(props: RealtimeAudioVisualizerProps) {
  const { track, threshold = 180 } = props;
  const [analyser, setAnalyser] = React.useState<AnalyserNode>();
  const [dataArray, setDataArray] = React.useState<Uint8Array>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const init = React.useCallback(() => {
    if (!track) return;
    const stream = track.stream;
    const audioCtx = new window.AudioContext();
    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;

    const dataArr = new Uint8Array(analyserNode.frequencyBinCount);
    const audioSource = audioCtx.createMediaStreamSource(stream);
    audioSource.connect(analyserNode);

    setDataArray(dataArr);

    setAnalyser(analyserNode);
  }, [track]);

  const fitCanvasToContainer = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement as HTMLDivElement;

    // Get the device pixel ratio for high-DPI screens (e.g., Retina)
    const dpr = window.devicePixelRatio || 1;

    // Set canvas width and height to match the container size, while accounting for the pixel ratio
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;

    // Set the canvas display size (CSS size)
    canvas.style.width = containerWidth + "px";
    canvas.style.height = containerHeight + "px";
  }, []);

  React.useEffect(() => {
    init();
    fitCanvasToContainer();

    const resizeObserver = new ResizeObserver(fitCanvasToContainer);

    const parentElement = canvasRef.current?.parentElement;

    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    return () => {
      if (resizeObserver && parentElement) {
        resizeObserver.unobserve(parentElement);
      }
    };
  }, [init, fitCanvasToContainer]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const draw = setupDraw(threshold);

    const animate = () => {
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        draw(canvas, ctx, dataArray);
      } else {
        draw(canvas, ctx, null);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [analyser, dataArray, threshold]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}

function lerp(start: number, end: number) {
  return start + (end - start) * 0.1;
}

function setupDraw(threshold: number) {
  const indexes = [5, 8, 10, 14, 16, 18, 20];
  const dpr = window.devicePixelRatio || 1;

  const prevRadius = indexes.map(() => 0);

  return function draw(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array | null
  ) {
    const width = canvas.width;
    const height = canvas.height;

    // Center coordinates
    const x = width / 2;
    const y = height / 2;

    const dim = x > y ? y : x;

    const baseRadius = dim / 2;
    const maxRadiusOffset = baseRadius * 0.9;
    ctx.clearRect(0, 0, width, height);

    if (!dataArray) return;

    const audioValues = indexes.map((idx) => dataArray[idx]);

    const isAudible =
      audioValues.reduce((curr, val) => curr + (val > 50 ? val : 0), 0) >
      threshold;

    // Circular lines
    audioValues.forEach((val, idx) => {
      const offset = Math.abs(
        Math.sin(Date.now() * 0.001) * (idx + 1) * dim * 0.007
      );
      const blobRadius = baseRadius + (val / 255) * maxRadiusOffset;

      let radius = isAudible
        ? lerp(prevRadius[idx], blobRadius)
        : lerp(prevRadius[idx], baseRadius - offset - idx);

      if (radius < baseRadius / 1.5) {
        radius = baseRadius / 1.5;
      }

      if (radius > baseRadius + maxRadiusOffset) {
        radius = baseRadius + maxRadiusOffset;
      }

      prevRadius[idx] = radius;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgb(25, 117, 123)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };
}
