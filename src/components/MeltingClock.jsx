import { useEffect, useRef } from 'react';

export default function MeltingClock({ isWorking }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isWorking) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const width = 450;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const centerX = width * 0.55;
        const clockY = height * 0.22;
        const radius = 110;

        // State
        let fallingItems = [];
        let particles = []; // Dust/magic motes
        let lastSecond = new Date().getSeconds();
        let fluidLevel = 0;

        // --- Procedural Generation for "Ruined" Look ---
        // 1. Generate Cracks
        const cracks = [];
        const numCracks = 8;
        for (let i = 0; i < numCracks; i++) {
            const startAngle = Math.random() * Math.PI * 2;
            const len = Math.random() * radius * 0.8;
            const segments = 10;
            const path = [];
            let r = Math.random() * 20; // Start near center-ish
            let a = startAngle;
            for (let j = 0; j < segments; j++) {
                r += len / segments;
                a += (Math.random() - 0.5) * 0.5; // Jagged walk
                path.push({ r, a });
            }
            cracks.push(path);
        }

        // 2. Melting Shape Distortion Map (Permanent shape + wobble later)
        const distortions = [];
        for (let i = 0; i <= 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            // Base distortion: Elongate bottom, "bite" out of top left (decay)
            let r = radius;
            // Decay/Ruined top-left
            if (angle > Math.PI * 0.7 && angle < Math.PI * 1.2) {
                r -= (Math.random() * 10 + 5);
            }
            // Melt bottom right
            if (angle > -0.5 && angle < 1.0) { // wrapped angle logic simplified
                // handled in render loop for smoothness
            }
            distortions.push({ angle, r });
        }

        // 3. Generate Atmospheric Particles
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: centerX + (Math.random() - 0.5) * 300,
                y: clockY + (Math.random() - 0.5) * 300,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2,
                alpha: Math.random() * 0.5
            });
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
            const time = Date.now() / 1500; // Animation time base

            // Use a warm, dramatic color palette
            // Palette: #2C1B0E (Dark Brown), #DAA520 (Gold), #CD853F (Peru), #F4A460 (Sandy)

            // --- 4. Draw Atmospheric Particles (Background layer) ---
            ctx.fillStyle = '#DAA520';
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha = 0.3 + Math.sin(time + p.x) * 0.2; // Twinkle

                // Wrap around
                if (Math.abs(p.x - centerX) > 200) p.vx *= -1;
                if (Math.abs(p.y - clockY) > 200) p.vy *= -1;

                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;


            // --- 3. Draw Clepsidra (The Vessel) ---
            const vesselX = centerX;
            const vesselY = height - 160;
            const scale = 0.85;

            ctx.save();
            ctx.translate(vesselX, vesselY);
            ctx.scale(scale, scale);
            ctx.rotate(0.05); // Slight imperfection

            // Fluid accumulation
            const maxLevel = 110;
            const fluidCurrent = (min / 60) * maxLevel;
            fluidLevel += (fluidCurrent - fluidLevel) * 0.05;

            // Draw Glow behind vessel
            const glow = ctx.createRadialGradient(0, 80, 10, 0, 80, 100);
            glow.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(-100, -50, 200, 250);

            // Draw Liquid (Molten Gold / Lava)
            ctx.fillStyle = '#C5A000';
            const liquidGrad = ctx.createLinearGradient(-30, 150 - fluidLevel, 30, 150);
            liquidGrad.addColorStop(0, '#FFD700'); // Hot gold top
            liquidGrad.addColorStop(1, '#8B4513'); // Dark base

            ctx.fillStyle = liquidGrad;
            ctx.beginPath();
            // Complex bulb shape fill roughly
            ctx.rect(-50, 150 - fluidLevel, 100, fluidLevel);
            // This is a mask cheat, let's clip properly instead
            // ... (keeping logical simplicity for performance: draw shape, clip, draw liquid) -> Better strategy below
            ctx.fill(); // Just placeholder for the look, real clipping is expensive in loop

            // Actual Vessel Drawing (Amber Glass)
            ctx.beginPath();
            // Organic blown glass shape
            ctx.moveTo(-45, 0);
            ctx.bezierCurveTo(-45, 40, -10, 60, -8, 75); // Neck L
            ctx.lineTo(-8, 85);
            ctx.bezierCurveTo(-60, 100, -60, 140, -40, 160); // Bulb L
            ctx.bezierCurveTo(0, 170, 0, 170, 40, 160); // Bottom
            ctx.bezierCurveTo(60, 140, 60, 100, 8, 85); // Bulb R
            ctx.lineTo(8, 75);
            ctx.bezierCurveTo(10, 60, 45, 40, 45, 0); // Neck R
            ctx.closePath();

            // Clip for liquid re-draw to be accurate
            ctx.save();
            ctx.clip();
            // Re-draw liquid inside
            ctx.fillStyle = liquidGrad;
            ctx.fillRect(-60, 160 - fluidLevel, 120, fluidLevel + 10);
            // Surface tension
            ctx.fillStyle = '#FFE4B5'; // Foam/bright surface
            ctx.beginPath();
            ctx.ellipse(0, 160 - fluidLevel, 30, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw Glass Walls
            const glassStyle = ctx.createLinearGradient(-50, 0, 50, 160);
            glassStyle.addColorStop(0, 'rgba(255, 250, 240, 0.3)');
            glassStyle.addColorStop(0.5, 'rgba(218, 165, 32, 0.1)'); // Amber tint
            glassStyle.addColorStop(1, 'rgba(100, 50, 0, 0.2)');

            ctx.fillStyle = glassStyle;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; // Gold rim light
            ctx.stroke();

            ctx.restore();


            // --- 1. Draw Melting/Ruined Clock ---
            ctx.save();
            ctx.translate(centerX, clockY);

            // Define the organic melting path dynamically
            ctx.beginPath();
            const meltAmount = Math.sin(time) * 5;
            for (let i = 0; i <= 60; i++) {
                const angle = (i / 60) * Math.PI * 2;
                let r = radius;

                // Base distortion from static map + dynamic melt
                // Heavy drip at bottom
                if (angle > 0.5 && angle < 2.6) { // Bottom sector
                    const drip = Math.pow(Math.sin(angle - 1.5), 2) * 50;
                    r += drip + meltAmount;
                }

                // "Roots/Decay" bumps on top left
                if (angle > 3.5 && angle < 5.0) {
                    r += (Math.random() - 0.5) * 4; // Jagged edge
                }

                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Fill with "Ancient Gold/Stone" texture
            const bodyGrad = ctx.createRadialGradient(-20, -20, 10, 0, 0, radius + 20);
            bodyGrad.addColorStop(0, '#F0E68C'); // Light Khaki
            bodyGrad.addColorStop(0.5, '#DAA520'); // Goldenrod
            bodyGrad.addColorStop(0.9, '#8B4513'); // Saddle Brown (decay)
            ctx.fillStyle = bodyGrad;

            // Deep shadow for 3D volume
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 25;
            ctx.shadowOffsetY = 15;
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Outline - broken and organic
            ctx.strokeStyle = '#3E2723'; // Very dark brown
            ctx.lineWidth = 2;
            ctx.stroke();

            // --- Clock Face (Cracked Parchment) ---
            // Inset path
            ctx.beginPath();
            for (let i = 0; i <= 60; i++) {
                const angle = (i / 60) * Math.PI * 2;
                let r = radius - 12; // Rim width
                if (angle > 0.5 && angle < 2.6) {
                    const drip = Math.pow(Math.sin(angle - 1.5), 2) * 45;
                    r += drip + meltAmount;
                }
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            const faceGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, radius);
            faceGrad.addColorStop(0, '#FFF8DC'); // Cornsilk center
            faceGrad.addColorStop(0.7, '#DEB887'); // Burlywood
            faceGrad.addColorStop(1, '#A0522D'); // Sienna edge (burnt/dirty)
            ctx.fillStyle = faceGrad;
            ctx.fill();

            // Draw Cracks
            ctx.strokeStyle = 'rgba(60, 40, 30, 0.4)';
            ctx.lineWidth = 1;
            cracks.forEach(path => {
                ctx.beginPath();
                path.forEach((p, idx) => {
                    const x = Math.cos(p.a) * p.r;
                    const y = Math.sin(p.a) * p.r;
                    if (idx === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            });

            // --- Numerals (Fading/Ruined) ---
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
            numerals.forEach((rom, idx) => {
                const angle = (idx * 30 - 90) * (Math.PI / 180);
                // Distorted layout
                let r = radius * 0.75;
                if (angle > 1.0 && angle < 2.2) r += 20; // Falling lower numbers

                const nx = Math.cos(angle) * r;
                const ny = Math.sin(angle) * r;

                // Random decay for text opacity
                ctx.globalAlpha = 0.6 + Math.random() * 0.4;
                ctx.fillStyle = '#2F1B10'; // Dark almost black brown
                ctx.font = 'bold 18px "Courier New", serif'; // Monospace serif for typed/stamped look

                // Slight jitter/decay
                const jitX = (Math.random() - 0.5) * 1;
                const jitY = (Math.random() - 0.5) * 1;

                ctx.save();
                ctx.translate(nx + jitX, ny + jitY);
                // Rotate to match tangent slightly? No, keep upright but skewed
                ctx.transform(1, 0, 0, 1 + (ny / 150), 0, 0); // Stretch vertically based on Y
                ctx.fillText(rom, 0, 0);
                ctx.restore();
            });
            ctx.globalAlpha = 1.0;

            // --- Hands (Old Iron branches) ---
            const hAngle = ((hr % 12) + min / 60) * (Math.PI * 2) / 12 - Math.PI / 2;
            const mAngle = (min + smoothSec / 60) * (Math.PI * 2) / 60 - Math.PI / 2;

            drawBranchHand(ctx, hAngle, radius * 0.45, 4, '#1A1005');
            drawBranchHand(ctx, mAngle, radius * 0.7, 3, '#1A1005');

            // --- Spawn Minute Bars (Falling Debris) ---
            if (sec !== lastSecond) { // Trigger on second change
                lastSecond = sec;
                fallingItems.push({
                    x: centerX + (Math.random() * 20 - 10),
                    y: clockY + radius + 30, // Start falling from the melt point
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: 0,
                    vr: (Math.random() - 0.5) * 0.3,
                    angle: Math.random() * Math.PI,
                    size: Math.random() * 10 + 5
                });
            }

            ctx.restore();

            // --- 4. Animate Falling Items (Debris) ---
            ctx.save();
            fallingItems.forEach((item, idx) => {
                item.vy += 0.15; // Gravity
                item.x += item.vx;
                item.y += item.vy;
                item.angle += item.vr;

                // Hit vessel logic
                if (item.y > vesselY + 120 - fluidLevel) {
                    fallingItems.splice(idx, 1);
                    return;
                }

                ctx.translate(item.x, item.y);
                ctx.rotate(item.angle);

                // Draw Debris (Jagged shard)
                ctx.fillStyle = '#2F1B10';
                ctx.beginPath();
                ctx.moveTo(-2, -item.size / 2);
                ctx.lineTo(2, -item.size / 2);
                ctx.lineTo(0, item.size / 2);
                ctx.fill();

                ctx.rotate(-item.angle);
                ctx.translate(-item.x, -item.y);
            });
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        const drawBranchHand = (ctx, angle, length, width, color) => {
            ctx.save();
            ctx.rotate(angle);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(0, 0);
            // Zig-zag branch like line
            const mid = length * 0.6;
            ctx.quadraticCurveTo(mid, width * 4, length, 0);
            ctx.stroke();

            // Small off-shoot branch
            ctx.beginPath();
            ctx.moveTo(mid, width * 2);
            ctx.lineTo(mid + 10, width * 4);
            ctx.lineWidth = width * 0.5;
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
                width: '450px',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        />
    );
}
