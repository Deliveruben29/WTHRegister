import { useEffect, useRef } from 'react';

export default function MeltingClock({ isWorking }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isWorking) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const width = 300;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        let drops = [];
        let lastMinute = new Date().getMinutes();
        let fluidLevel = 0;

        // Clock aesthetic
        const centerX = width / 2;
        const centerY = height * 0.2; // Top 20%
        const radius = 80;

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            const now = new Date();
            const seconds = now.getSeconds();
            const minutes = now.getMinutes();
            const hours = now.getHours();
            const millis = now.getMilliseconds();

            // 1. Draw Clepsydra Base (The pool) at the bottom
            const poolY = height - 100;

            // Draw glass container for pool
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX - 70, height);
            ctx.lineTo(centerX - 70, poolY);
            ctx.quadraticCurveTo(centerX, poolY + 20, centerX + 70, poolY);
            ctx.lineTo(centerX + 70, height);
            ctx.stroke();

            // Fluid in Clepsydra
            // Level rises slightly as minutes pass in the current hour (resetting every hour for demo or keeping it)
            // Let's make it fill up based on seconds for more visible movement in this demo
            const targetFluidHeight = (minutes % 60) * 2; // Up to 120px height
            fluidLevel = fluidLevel + (targetFluidHeight - fluidLevel) * 0.05;

            if (fluidLevel > 0) {
                ctx.fillStyle = 'rgba(218, 165, 32, 0.6)'; // Liquid gold
                ctx.beginPath();
                const fluidSurfaceY = height - fluidLevel;
                ctx.moveTo(centerX - 68, height);
                ctx.lineTo(centerX - 68, fluidSurfaceY);
                // Wavy surface
                const waveOffset = Math.sin(Date.now() / 500) * 3;
                ctx.quadraticCurveTo(centerX, fluidSurfaceY + waveOffset + 10, centerX + 68, fluidSurfaceY);
                ctx.lineTo(centerX + 68, height);
                ctx.fill();
            }

            // 2. Draw Melting Clock Face
            ctx.save();
            ctx.translate(centerX, centerY);

            // Warp effect based on time (breathing/melting)
            const warpY = Math.cos(Date.now() / 3000) * 5;
            const meltFactor = Math.sin(Date.now() / 5000) * 5;

            // Clock Shape (Distorted Circle / Soft Watch)
            ctx.beginPath();
            ctx.strokeStyle = '#4a4a4a';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(240, 240, 230, 0.9)'; // Off-white porcelain face

            // Draw a "blobby" circle
            for (let i = 0; i <= Math.PI * 2; i += 0.1) {
                let r = radius;

                // Distort bottom to look like it's dripping/melting
                if (i > Math.PI * 0.25 && i < Math.PI * 0.75) {
                    r += Math.sin(i * 10) * 3 + warpY + 10;
                }

                const x = Math.cos(i) * r;
                const y = Math.sin(i) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Numbers (Roman numerals for Dali vibes)
            ctx.font = '14px serif';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            [12, 3, 6, 9].forEach(num => {
                const angle = (num - 3) * (Math.PI * 2) / 12;
                const nx = Math.cos(angle) * (radius * 0.8);
                const ny = Math.sin(angle) * (radius * 0.8);
                ctx.fillText(num.toString(), nx, ny);
            });


            // Clock Hands
            // Hour
            const hourAngle = ((hours % 12) + minutes / 60) * (Math.PI * 2) / 12 - Math.PI / 2;
            drawHand(ctx, hourAngle, radius * 0.5, 4, '#000');
            // Minute
            const minuteAngle = (minutes + seconds / 60) * (Math.PI * 2) / 60 - Math.PI / 2;
            drawHand(ctx, minuteAngle, radius * 0.7, 3, '#000');
            // Second
            const secondAngle = (seconds + millis / 1000) * (Math.PI * 2) / 60 - Math.PI / 2;
            drawHand(ctx, secondAngle, radius * 0.85, 1, '#b91c1c');

            ctx.restore();

            // 3. Dripping Time Logic
            // Add a drop every time the minute changes OR randomly for effect
            if (Math.random() < 0.02) { // Random drip
                drops.push({
                    x: centerX + (Math.random() * 40 - 20),
                    y: centerY + radius,
                    vy: 2,
                    radius: 3,
                    alpha: 1
                });
            }

            // Animate Drops
            ctx.fillStyle = 'rgba(218, 165, 32, 0.8)'; // Golden drops
            drops.forEach((drop, index) => {
                drop.y += drop.vy;
                drop.vy += 0.2; // Gravity

                // Draw drop (teardrop shape)
                ctx.beginPath();
                ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
                ctx.fill();

                // Remove if hits the fluid line or bottom
                if (drop.y > height - fluidLevel) {
                    drops.splice(index, 1);
                    // Could add ripple here later
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        const drawHand = (ctx, angle, length, width, color) => {
            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.lineCap = 'round';
            // Simple wavy distortion for hand
            ctx.moveTo(0, 0);
            const midX = Math.cos(angle) * (length * 0.5) + Math.sin(Date.now() / 500) * 2;
            const midY = Math.sin(angle) * (length * 0.5) + Math.cos(Date.now() / 500) * 2;
            const endX = Math.cos(angle) * length;
            const endY = Math.sin(angle) * length;

            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.stroke();
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isWorking]);

    if (!isWorking) return null;

    return (
        <canvas
            ref={canvasRef}
            className="animate-fade-in"
            style={{
                position: 'fixed',
                right: '20px',
                top: 0,
                width: '300px',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 10, // Above background, below modal
            }}
        />
    );
}
