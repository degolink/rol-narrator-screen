import { useRef, useEffect } from 'react';

export function WaveformVisualizer({ analyserNode, isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const analyser = analyserNode?.current;
      if (!analyser || !isActive) {
        // Draw idle waveform (flat line with subtle pulse)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

        // Gradient from indigo to violet
        const hue = 250 + (i / bufferLength) * 40;
        const lightness = 45 + (dataArray[i] / 255) * 25;
        ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;

        // Draw bar from center
        const y = (height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 1, barHeight, 2);
        ctx.fill();

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 sm:h-40 rounded-xl"
      style={{ display: 'block' }}
    />
  );
}
