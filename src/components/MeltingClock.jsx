```javascript
import { useEffect, useRef } from 'react';
import clockVideo from '../assets/clock_bg.mp4';

export default function MeltingClock({ isWorking }) {
    const canvasRef = useRef(null);

    // --- CONFIGURATION FOR ALIGNMENT ---
    // You may need to tweak these values to match the video perfectly
    const CLOCK = {
        x: 0.55, // Percentage of width from left (0 to 1) - relative to video container
        y: 0.22, // Percentage of height from top (0 to 1)
        radius: 100 // Radius in pixels (approx)
    };
    
    useEffect(() => {
        if (!isWorking) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const width = 450; // Match container width
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Calculate actual pixel positions based on container size
        const centerX = width * CLOCK.x;
        const centerY = height * CLOCK.y;
        const radius = CLOCK.radius;

        let fallingItems = []; 
        let lastSecond = new Date().getSeconds();

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            const now = new Date();
            const sec = now.getSeconds();
            const min = now.getMinutes();
            const hr = now.getHours();
            const millis = now.getMilliseconds();
            const smoothSec = sec + millis / 1000;

            // --- 1. Draw Hands (Overlaying the video) ---
            // Assuming the video has an empty face or we draw over it. 
            // If the video has hands, we might be doubling them, but user wanted "logic".
            
            const hAngle = ((hr % 12) + min / 60) * (Math.PI * 2) / 12 - Math.PI / 2;
            const mAngle = (min + smoothSec / 60) * (Math.PI * 2) / 60 - Math.PI / 2;
            
            // Draw darker hands to contrast with potential video brightness
            drawBranchHand(ctx, centerX, centerY, hAngle, radius * 0.45, 5, '#1A1005');
            drawBranchHand(ctx, centerX, centerY, mAngle, radius * 0.7, 3, '#1A1005');

            // --- 2. Spawn Minute Bars (Falling Logic) ---
            if (sec !== lastSecond) { 
                 lastSecond = sec;
                 fallingItems.push({
                     x: centerX + (Math.random() * 20 - 10),
                     y: centerY + radius * 0.8, // Start falling from lower part of dial
                     vx: (Math.random() - 0.5) * 1,
                     vy: 0,
                     vr: (Math.random() - 0.5) * 0.3,
                     angle: Math.random() * Math.PI,
                     size: Math.random() * 10 + 5
                 });
            }

            // --- 3. Animate Falling Items ---
            ctx.save();
            fallingItems.forEach((item, idx) => {
                item.vy += 0.15; 
                item.x += item.vx;
                item.y += item.vy;
                item.angle += item.vr;

                // Remove when off screen
                if (item.y > height) {
                    fallingItems.splice(idx, 1);
                    return;
                }

                ctx.translate(item.x, item.y);
                ctx.rotate(item.angle);
                
                // Draw falling debris
                ctx.fillStyle = '#1A1005';
                ctx.beginPath();
                ctx.moveTo(-2, -item.size/2);
                ctx.lineTo(2, -item.size/2);
                ctx.lineTo(0, item.size/2);
                ctx.fill();

                ctx.rotate(-item.angle);
                ctx.translate(-item.x, -item.y);
            });
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        const drawBranchHand = (ctx, cx, cy, angle, length, width, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(0,0);
            const mid = length * 0.6;
            ctx.quadraticCurveTo(mid, width*3, length, 0);
            ctx.stroke();
            
            ctx.restore();
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isWorking]);

    if (!isWorking) return null;

    return (
        <div className="animate-fade-in" style={{ 
            position: 'fixed', 
            right: 0, 
            top: 0, 
            width: '450px', 
            height: '100vh', 
            zIndex: 10,
            pointerEvents: 'none'
        }}>
            {/* The Cinematic Background */}
            <video 
                src={clockVideo} 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    maskImage: 'linear-gradient(to left, black 80%, transparent 100%)', // Fade out left edge
                    WebkitMaskImage: 'linear-gradient(to left, black 80%, transparent 100%)'
                }}
            />
            
            {/* The Dynamic Overlay */}
            <canvas 
                ref={canvasRef}
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }} 
            />
        </div>
    );
}
```
