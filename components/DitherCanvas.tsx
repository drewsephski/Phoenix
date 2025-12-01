import React, { useEffect, useRef } from 'react';

const DitherCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.002;
      const w = canvas.width;
      const h = canvas.height;
      
      // Clear with a very dark tint
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Create a gradient
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
      gradient.addColorStop(0, 'rgba(40, 40, 50, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Add dynamic noise (dither simulation)
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Simple random noise modified by position
        const noise = (Math.random() - 0.5) * 15;
        data[i] = Math.max(0, data[i] + noise);     // R
        data[i + 1] = Math.max(0, data[i + 1] + noise); // G
        data[i + 2] = Math.max(0, data[i + 2] + noise); // B
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Draw some subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      
      // Moving grid effect
      const offset = (time * 50) % gridSize;
      
      for (let x = offset; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      
      for (let y = offset; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`fixed inset-0 z-0 pointer-events-none opacity-60 ${className}`} />;
};

export default DitherCanvas;