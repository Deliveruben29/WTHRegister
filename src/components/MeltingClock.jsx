import { useEffect, useRef } from 'react';

export default function MeltingClock({ isWorking }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isWorking) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const width = 450;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Configuration
        const centerX = width * 0.55;
        const clockY = height * 0.22;
        const radius = 100;

        // State
        let drops = [];
        let particles = [];
        let lastSecond = new Date().getSeconds();
        let wobble = 0;

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            const now = new Date();
            const sec = now.getSeconds();
            const min = now.getMinutes();
            const hr = now.getHours();
            const millis = now.getMilliseconds();
            const smoothSec = sec + millis / 1000;
            const time = Date.now() / 1000;
            wobble = Math.sin(time * 2) * 2; // Gentle breathing/wobble

            // --- PALETTE (Classic Disney / Cel Shaded) ---
            const P = {
                outline: '#2C1A0B', // Deep Sepia Ink
                goldBase: '#FFC800', // Cartoon Gold
                goldShadow: '#D48900',
                goldHigh: '#FFEA00',
                faceBase: '#FFF5E0', // Creamy paper
                faceShadow: '#E6D0A0',
                liquid: '#FF9500', // Honey/Amber
                liquidShadow: '#C44E00',
                glass: 'rgba(200, 230, 255, 0.3)',
                glassHigh: 'rgba(255, 255, 255, 0.8)'
            };

            // --- 1. Draw Clepsydra (Bottom) ---
            const vesselY = height - 160;
            ctx.save();
            ctx.translate(centerX, vesselY);

            // Liquid Level (accumulates with minutes)
            const fluidLevel = Math.min((min / 60) * 80 + 10, 85);

            // Draw Fluid (Cel Shaded)
            ctx.beginPath();
            ctx.rect(-45, 80 - fluidLevel, 90, fluidLevel);
            // Mask for bulb shape would be ideal, but for cartoon style we can draw shape filled
            // Simplified logic: Draw bulb shape, clip, fill liquid
            ctx.restore();

            // Real Clepsydra Draw
            ctx.save();
            ctx.translate(centerX, vesselY);
            // Shape defined
            ctx.beginPath();
            ctx.moveTo(-40, 0);
            ctx.bezierCurveTo(-40, 40, -10, 60, -10, 80); // Neck
            ctx.bezierCurveTo(-60, 100, -60, 140, -30, 160); // Bulb
            ctx.lineTo(30, 160);
            ctx.bezierCurveTo(60, 140, 60, 100, 10, 80);
            ctx.bezierCurveTo(10, 60, 40, 40, 40, 0);
            ctx.closePath();

            // Fill Background (Glass darks)
            ctx.fillStyle = 'rgba(50, 30, 10, 0.1)';
            ctx.fill();

            // Clip for liquid
            ctx.save();
            ctx.clip();

            // Liquid main color
            ctx.fillStyle = P.liquid;
            ctx.fillRect(-60, 160 - fluidLevel, 120, fluidLevel);

            // Liquid Shadow (Cel shade band)
            ctx.fillStyle = P.liquidShadow;
            ctx.fillRect(-60, 160 - fluidLevel + 10, 120, fluidLevel); // Simple band for depth

            // Bubbles in liquid
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath(); ctx.arc(-20, 130, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(15, 150, 8, 0, Math.PI * 2); ctx.fill();

            // Surface Top
            ctx.fillStyle = '#FFE082'; // Froth
            ctx.beginPath();
            ctx.ellipse(0, 160 - fluidLevel, 30, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Glass Outline & Highlights
            ctx.lineWidth = 4;
            ctx.strokeStyle = P.outline;
            ctx.stroke();

            // Cartoon Reflections (The "Disney Shine")
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = P.glassHigh;
            ctx.beginPath();
            ctx.moveTo(-35, 110);
            ctx.quadraticCurveTo(-35, 130, -25, 140);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(35, 105);
            ctx.lineTo(35, 115);
            ctx.stroke();

            ctx.restore();


            // --- 2. Draw Melting Clock (Top) ---
            ctx.save();
            ctx.translate(centerX, clockY);

            // Cartoon Melt Shape: Squash and Stretch
            const meltY = Math.sin(time) * 3;
            const meltX = Math.cos(time * 1.5) * 2;

            ctx.beginPath();
            // Top arc
            ctx.bezierCurveTo(-radius + meltX, -radius, radius + meltX, -radius, radius + meltX, 0);
            // Right dripping side
            ctx.bezierCurveTo(radius - 10, radius, radius - 20, radius + 40 + meltY, 0, radius + 60 + meltY); // The drip tip
            // Left flowing side
            ctx.bezierCurveTo(-radius + 20, radius + 40 + meltY, -radius + 10, radius, -radius + meltX, 0);
            ctx.closePath();

            // Fill Base Gold
            ctx.fillStyle = P.goldBase;
            ctx.fill();

            // Cel Shadown (Bottom/Right)
            ctx.save();
            ctx.clip();
            ctx.translate(10, 10); // Offset shadow
            ctx.fillStyle = P.goldShadow;
            ctx.fill();
            ctx.restore();

            // Thick Ink Outline
            ctx.stroke(); // Uses previous path

            // Clock Face (Cream circle inside)
            ctx.beginPath();
            ctx.ellipse(0, 20 + meltY * 0.5, radius * 0.75, radius * 0.7, 0, 0, Math.PI * 2);
            ctx.fillStyle = P.faceBase;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.stroke();

            // Numerals (Warped/Dancing)
            ctx.fillStyle = P.outline;
            ctx.font = 'bold 24px "Comic Sans MS", "Chalkboard SE", sans-serif'; // Playful font
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((num, i) => {
                const ang = (i * 30 - 90) * (Math.PI / 180);
                const r = radius * 0.55;
                let nx = Math.cos(ang) * r;
                let ny = Math.sin(ang) * r;

                // Numbers "slide" down slightly
                if (ny > 20) ny += meltY * 2;

                ctx.fillText(num.toString(), nx, ny + 20);
            });

            // Hands (Mickey/Cartoon style Gloved/Rounded)
            const hAng = ((hr % 12) + min / 60) * (Math.PI * 2) / 12 - Math.PI / 2;
            const mAng = (min + smoothSec / 60) * (Math.PI * 2) / 60 - Math.PI / 2;

            // Center nut
            ctx.translate(0, 20); // Center is slightly lower due to melt

            // Minute Hand
            drawCartoonHand(ctx, mAng, radius * 0.8, 6, P.outline);
            // Hour Hand
            drawCartoonHand(ctx, hAng, radius * 0.5, 8, P.outline);

            // Center Pin
            ctx.fillStyle = P.goldShadow;
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.stroke();

            // --- 3. Spawn Drops (Cartoon style) ---
            if (sec !== lastSecond) {
                lastSecond = sec;
                drops.push({
                    x: (Math.random() - 0.5) * 10, // Close to center tip
                    y: radius + 40, // Start at the drip tip
                    vy: 2,
                    radius: 6 + Math.random() * 4,
                    color: P.goldBase
                });
            }

            ctx.restore(); // Back to global coords

            // --- 4. Animate Drops ---
            drops.forEach((d, i) => {
                d.y += d.vy;
                d.vy += 0.5; // Cartoon gravity (snappier)

                // Stretch effect based on velocity
                const stretch = Math.min(d.vy * 2, 10);

                ctx.save();
                ctx.translate(centerX + d.x, clockY + d.y);

                // Draw Blob
                ctx.fillStyle = P.liquid;
                ctx.strokeStyle = P.outline;
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.ellipse(0, 0, d.radius - stretch / 4, d.radius + stretch, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Highlight dot
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-d.radius / 3, -d.radius / 2, d.radius / 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                // Remove if hit bottom
                if (d.y > vesselY + 80) drops.splice(i, 1);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        const drawCartoonHand = (ctx, angle, len, width, color) => {
            ctx.save();
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;

            ctx.beginPath();
            ctx.roundRect(0, -width / 2, len, width, width / 2);
            ctx.fill();

            // Pointer tip
            ctx.beginPath();
            ctx.moveTo(len, -width / 2);
            ctx.lineTo(len + 15, 0);
            ctx.lineTo(len, width / 2);
            ctx.fill();

            ctx.restore();
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
                right: 0,
                top: 0,
                width: '450px',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 10
            }}
        />
    );
}
