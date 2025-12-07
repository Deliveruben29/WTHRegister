import { useEffect, useRef } from 'react';

export default function MeltingClock({ isWorking }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isWorking) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const width = 400; // Wider to accommodate the tilted composition
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const centerX = width * 0.6;
        const clockY = height * 0.2;
        const radius = 100;

        // State
        let fallingItems = [];
        let lastSecond = new Date().getSeconds();
        let fluidLevel = 0;

        // Pre-calculate randomized distortion for the "melting" shape
        const distortionPoints = [];
        const numPoints = 100;
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            let r = radius;

            // Heavy melt at the bottom (around PI/2)
            // Dali illusion: elongated bottom
            const bottomFocus = Math.PI / 2;
            const distFromBottom = Math.abs(angle - bottomFocus);

            if (angle > 0 && angle < Math.PI) {
                // Stretch downwards heavily
                r += Math.pow(Math.sin(angle), 3) * 60;
            }

            // Curve inwards slightly at top for the "pocket watch" look
            if (angle > Math.PI && angle < Math.PI * 2) {
                r -= 5;
            }

            distortionPoints.push({ angle, r_base: r });
        }

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            const now = new Date();
            const sec = now.getSeconds();
            const min = now.getMinutes();
            const hr = now.getHours();
            const millis = now.getMilliseconds();
            const smoothSec = sec + millis / 1000;

            // --- 3. Draw Clepsidra (Glass Hourglass) ---
            const vesselX = centerX - 30;
            const vesselY = height - 180;
            const scale = 0.8;

            ctx.save();
            ctx.translate(vesselX, vesselY);
            ctx.scale(scale, scale);
            ctx.rotate(-0.2); // Tilted like in the painting

            // Fluid/Sand Accumulation
            const maxLevel = 100;
            const fluidCurrent = (min / 60) * maxLevel; // Fill up
            fluidLevel += (fluidCurrent - fluidLevel) * 0.05;

            // Draw contents (Gold Sand)
            ctx.fillStyle = '#C5A000'; // Dark gold sand
            ctx.beginPath();
            // Bottom bulb fill
            const fillHeight = fluidLevel;
            ctx.rect(-40, 150 - fillHeight, 80, fillHeight); // Simple clip mask fill
            // Masking would be better but simple rect works inside the shape we'll draw over
            // Let's actually draw the sand shape
            ctx.fill();

            // Draw Glass Body
            const glassGrad = ctx.createLinearGradient(-50, 0, 50, 150);
            glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
            glassGrad.addColorStop(0.5, 'rgba(200, 230, 255, 0.2)');
            glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

            ctx.fillStyle = glassGrad;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 3;

            ctx.beginPath();
            // Hourglass shape
            ctx.moveTo(-50, 0); // Top left
            ctx.bezierCurveTo(-50, 50, -10, 70, -10, 75); // Neck left
            ctx.lineTo(-10, 80); // Neck straight
            ctx.bezierCurveTo(-10, 85, -60, 100, -60, 150); // Bottom bulb left
            ctx.bezierCurveTo(-30, 160, 30, 160, 60, 150); // Bottom curve
            ctx.bezierCurveTo(60, 100, 10, 85, 10, 80); // Bottom bulb right
            ctx.lineTo(10, 75); // Neck straight
            ctx.bezierCurveTo(10, 70, 50, 50, 50, 0); // Top bulb right
            ctx.bezierCurveTo(20, -10, -20, -10, -50, 0); // Top rim
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Highlights (Reflections)
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-45, 10);
            ctx.quadraticCurveTo(-45, 40, -15, 65);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(45, 140);
            ctx.quadraticCurveTo(45, 110, 15, 90);
            ctx.stroke();

            // Sand Stream
            if (fallingItems.length === 0) { // Should almost never happen in this logic, but visually connect
                // Draw a thin stream if we wanted continuous flow, but we have falling minutes
            }

            ctx.restore();


            // --- 1. Draw Melting Clock Body ---
            // Animate melt wave
            const time = Date.now() / 2000;

            ctx.save();
            ctx.translate(centerX, clockY);

            // Create path
            ctx.beginPath();
            for (let i = 0; i < distortionPoints.length; i++) {
                const p = distortionPoints[i];
                // Add living organic movement
                const wave = Math.sin(p.angle * 5 + time) * 3;
                const r = p.r_base + wave;
                const x = Math.cos(p.angle) * r;
                const y = Math.sin(p.angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Draw Gold Case
            const goldGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
            goldGrad.addColorStop(0, '#DAA520');
            goldGrad.addColorStop(0.4, '#FFD700');
            goldGrad.addColorStop(0.7, '#B8860B');
            goldGrad.addColorStop(1, '#8B4513');

            ctx.fillStyle = goldGrad;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 10;
            ctx.fill();
            ctx.strokeStyle = '#5c4033'; // Dark brown outline
            ctx.lineWidth = 2;
            ctx.stroke();

            // Winder (The Crown)
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(-15, -radius - 15, 30, 20);
            ctx.beginPath();
            ctx.arc(0, -radius - 20, 12, 0, Math.PI * 2); // Ring
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Face (Porcelain/White)
            ctx.beginPath();
            for (let i = 0; i < distortionPoints.length; i++) {
                const p = distortionPoints[i];
                const wave = Math.sin(p.angle * 5 + time) * 3;
                const r = (p.r_base + wave) * 0.85; // Inner rim
                const x = Math.cos(p.angle) * r;
                const y = Math.sin(p.angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Subtle antique shadow on face
            const faceGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.5);
            faceGrad.addColorStop(0, '#FFFFFF');
            faceGrad.addColorStop(0.8, '#F0F0E0');
            faceGrad.addColorStop(1, '#E6D8AD'); // Aged paper edge
            ctx.fillStyle = faceGrad;
            ctx.fill();

            // --- 2. Roman Numerals & Hands ---

            // Draw Numerals
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px "Times New Roman", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
            numerals.forEach((rom, idx) => {
                const angle = (idx * 30 - 90) * (Math.PI / 180);
                // Distorted position
                let r = radius * 0.7;
                // Apply same melt logic roughly
                if (angle > 0.5 && angle < 2.5) r += 30; // Melt down

                const nx = Math.cos(angle) * r;
                const ny = Math.sin(angle) * r;

                // Warp context for text
                ctx.save();
                ctx.translate(nx, ny);
                // Rotate text to follow curve? No, Dali usually had them upright or warped. 
                // Let's keep upright but warped position.
                // Maybe a slight skew for realism
                ctx.scale(1, 1 + (ny / 200)); // Stretch vertical as it goes down
                ctx.fillText(rom, 0, 0);
                ctx.restore();
            });

            // Hands
            const hAngle = ((hr % 12) + min / 60) * (Math.PI * 2) / 12 - Math.PI / 2;
            const mAngle = (min + smoothSec / 60) * (Math.PI * 2) / 60 - Math.PI / 2;

            drawFancyHand(ctx, hAngle, radius * 0.4, 5, '#000');
            drawFancyHand(ctx, mAngle, radius * 0.65, 3, '#000');


            // --- Spawn Minute Bars ---
            if (sec !== lastSecond) {
                lastSecond = sec;
                // Spawn a minute marker falling
                fallingItems.push({
                    x: centerX + (Math.random() * 20 - 10),
                    y: clockY + radius + 40, // Start from the dripping bottom
                    vx: (Math.random() - 0.5) * 1,
                    vy: 0,
                    vr: (Math.random() - 0.5) * 0.2,
                    angle: Math.random() * Math.PI,
                    // Aesthetic of the bar
                    color: '#222'
                });
            }

            ctx.restore(); // Back to global coords

            // --- 4. Animate Falling Bars ---
            ctx.save();
            fallingItems.forEach((item, idx) => {
                item.vy += 0.2;
                item.x += item.vx;
                item.y += item.vy;
                item.angle += item.vr;

                // Collision with Clepsydra (Visual approximation)
                if (item.y > (vesselY + 80)) {
                    // "Splashed" or landed
                    fallingItems.splice(idx, 1);
                    return;
                }

                ctx.translate(item.x, item.y);
                ctx.rotate(item.angle);

                // Draw Minute Bar (Artisanal looking line)
                ctx.fillStyle = '#000';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(0, 6);
                ctx.stroke();

                // Add a little blob at end like a weight or serif
                ctx.beginPath();
                ctx.arc(0, 6, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.rotate(-item.angle);
                ctx.translate(-item.x, -item.y);
            });
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        const drawFancyHand = (ctx, angle, length, width, color) => {
            ctx.save();
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = width;

            // Ornate hand shape (breguet style / filigree)
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(length - 15, 0);
            ctx.stroke();

            // Circle/Hollow point
            ctx.beginPath();
            ctx.arc(length - 10, 0, 4, 0, Math.PI * 2);
            ctx.stroke();

            // Tip
            ctx.beginPath();
            ctx.moveTo(length - 6, 0);
            ctx.lineTo(length, 0);
            ctx.stroke();

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
                width: '400px',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        />
    );
}
