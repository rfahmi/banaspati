import React, { useRef, useEffect, useState } from 'react';

export default function App() {
    const flameCanvasRef = useRef(null);
    const faceCanvasRef = useRef(null);

    // State for our UI controls
    const [params, setParams] = useState({
        // Flame
        color: '#4db8ff',
        wind: 0,
        riseSpeed: 1,
        size: 1.2,
        turbulence: 25,
        noiseFreq: 0.015,
        sparkCount: 12,

        // Face
        showFace: true,
        faceColor: '#ffffff',
        eyeSpacing: 16,
        eyeSize: 5,
        eyeSquint: 0,
        eyeTilt: 0,       // NEW: Angle of the eyes (negative for sad, positive for angry)
        mouthWidth: 8,
        mouthOpen: 0,
        mouthSmile: 6,
        mouthY: 14
    });

    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    }, [params]);

    // Physics engine reference
    const physicsRef = useRef({
        cx: 0, cy: 0,
        targetCx: 0, targetCy: 0,
        vx: 0, vy: 0,
        isDragging: false,
        lastMouseX: 0, lastMouseY: 0,
        blinkTimer: 0,
        initialized: false
    });

    useEffect(() => {
        const flameCanvas = flameCanvasRef.current;
        const faceCanvas = faceCanvasRef.current;
        const ctxFlame = flameCanvas.getContext('2d');
        const ctxFace = faceCanvas.getContext('2d');

        let animationFrameId;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const setDimensions = () => {
            flameCanvas.width = width;
            flameCanvas.height = height;
            faceCanvas.width = width;
            faceCanvas.height = height;
        };
        setDimensions();

        const p = physicsRef.current;
        if (!p.initialized) {
            p.cx = width * 0.35;
            p.cy = height * 0.5 + 80;
            p.targetCx = p.cx;
            p.targetCy = p.cy;
            p.initialized = true;
        }

        const baseBlobs = [
            { angle: 0, speed: 0.02, radius: 50, orbit: 12 },
            { angle: 2.1, speed: 0.03, radius: 55, orbit: 8 },
            { angle: 4.2, speed: 0.025, radius: 45, orbit: 15 },
            { angle: 1.0, speed: 0.04, radius: 40, orbit: 5 },
        ];

        class Spark {
            constructor(initial = false) {
                this.reset(initial);
            }
            reset(initial = false) {
                const cParams = paramsRef.current;
                const phys = physicsRef.current;

                this.x = phys.cx + (Math.random() - 0.5) * 40 * cParams.size;
                this.y = initial ? phys.cy - Math.random() * 250 : phys.cy + (Math.random() - 0.5) * 20;

                this.baseRadius = 10 + Math.random() * 12;
                this.baseVy = 1.5 + Math.random() * 2.5;
                this.baseShrink = 0.15 + Math.random() * 0.2;

                this.radius = this.baseRadius * cParams.size;
                this.wobbleSpeed = 0.05 + Math.random() * 0.05;
                this.wobbleOffset = Math.random() * Math.PI * 2;

                this.vx = phys.vx * 0.2;
                this.vy = phys.vy * 0.2;
            }

            update(time) {
                const { wind, riseSpeed } = paramsRef.current;
                this.y += this.vy - (this.baseVy * riseSpeed);
                this.x += Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * 1.5 + parseFloat(wind) + this.vx;
                this.radius -= this.baseShrink * riseSpeed;

                this.vx *= 0.92;
                this.vy *= 0.92;

                if (this.radius <= 0 || this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
                    this.reset();
                }
            }

            draw(ctx) {
                if (this.radius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const maxSparks = 50;
        const sparks = Array.from({ length: maxSparks }, () => new Spark(true));
        let time = 0;

        const render = () => {
            time += 1;
            const cParams = paramsRef.current;
            const phys = physicsRef.current;

            // --- PHYSICS & INERTIA ---
            if (!phys.isDragging) {
                phys.targetCx += phys.vx;
                phys.targetCy += phys.vy;
                phys.vx *= 0.93;
                phys.vy *= 0.93;

                const margin = 60 * cParams.size;
                if (phys.targetCx < margin) { phys.targetCx = margin; phys.vx *= -0.7; }
                if (phys.targetCx > width - margin) { phys.targetCx = width - margin; phys.vx *= -0.7; }
                if (phys.targetCy < margin) { phys.targetCy = margin; phys.vy *= -0.7; }
                if (phys.targetCy > height - margin) { phys.targetCy = height - margin; phys.vy *= -0.7; }
            }

            phys.cx += (phys.targetCx - phys.cx) * 0.15;
            phys.cy += (phys.targetCy - phys.cy) * 0.15;

            // --- RENDER FLAME ---
            ctxFlame.clearRect(0, 0, width, height);
            ctxFlame.fillStyle = cParams.color;

            baseBlobs.forEach(blob => {
                blob.angle += blob.speed;
                const x = phys.cx + Math.cos(blob.angle) * blob.orbit * cParams.size;
                const y = phys.cy + Math.sin(blob.angle) * blob.orbit * cParams.size;
                ctxFlame.beginPath();
                ctxFlame.arc(x, y, blob.radius * cParams.size, 0, Math.PI * 2);
                ctxFlame.fill();
            });

            for (let i = 0; i < cParams.sparkCount; i++) {
                sparks[i].update(time);
                sparks[i].draw(ctxFlame);
            }

            // --- RENDER FACE ---
            ctxFace.clearRect(0, 0, width, height);

            if (cParams.showFace) {
                const lookX = Math.max(-20, Math.min(20, phys.vx * 0.6));
                const lookY = Math.max(-20, Math.min(20, phys.vy * 0.6));
                const faceWobbleY = Math.sin(time * 0.05) * 2 * cParams.size;

                const fx = phys.cx + lookX;
                const fy = phys.cy + lookY - 10 * cParams.size + faceWobbleY;

                const eSpace = cParams.eyeSpacing * cParams.size;
                const eSize = cParams.eyeSize * cParams.size;
                let eSquint = cParams.eyeSquint;

                if (Math.random() < 0.006 && phys.blinkTimer <= 0) phys.blinkTimer = 10;
                if (phys.blinkTimer > 0) {
                    phys.blinkTimer--;
                    eSquint = 1;
                }

                ctxFace.fillStyle = cParams.faceColor;
                ctxFace.strokeStyle = cParams.faceColor;
                ctxFace.lineWidth = Math.max(2, 3 * cParams.size);
                ctxFace.lineCap = 'round';
                ctxFace.shadowColor = cParams.faceColor;
                ctxFace.shadowBlur = 12;

                // Make base eye slightly oval (pill-shaped) so rotation is visible
                const eyeHeight = Math.max(0.2, eSize * 1.35 * (1 - eSquint));
                // Convert UI degree tilt to Radians
                const tiltRad = (cParams.eyeTilt * Math.PI) / 180;

                // Left Eye
                ctxFace.beginPath();
                ctxFace.ellipse(fx - eSpace, fy, eSize, eyeHeight, tiltRad, 0, Math.PI * 2);
                ctxFace.fill();

                // Right Eye
                ctxFace.beginPath();
                ctxFace.ellipse(fx + eSpace, fy, eSize, eyeHeight, -tiltRad, 0, Math.PI * 2);
                ctxFace.fill();

                // Mouth
                const mY = fy + cParams.mouthY * cParams.size;
                const mW = cParams.mouthWidth * cParams.size;
                const mOpen = cParams.mouthOpen * cParams.size;
                const mSmile = cParams.mouthSmile * cParams.size;

                ctxFace.beginPath();
                if (mOpen > 0.5) {
                    ctxFace.ellipse(fx, mY + mOpen / 2, mW, mOpen, 0, 0, Math.PI * 2);
                    ctxFace.fill();
                } else {
                    ctxFace.moveTo(fx - mW, mY);
                    ctxFace.quadraticCurveTo(fx, mY + mSmile, fx + mW, mY);
                    ctxFace.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            setDimensions();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handlePointerDown = (e) => {
        const p = physicsRef.current;
        const dx = e.clientX - p.cx;
        const dy = e.clientY - p.cy;
        if (Math.sqrt(dx * dx + dy * dy) < 120 * params.size) {
            p.isDragging = true;
            p.lastMouseX = e.clientX;
            p.lastMouseY = e.clientY;
            p.vx = 0;
            p.vy = 0;
        }
    };

    const handlePointerMove = (e) => {
        const p = physicsRef.current;
        if (p.isDragging) {
            p.targetCx = e.clientX;
            p.targetCy = e.clientY;
            p.vx = e.clientX - p.lastMouseX;
            p.vy = e.clientY - p.lastMouseY;
            p.lastMouseX = e.clientX;
            p.lastMouseY = e.clientY;
        }
    };

    const handlePointerUp = () => {
        physicsRef.current.isDragging = false;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setParams(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'color' ? value : parseFloat(value))
        }));
    };

    const applyPreset = (overrides) => setParams(prev => ({ ...prev, ...overrides }));

    return (
        <div 
      className= "relative w-screen h-screen bg-[#111116] overflow-hidden m-0 p-0 font-sans touch-none select-none"
    onPointerDown = { handlePointerDown }
    onPointerMove = { handlePointerMove }
    onPointerUp = { handlePointerUp }
    onPointerLeave = { handlePointerUp }
    style = {{ cursor: physicsRef.current?.isDragging ? 'grabbing' : 'grab' }
}
    >

    {/* Filters */ }
    < svg width = "0" height = "0" className = "absolute" >
        <defs>
        <filter id="flame-filter" x = "-20%" y = "-20%" width = "140%" height = "140%" >
            <feGaussianBlur in="SourceGraphic" stdDeviation = "12" result = "blur" />
                <feColorMatrix in="blur" mode = "matrix" values = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" result = "goo" />
                    <feTurbulence type="fractalNoise" baseFrequency = { params.noiseFreq } numOctaves = "2" result = "noise" />
                        <feDisplacementMap in="goo" in2 = "noise" scale = { params.turbulence } xChannelSelector = "R" yChannelSelector = "G" />
                            </filter>
                            </defs>
                            </svg>

{/* Layer 1: The Liquid Flame */ }
<canvas ref={ flameCanvasRef } className = "absolute inset-0 w-full h-full block pointer-events-none" style = {{ filter: 'url(#flame-filter)' }} />

{/* Layer 2: The Face */ }
<canvas ref={ faceCanvasRef } className = "absolute inset-0 w-full h-full block pointer-events-none opacity-90" />

    {/* Control Panel */ }
    < div className = "absolute top-6 right-6 bottom-6 w-[340px] flex flex-col bg-[#1e1e27]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white pointer-events-auto z-10 overflow-hidden" >

        <div className="p-6 pb-4 border-b border-white/10 shrink-0" >
            <h2 className="text-xl font-bold flex items-center gap-2" > Spirit Controls </h2>
                </div>

                < div className = "p-6 overflow-y-auto space-y-8 custom-scrollbar" >

                    {/* Presets */ }
                    < div className = "space-y-3" >
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider" > Expressions </label>
                            < div className = "grid grid-cols-2 gap-2" >
                                <PresetBtn label="Happy" onClick = {() => applyPreset({ showFace: true, eyeSquint: 0, eyeTilt: 0, mouthOpen: 0, mouthSmile: 8, mouthWidth: 10, eyeSpacing: 16, mouthY: 14 })} />
                                    < PresetBtn label = "Angry" onClick = {() => applyPreset({ showFace: true, eyeSquint: 0.2, eyeTilt: 35, mouthOpen: 0, mouthSmile: -5, mouthWidth: 8, eyeSpacing: 12, mouthY: 16 })} />
                                        < PresetBtn label = "Sad" onClick = {() => applyPreset({ showFace: true, eyeSquint: 0.1, eyeTilt: -25, mouthOpen: 0, mouthSmile: -6, mouthWidth: 6, eyeSpacing: 18, mouthY: 16 })} />
                                            < PresetBtn label = "Surprised" onClick = {() => applyPreset({ showFace: true, eyeSquint: 0, eyeTilt: 0, mouthOpen: 12, mouthSmile: 0, mouthWidth: 6, eyeSpacing: 18, mouthY: 16 })} />
                                                < PresetBtn label = "Sleepy" onClick = {() => applyPreset({ showFace: true, eyeSquint: 0.8, eyeTilt: -10, mouthOpen: 0, mouthSmile: 2, mouthWidth: 6, eyeSpacing: 14, mouthY: 12 })} />
                                                    < PresetBtn label = "Derp" onClick = {() => applyPreset({ showFace: true, eyeSquint: 0, eyeTilt: 15, mouthOpen: 0, mouthSmile: -2, mouthWidth: 15, eyeSpacing: 25, mouthY: 15 })} />
                                                        </div>
                                                        </div>

{/* Face Parameters */ }
<div className="space-y-5" >
    <div className="flex items-center justify-between pb-2 border-b border-white/5" >
        <label className="text-sm font-bold text-cyan-300" > Face Enabled </label>
            < input type = "checkbox" name = "showFace" checked = { params.showFace } onChange = { handleChange } className = "w-5 h-5 accent-cyan-400 cursor-pointer" />
                </div>

{
    params.showFace && (
        <>
        <ControlSlider label="Eye Tilt" name = "eyeTilt" min = "-45" max = "45" step = "1" value = { params.eyeTilt } onChange = { handleChange } />
            <ControlSlider label="Eye Spacing" name = "eyeSpacing" min = "5" max = "30" step = "1" value = { params.eyeSpacing } onChange = { handleChange } />
                <ControlSlider label="Eye Size" name = "eyeSize" min = "2" max = "15" step = "0.5" value = { params.eyeSize } onChange = { handleChange } />
                    <ControlSlider label="Eye Squint" name = "eyeSquint" min = "0" max = "1" step = "0.05" value = { params.eyeSquint } onChange = { handleChange } />
                        <div className="h-2" />
                            <ControlSlider label="Mouth Width" name = "mouthWidth" min = "2" max = "25" step = "1" value = { params.mouthWidth } onChange = { handleChange } />
                                <ControlSlider label="Mouth Open" name = "mouthOpen" min = "0" max = "25" step = "0.5" value = { params.mouthOpen } onChange = { handleChange } />
                                    <ControlSlider label="Mouth Smile" name = "mouthSmile" min = "-15" max = "15" step = "1" value = { params.mouthSmile } onChange = { handleChange } />
                                        <ControlSlider label="Mouth Position Y" name = "mouthY" min = "0" max = "30" step = "1" value = { params.mouthY } onChange = { handleChange } />
                                            </>
            )
}
</div>

    < div className = "w-full h-px bg-white/10" />

        {/* Flame Parameters */ }
        < div className = "space-y-5" >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2" > Flame Physics </label>
                < div className = "flex items-center justify-between" >
                    <label className="text-sm text-gray-300" > Body Color </label>
                        < input type = "color" name = "color" value = { params.color } onChange = { handleChange } className = "w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                            </div>
                            < ControlSlider label = "Flame Size" name = "size" min = "0.5" max = "2.5" step = "0.1" value = { params.size } onChange = { handleChange } />
                                <ControlSlider label="Rise Speed" name = "riseSpeed" min = "0.5" max = "3" step = "0.1" value = { params.riseSpeed } onChange = { handleChange } />
                                    <ControlSlider label="Wind Drift" name = "wind" min = "-5" max = "5" step = "0.1" value = { params.wind } onChange = { handleChange } />
                                        <ControlSlider label="Turbulence" name = "turbulence" min = "0" max = "60" step = "1" value = { params.turbulence } onChange = { handleChange } />
                                            <ControlSlider label="Spark Count" name = "sparkCount" min = "0" max = "50" step = "1" value = { params.sparkCount } onChange = { handleChange } />
                                                </div>
                                                </div>
                                                </div>

{/* Scrollbar CSS Injection */ }
<style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

function ControlSlider({ label, name, min, max, step, value, onChange }) {
    return (
        <div className= "flex flex-col gap-1.5" >
        <div className="flex justify-between items-end text-sm text-gray-300" >
            <label htmlFor={ name }> { label } </label>
                < span className = "font-mono text-gray-400 text-xs" > { value } </span>
                    </div>
                    < input
    id = { name } type = "range" name = { name } min = { min } max = { max } step = { step } value = { value } onChange = { onChange }
    className = "w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 outline-none"
        />
        </div>
  );
}

function PresetBtn({ label, onClick }) {
    return (
        <button 
      onClick= { onClick }
    className = "px-3 py-2 text-sm bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-colors text-gray-200 active:scale-95"
        >
        { label }
        </button>
  );
}