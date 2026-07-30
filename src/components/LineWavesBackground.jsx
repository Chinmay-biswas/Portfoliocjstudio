import { useEffect, useRef } from "react";

export default function LineWavesBackground({
  color = "#1DCD9F",
  opacity = 0.42,
  rotation = -45,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frameId;
    let width = 0;
    let height = 0;
    let pointer = { x: 0.5, y: 0.5 };
    let target = { x: 0.5, y: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      target = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    const handlePointerLeave = () => {
      target = { x: 0.5, y: 0.5 };
    };

    const draw = (time) => {
      const t = time * 0.001;
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);

      const lineCount = Math.max(26, Math.floor(height / 22));
      const mouseWarp = (pointer.x - 0.5) * 90;

      for (let i = 0; i < lineCount; i += 1) {
        const yBase = (i / (lineCount - 1)) * height;
        const fade = 1 - Math.abs(i / (lineCount - 1) - 0.5) * 1.35;

        ctx.beginPath();
        for (let x = -width * 0.15; x <= width * 1.15; x += 14) {
          const waveA = Math.sin(x * 0.012 + t * 1.1 + i * 0.35) * 18;
          const waveB = Math.sin(x * 0.004 - t * 0.85 + i * 0.8) * 32;
          const mousePull =
            Math.exp(-Math.abs(x / width - pointer.x) * 3) *
            Math.sin(t + i * 0.4) *
            mouseWarp;
          const y = yBase + waveA + waveB + mousePull;

          if (x === -width * 0.15) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0, fade) * opacity;
        ctx.lineWidth = 1.1;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      ctx.restore();
      frameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [color, opacity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
