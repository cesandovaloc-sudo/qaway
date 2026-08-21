import { useEffect, useRef } from "react";

export function ShapeGrid({
  shape = "diamond", // 'diamond' | 'cross' | 'square' | 'circle'
  gridGap = 44,
  shapeSize = 12,
  color = "rgba(255, 255, 255, 0.08)",
  activeColor = "rgba(255, 255, 255, 0.45)",
  speed = 0.0006,
  waveIntensity = 2.5,
  interactive = true,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 720);

    let mouseX = -1000;
    let mouseY = -1000;
    let time = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    const handleMouseMove = (e) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const drawShape = (x, y, size, alpha, isActive) => {
      ctx.save();
      ctx.translate(x, y);

      ctx.strokeStyle = isActive ? activeColor : color;
      ctx.fillStyle = isActive ? activeColor : color;
      ctx.lineWidth = isActive ? 1.8 : 1.2;
      ctx.globalAlpha = alpha;

      if (shape === "cross") {
        const half = size / 2;
        ctx.beginPath();
        ctx.moveTo(-half, 0);
        ctx.lineTo(half, 0);
        ctx.moveTo(0, -half);
        ctx.lineTo(0, half);
        ctx.stroke();
      } else if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape === "diamond") {
        const half = size / 2;
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, 0);
        ctx.lineTo(0, half);
        ctx.lineTo(-half, 0);
        ctx.closePath();
        ctx.stroke();
      } else {
        // square
        const half = size / 2;
        ctx.strokeRect(-half, -half, size, size);
      }

      ctx.restore();
    };

    const render = () => {
      time += speed;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / gridGap) + 1;
      const rows = Math.ceil(height / gridGap) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * gridGap;
          const baseY = r * gridGap;

          // Wave motion offset
          const wave = Math.sin(time * 800 + c * 0.4 + r * 0.4) * waveIntensity;
          const x = baseX;
          const y = baseY + wave;

          // Mouse interaction
          const dx = mouseX - x;
          const dy = mouseY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          let currentSize = shapeSize;
          let alpha = 0.5 + Math.sin(time * 500 + c * 0.3) * 0.25;
          let isActive = false;

          if (dist < maxDist) {
            const factor = 1 - dist / maxDist;
            currentSize = shapeSize * (1 + factor * 0.8);
            alpha = Math.min(1, alpha + factor * 0.6);
            isActive = true;
          }

          drawShape(x, y, currentSize, Math.max(0.15, alpha), isActive);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shape, gridGap, shapeSize, color, activeColor, speed, waveIntensity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`shape-grid-canvas ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        ...style,
      }}
    />
  );
}
