import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw, 
  Grid, 
  Compass, 
  Maximize2 
} from 'lucide-react';

interface GalaxyVisualizer3DProps {
  coordinates: { x: number; y: number; z: number } | null;
  galaxyName?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  brightness: number;
  color: string;
  size: number;
}

export const GalaxyVisualizer3D: React.FC<GalaxyVisualizer3DProps> = ({ coordinates, galaxyName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Interactive navigation states
  const [yaw, setYaw] = useState<number>(1.2); // vertical/horizontal angle
  const [pitch, setPitch] = useState<number>(0.4); // vertical look angle
  const [zoom, setZoom] = useState<number>(220); // zoom sensitivity multiplier
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  
  // For mouse drag action tracker
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate a consistent, stable array of stars representing a spiral galaxy (4 Arms + Core cluster)
  const stars: Star[] = useMemo(() => {
    const list: Star[] = [];
    
    // 1. Central Core Cluster (glowing super-dense stars, 350 stars)
    for (let i = 0; i < 350; i++) {
      // Packed close to center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = Math.pow(Math.random(), 2.5) * 0.16; // heavily biased towards origin
      
      const x = dist * Math.sin(phi) * Math.cos(theta);
      const y = (dist * Math.sin(phi) * Math.sin(theta)) * 0.6; // slightly squashed vertically
      const z = dist * Math.cos(phi);

      list.push({
        x,
        y,
        z,
        brightness: 0.7 + Math.random() * 0.3,
        color: i % 10 === 0 ? '#E25530' : (i % 6 === 0 ? '#FFB451' : '#FFFFFF'),
        size: (1.2 + Math.random() * 1.8) * (1.0 - dist * 4)
      });
    }

    // 2. Spiral Arms (4 arms, dense trailing branches, total 650 stars)
    const numArms = 4;
    for (let i = 0; i < 650; i++) {
      const armIdx = i % numArms;
      const r = 0.12 + Math.pow(Math.random(), 1.2) * 0.88; // radial distance
      
      const armBaseAngle = (armIdx * Math.PI * 2) / numArms;
      const twistFactor = r * 4.6; // twist angle as function of radius
      const angle = armBaseAngle + twistFactor;

      // Outer dispersion spreads wider
      const dispersion = 0.09 * (r + 0.15);
      const dispX = (Math.random() - 0.5) * dispersion;
      const dispY = (Math.random() - 0.5) * 0.04 * (r + 0.1); // flatter disc
      const dispZ = (Math.random() - 0.5) * dispersion;

      const x = r * Math.cos(angle) + dispX;
      const y = dispY;
      const z = r * Math.sin(angle) + dispZ;

      // NMS Galaxy colors (Emerald, Orange-Red, Radioactive Blue, Golden, Pure White)
      const colorsPool = [
        '#E25530', // Orange-red
        '#22C55E', // Green
        '#3B82F6', // Blue
        '#FFB451', // Gold
        '#FFFFFF', // White
        '#FF3E6C'  // Vibrant pink
      ];
      // Distribute based on cluster patterns
      const color = colorsPool[Math.floor(Math.random() * colorsPool.length)];

      list.push({
        x,
        y,
        z,
        brightness: 0.3 + Math.random() * 0.7,
        color,
        size: 0.8 + Math.random() * 1.8
      });
    }
    return list;
  }, []);

  // Update loop using dynamic animation ticks
  useEffect(() => {
    let animationFrameId: number;
    let localYaw = yaw;

    const render = () => {
      // Auto rotation update
      if (autoRotate && !isDragging) {
        localYaw += 0.0035;
        setYaw(prev => (prev + 0.0035) % (Math.PI * 2));
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      
      // Clear viewport with a neat deep space dark background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Render minor background star grid lines to enrich depth
      ctx.strokeStyle = 'rgba(255, 5, 0, 0.03)';
      ctx.lineWidth = 0.5;
      
      const centerX = width / 2;
      const centerY = height / 2;

      // 3D Projection functions
      const project = (px: number, py: number, pz: number) => {
        // Rotate around Y-axis (Yaw)
        const cosY = Math.cos(localYaw);
        const sinY = Math.sin(localYaw);
        const xRotate = px * cosY - pz * sinY;
        const zRotate = px * sinY + pz * cosY;

        // Rotate around X-axis (Pitch)
        const cosX = Math.cos(pitch);
        const sinX = Math.sin(pitch);
        const yRotate = py * cosX - zRotate * sinX;
        const zDepth = py * sinX + zRotate * cosX; // Depth factor

        // Convert centered coordinates into proper responsive projection
        // Use perspective calculation 
        // Normal range of depth is roughly -1.0 to 1.0. Lower values are further, higher are closer
        const perspective = 2.0 / (2.1 - zDepth); 
        
        return {
          x: centerX + xRotate * zoom * perspective,
          y: centerY + yRotate * zoom * perspective,
          depth: zDepth,
          scale: perspective
        };
      };

      // 1. Draw central coordinate grid base for technical feeling
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 180, 81, 0.08)';
        ctx.lineWidth = 1;

        // Draw concentric circular flat bands (representing galactic sectors radial rings)
        for (let r = 0.25; r <= 1.0; r += 0.25) {
          ctx.beginPath();
          for (let step = 0; step <= 32; step++) {
            const angle = (step * Math.PI * 2) / 32;
            const gx = r * Math.cos(angle);
            const gy = 0;
            const gz = r * Math.sin(angle);
            const proj = project(gx, gy, gz);
            
            if (step === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Draw galactic sector axis indicators
        ctx.strokeStyle = 'rgba(255, 5, 0, 0.12)';
        ctx.beginPath();
        // X-axis
        const pX1 = project(-1.0, 0, 0);
        const pX2 = project(1.0, 0, 0);
        ctx.moveTo(pX1.x, pX1.y);
        ctx.lineTo(pX2.x, pX2.y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(34, 197, 94, 0.12)';
        ctx.beginPath();
        // Y-axis (height gauge)
        const pY1 = project(0, -0.4, 0);
        const pY2 = project(0, 0.4, 0);
        ctx.moveTo(pY1.x, pY1.y);
        ctx.lineTo(pY2.x, pY2.y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.beginPath();
        // Z-axis
        const pZ1 = project(0, 0, -1.0);
        const pZ2 = project(0, 0, 1.0);
        ctx.moveTo(pZ1.x, pZ1.y);
        ctx.lineTo(pZ2.x, pZ2.y);
        ctx.stroke();
      }

      // Sort stars based on depth prior to rendering for proper painter algorithm sorting order
      const renderedStars = stars.map(star => {
        const proj = project(star.x, star.y, star.z);
        return { star, proj };
      }).sort((a, b) => a.proj.depth - b.proj.depth);

      // Render background universe stars
      renderedStars.forEach(({ star, proj }) => {
        // Skip stars way off the visual canvas bounds
        if (proj.x < 0 || proj.x > width || proj.y < 0 || proj.y > height) return;

        const baseSize = star.size * proj.scale;
        
        ctx.fillStyle = star.color;
        
        // Add subtle depth opacity mapping
        const opacity = Math.min(1.0, Math.max(0.15, (proj.depth + 1.1) / 2));
        ctx.globalAlpha = star.brightness * opacity;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(0.4, baseSize), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0; // Reset alpha

      // 2. Render targeted system coordinates with spectacular high-contrast holographic radar highlight
      if (coordinates) {
        // Scale Galactic coordinate range from 0..4095 split range to matching spiral space limit
        const rawNX = (coordinates.x - 2047) / 2047;
        const rawNY = (coordinates.y - 127) / 127;
        const rawNZ = (coordinates.z - 2047) / 2047;

        // Shrink slightly to cluster inside stellar arm limits comfortably
        const targetX = rawNX * 0.72;
        const targetY = rawNY * 0.35; // height offset is flat
        const targetZ = rawNZ * 0.72;

        const projTarget = project(targetX, targetY, targetZ);
        const projFloor = project(targetX, 0, targetZ); // Reference grid plane point

        const now = Date.now();

        // High precision vertical drop axis connection indicator standard in NMS
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#FF0500';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(projTarget.x, projTarget.y);
        ctx.lineTo(projFloor.x, projFloor.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw flat anchor ring on plane floor
        ctx.strokeStyle = 'rgba(255, 5, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(projFloor.x, projFloor.y, 6 * projFloor.scale, 2 * projFloor.scale * Math.abs(Math.sin(pitch)), 0, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsating system marker halo
        const pulseRatio = 1.0 + Math.sin(now / 180) * 0.3;
        const ringRadius = 13 * pulseRatio * projTarget.scale;

        // High contrast vector circles
        ctx.strokeStyle = '#FFE051';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(projTarget.x, projTarget.y, Math.max(4, ringRadius), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#FF0500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(projTarget.x, projTarget.y, Math.max(1, 4 * projTarget.scale), 0, Math.PI * 2);
        ctx.stroke();

        // Draw crosshair corners around system element
        const cs = 7 * projTarget.scale; // crosshair size
        ctx.strokeStyle = '#FFB451';
        ctx.lineWidth = 1.2;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(projTarget.x - cs, projTarget.y - cs + 3);
        ctx.lineTo(projTarget.x - cs, projTarget.y - cs);
        ctx.lineTo(projTarget.x - cs + 3, projTarget.y - cs);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(projTarget.x + cs, projTarget.y - cs + 3);
        ctx.lineTo(projTarget.x + cs, projTarget.y - cs);
        ctx.lineTo(projTarget.x - 3 + cs, projTarget.y - cs);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(projTarget.x - cs, projTarget.y + cs - 3);
        ctx.lineTo(projTarget.x - cs, projTarget.y + cs);
        ctx.lineTo(projTarget.x - cs + 3, projTarget.y + cs);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(projTarget.x + cs, projTarget.y + cs - 3);
        ctx.lineTo(projTarget.x + cs, projTarget.y + cs);
        ctx.lineTo(projTarget.x - 3 + cs, projTarget.y + cs);
        ctx.stroke();

        // Floating Target text display tags
        ctx.fillStyle = '#FFB451';
        ctx.font = 'bold 11px "geonms-font", "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SIGNAL TARGET', projTarget.x + cs + 5, projTarget.y - 4);
      }

      // Compass UI Compass rosette visual indicator in bottom left corner
      ctx.strokeStyle = 'rgba(255, 180, 81, 0.4)';
      ctx.lineWidth = 1.2;
      const compX = 40;
      const compY = height - 40;
      ctx.beginPath();
      ctx.arc(compX, compY, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Dynamic arrow towards Galactic Center
      const rotCenterX = -localYaw;
      const dx = Math.cos(rotCenterX);
      const dy = Math.sin(rotCenterX);
      
      ctx.strokeStyle = '#FF0500';
      ctx.beginPath();
      ctx.moveTo(compX, compY);
      ctx.lineTo(compX + dx * 16, compY + dy * 16 * Math.sin(pitch));
      ctx.stroke();

      ctx.fillStyle = '#FFB451';
      ctx.font = '8px "geonms-font", "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CORE', compX, compY - 22);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [yaw, pitch, zoom, autoRotate, showGrid, isDragging, coordinates, stars]);

  // Adjust canvas scale ratio for dynamic HighDPI retinas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setAutoRotate(false); // Disable auto rotation upon manual interaction click
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setYaw(prev => (prev - deltaX * 0.006) % (Math.PI * 2));
    setPitch(prev => Math.max(-1.3, Math.min(1.3, prev - deltaY * 0.006)));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch interactions handler for iPad / Mobile layout support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setAutoRotate(false);
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    const deltaY = e.touches[0].clientY - lastMousePos.current.y;
    
    setYaw(prev => (prev - deltaX * 0.008) % (Math.PI * 2));
    setPitch(prev => Math.max(-1.3, Math.min(1.3, prev - deltaY * 0.008)));
    
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // Wheel tracking zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom(prev => Math.max(90, Math.min(480, prev - e.deltaY * 0.35)));
  };

  // Control overlay resets
  const handleReset = () => {
    setYaw(1.2);
    setPitch(0.4);
    setZoom(220);
    setAutoRotate(true);
  };

  return (
    <div className="bg-zinc-950/90 border border-[#FF0500] rounded-xl overflow-hidden p-4 shadow-2xl relative z-10 space-y-3">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#FFB451] animate-pulse" />
          <span 
            className="text-xs font-bold tracking-widest text-[#FFB451] uppercase"
            style={{ fontFamily: '"geonms-font", "Space Grotesk", sans-serif' }}
          >
            AGT Mini Navi Region Locator
          </span>
        </div>
        
        {/* Connection health indicator badge */}
        <div className="flex items-center gap-1.5 self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="text-[9px] font-mono text-[#FFB451]/60 uppercase tracking-widest font-semibold select-none">
            ACTIVE TARGET LOCK
          </span>
        </div>
      </div>

      {/* Interactive canvas module */}
      <div className="relative w-full aspect-video md:aspect-[16/10] bg-zinc-950 rounded-lg overflow-hidden border border-[#FF0500]/30 select-none cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Floating Quick Action overlay bar */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-lg backdrop-blur-md">
          <button
            onClick={() => setZoom(prev => Math.min(480, prev + 25))}
            title="Zoom In"
            className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-[#FFB451] border border-zinc-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(90, prev - 25))}
            title="Zoom Out"
            className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-[#FFB451] border border-zinc-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowGrid(prev => !prev)}
            title="Toggle Planes Grid"
            className={`p-1.5 rounded border transition-all cursor-pointer ${
              showGrid 
                ? 'bg-[#E25530] text-black border-[#FF0500]' 
                : 'bg-zinc-950 hover:bg-zinc-800 text-[#FFB451]/40 border-zinc-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            title="Toggle Orbital Auto-Rotation"
            className={`p-1.5 rounded border transition-all cursor-pointer ${
              autoRotate 
                ? 'bg-[#E25530] text-black border-[#FF0500]' 
                : 'bg-zinc-950 hover:bg-zinc-800 text-[#FFB451]/40 border-zinc-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </button>
          <button
            onClick={handleReset}
            title="Reset Visual Angle"
            className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-[#FFB451] border border-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Help instructions floating badge */}
        <div className="absolute left-3 top-3 bg-zinc-950/80 border border-zinc-900 rounded px-2.5 py-1.5 pointer-events-none select-none text-[11px] font-mono text-zinc-400">
          DRAG TO ROTATE // WHEEL OR SCROLL TO ZOOM
        </div>
      </div>

      {/* Target status details bar */}
      <div className="bg-zinc-900/40 border border-zinc-950 rounded-lg p-3 text-[12px] font-mono text-[#FFB451]/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-zinc-500 uppercase text-[10px] tracking-wider block">SIGNAL LOCK LOCATION</span>
          <p className="font-extrabold text-[#E25530] mt-0.5 text-[13px]">
            {coordinates 
              ? `X: ${coordinates.x.toString(16).toUpperCase().padStart(4, '0')} | Y: ${coordinates.y.toString(16).toUpperCase().padStart(4, '0')} | Z: ${coordinates.z.toString(16).toUpperCase().padStart(4, '0')}`
              : 'NULL SIGNAL WAITING'
            }
          </p>
        </div>
        <div className="text-right sm:text-right hidden sm:block">
          <span className="text-zinc-500 uppercase text-[10px] tracking-wider block">SECTOR REGISTRY</span>
          <p className="text-zinc-400 mt-0.5 font-bold text-[13px]">
            {(() => {
              const name = galaxyName || 'Euclid';
              return name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            })()} Galaxy
          </p>
        </div>
      </div>
    </div>
  );
};
