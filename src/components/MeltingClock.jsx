import { useEffect, useRef } from 'react';

export default function MeltingClock({ isWorking }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isWorking) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const width = 350; // Wider for better detail
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const centerX = width / 2;
        const clockY = height * 0.25;
        const radius = 90;

        // State for falling numerals/markers
        let fallingItems = [];
        let lastSecond = new Date().getSeconds();
        let fluidLevel = 0;

        // Pre-calculate randomized distortion for the "melting" shape static part
        // To make it look like a consistent object, we use a fixed noise-like pattern
        const distortionPoints = [];
        for (let i = 0; i <= Math.PI * 2; i += 0.1) {
            // Strong distortion at the bottom (PI/2 is bottom in normal circle terms, but we start 0 at right)
            // 0=Right, PI/2=Bottom, PI=Left, 3PI/2=Top
            let r = radius;
            if (i > 0.5 && i < 2.5) { // Bottom right to bottom left roughly
                r += Math.sin(i * 3) * 10 + 20; // Melt downwards
            }
            distortionPoints.push({ angle: i, r });
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

            // --- 3. Draw Clepsidra (The Vessel) ---
            const vesselY = height - 150;
            const vesselWidth = 100;

            // Draw Fluid
            // Fill level based on minutes passed in hour
            const maxFill = 80;
            const currentFill = (min / 60) * maxFill;
            fluidLevel += (currentFill - fluidLevel) * 0.05;

            // Fluid glow
            const fluidGrad = ctx.createLinearGradient(centerX, vesselY + 100, centerX, vesselY + 100 - fluidLevel);
            fluidGrad.addColorStop(0, '#DAA520'); // Goldenrod
            fluidGrad.addColorStop(1, '#FFD700'); // Gold

            ctx.fillStyle = fluidGrad;
            ctx.beginPath();
            // Simple fluid shape inside the glass
            ctx.moveTo(centerX - 40, vesselY + 100);
            ctx.lineTo(centerX - 40, vesselY + 100 - fluidLevel);
            // Surface tension wave
            ctx.bezierCurveTo(centerX - 20, vesselY + 100 - fluidLevel - 5, centerX + 20, vesselY + 100 - fluidLevel + 5, centerX + 40, vesselY + 100 - fluidLevel);
            ctx.lineTo(centerX + 40, vesselY + 100);
            ctx.fill();


            // Draw Glass Vessel visuals (Front)
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;

            const glassGrad = ctx.createLinearGradient(centerX - 50, vesselY, centerX + 50, vesselY + 120);
            glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

            ctx.fillStyle = glassGrad;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            // Elegant vase shape
            ctx.moveTo(centerX - 30, vesselY); // Top neck
            ctx.quadraticCurveTo(centerX - 60, vesselY + 40, centerX - 40, vesselY + 100); // Bulbous body left
            ctx.quadraticCurveTo(centerX, vesselY + 120, centerX + 40, vesselY + 100); // Bottom round
            ctx.quadraticCurveTo(centerX + 60, vesselY + 40, centerX + 30, vesselY); // Bulbous body right
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Highlights
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 3;
            ctx.arc(centerX + 25, vesselY + 60, 10, -0.5, 0.5); // Specular highlight
            ctx.stroke();
            ctx.restore();


            // --- 1. Draw Melting Clock Body ---
            ctx.save();

            // Metallic Gold Bezel Gradient
            const bezelGrad = ctx.createRadialGradient(centerX - 20, clockY - 20, radius * 0.5, centerX, clockY, radius * 1.5);
            bezelGrad.addColorStop(0, '#F5DEB3'); // Wheat highlight
            bezelGrad.addColorStop(0.3, '#DAA520'); // Goldenrod
            bezelGrad.addColorStop(0.6, '#B8860B'); // Dark goldenrod
            bezelGrad.addColorStop(1, '#8B4513'); // Saddlebrown shadow

            // Breathing/Melting Animation
            const breath = Math.sin(Date.now() / 2000) * 2;
            const meltOffset = Math.sin(Date.now() / 4000) * 5;

            // Draw Bezel Shape
            ctx.beginPath();
            for (let i = 0; i < distortionPoints.length; i++) {
                const p = distortionPoints[i];
                let r = p.r + breath;
                // Add dynamic wave to bottom
                if (p.angle > 0.5 && p.angle < 2.5) {
                    r += Math.sin(p.angle * 10 + Date.now() / 1000) * 3;
                }
                const x = centerX + Math.cos(p.angle) * r;
                const y = clockY + Math.sin(p.angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;
            ctx.fillStyle = bezelGrad;
            ctx.fill();
            ctx.strokeStyle = '#5c4033';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.shadowColor = 'transparent'; // Reset shadow

            // Face (Porcelain)
            ctx.beginPath();
            // Re-trace slightly smaller for the face
            for (let i = 0; i < distortionPoints.length; i++) {
                const p = distortionPoints[i];
                let r = (p.r + breath) - 8; // Inset
                if (p.angle > 0.5 && p.angle < 2.5) {
                    r += Math.sin(p.angle * 10 + Date.now() / 1000) * 3;
                }
                const x = centerX + Math.cos(p.angle) * r;
                const y = clockY + Math.sin(p.angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            const faceGrad = ctx.createRadialGradient(centerX, clockY, 10, centerX, clockY, radius);
            faceGrad.addColorStop(0, '#fffff0'); // Ivory
            faceGrad.addColorStop(1, '#f0e68c'); // Khaki edge
            ctx.fillStyle = faceGrad;
            ctx.fill();

            // Inner shadow for depth
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 10;
            ctx.shadowInset = true; // Canvas doesn't do inset directly, we simulate or ignore for now
            ctx.stroke();

            // --- 2. Ticks & falling logic ---
            // We want 60 ticks.
            // A tick is just a line at an angle.
            // If a minute passes, we detach a tick.

            if (sec !== lastSecond && sec % 2 === 0) { // Every 2 seconds for visual effect, or use (min !== lastMin) for real minutes
                lastSecond = sec;
                // Pick a random tick from the bottom half to "melt" off
                // Angles 0 to PI (bottom semi-circle roughly)
                const randomAngleIdx = Math.floor(Math.random() * 30) + 15; // Bottom-ish range
                // Actually, let's just make the "current minute" tick fall? 
                // Or random "minute bars" dripping.

                // Let's spawn a falling bar from the bottom drip point
                fallingItems.push({
                    x: centerX + (Math.random() * 40 - 20),
                    y: clockY + radius + 10, // Start at bottom of clock
                    angle: Math.PI / 2, // Vertical
                    vy: 0,
                    vr: (Math.random() - 0.5) * 0.1, // Rotation speed
                    type: Math.random() > 0.8 ? 'num' : 'bar' // Sometimes a number falls?
                });
            }

            // Draw static Ticks (that haven't fallen - technically we draw all and overlay falling ones for visual density)
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            for (let i = 0; i < 60; i++) {
                const angle = (i * 6) * (Math.PI / 180) - Math.PI / 2;
                const isHour = i % 5 === 0;
                const len = isHour ? 15 : 8;
                const width = isHour ? 3 : 1;

                // Warp the positions based on our melt map roughly
                // Simple mapping:
                let rStart = radius - 15;
                let rEnd = radius - 15 - len;

                // Apply melt distortion to tick positions
                // This is an approximation since we don't have the exact poly point for every degree
                let melt = 0;
                let checkAngle = (angle + Math.PI / 2) % (Math.PI * 2); // Normalize 0-2PI
                if (checkAngle > 0.5 && checkAngle < 2.5) {
                    melt = Math.sin(checkAngle * 10) * 3 + 10;
                }

                const x1 = centerX + Math.cos(angle) * (rStart + melt);
                const y1 = clockY + Math.sin(angle) * (rStart + melt);
                const x2 = centerX + Math.cos(angle) * (rEnd + melt);
                const y2 = clockY + Math.sin(angle) * (rEnd + melt);

                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            // Draw Hands (Serpentine/Organic)
            // Hour
            const hourAngle = ((hr % 12) + min / 60) * (Math.PI * 2) / 12 - Math.PI / 2;
            drawOrganicHand(ctx, centerX, clockY, hourAngle, radius * 0.5, 4, '#000');
            // Minute
            const minAngle = (min + smoothSec / 60) * (Math.PI * 2) / 60 - Math.PI / 2;
            drawOrganicHand(ctx, centerX, clockY, minAngle, radius * 0.75, 3, '#000');
            // Second
            const secAngle = (smoothSec) * (Math.PI * 2) / 60 - Math.PI / 2;
            drawOrganicHand(ctx, centerX, clockY, secAngle, radius * 0.85, 1, '#8B0000');

            // Draw Center Cap
            ctx.beginPath();
            ctx.arc(centerX, clockY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();

            ctx.restore();

            // --- 4. Animate Falling Items (The "Minutes") ---
            ctx.save();
            fallingItems.forEach((item, idx) => {
                item.vy += 0.2; // Gravity
                item.y += item.vy;
                item.angle += item.vr;

                if (item.y > vesselY + 110 - fluidLevel) {
                    // Hit fluid
                    fallingItems.splice(idx, 1);
                    return;
                }

                ctx.translate(item.x, item.y);
                ctx.rotate(item.angle);

                // Draw a falling "bar" (the minute mark)
                ctx.fillStyle = '#000';
                ctx.shadowBlur = 2;
                ctx.shadowColor = 'rgba(0,0,0,0.3)';

                // Make it look 3D-ish
                ctx.fillRect(-1, -4, 2, 8); // The minute bar

                ctx.shadowBlur = 0;
                ctx.rotate(-item.angle);
                ctx.translate(-item.x, -item.y);
            });
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        const drawOrganicHand = (ctx, cx, cy, angle, length, width, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw a slightly wavy line to simulate "soft" metal
            ctx.moveTo(0, 0);

            const cp1x = length * 0.3;
            const cp1y = Math.sin(Date.now() / 1000) * 3;
            const cp2x = length * 0.7;
            const cp2y = -Math.sin(Date.now() / 1500) * 3;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, length, 0);
            ctx.stroke();

            // Arrow head or blob at end
            ctx.beginPath();
            ctx.arc(length, 0, width, 0, Math.PI * 2);
            ctx.fillStyle = color;
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
                right: '40px', // Adjusted to not be flush
                top: 0,
                width: '350px',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        />
    );
}
