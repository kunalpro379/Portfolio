"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Zap, Home, Briefcase, Trophy, Users } from "lucide-react";

const locations = [
  { id: 1, name: "Home Base", icon: Home, x: 30, y: 40, color: "bg-sky-500" },
  { id: 2, name: "Tech Hub", icon: Briefcase, x: 60, y: 25, color: "bg-purple-500" },
  { id: 3, name: "Arena", icon: Trophy, x: 75, y: 60, color: "bg-yellow-500" },
  { id: 4, name: "Community Center", icon: Users, x: 45, y: 70, color: "bg-green-500" },
  { id: 5, name: "Power Station", icon: Zap, x: 20, y: 65, color: "bg-red-500" },
];

export default function MapPage() {
  const [playerPos, setPlayerPos] = useState({ x: 30, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const speed = 2;
      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (e.key === "ArrowUp" || e.key === "w") newY = Math.max(5, prev.y - speed);
        if (e.key === "ArrowDown" || e.key === "s") newY = Math.min(95, prev.y + speed);
        if (e.key === "ArrowLeft" || e.key === "a") newX = Math.max(5, prev.x - speed);
        if (e.key === "ArrowRight" || e.key === "d") newX = Math.min(95, prev.x + speed);

        return { x: newX, y: newY };
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.5, Math.min(2, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  return (
    <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Navigation className="text-sky-400" size={24} />
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Interactive Map</h1>
              <p className="text-xs text-white/40 uppercase tracking-wider">Use WASD or Arrow Keys to Move</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-white/60">
              Zoom: <span className="text-sky-400">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <div className="text-sm font-bold text-white/60">
              Position: <span className="text-sky-400">({playerPos.x.toFixed(0)}, {playerPos.y.toFixed(0)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full relative"
        onWheel={handleWheel}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            scale: zoom,
            x: offset.x,
            y: offset.y,
          }}
        >
          {/* Map Background - GTA Style */}
          <div className="w-full h-full relative">
            {/* Base Map Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-800 to-blue-900/20">
              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Roads */}
              <div className="absolute top-[40%] left-0 right-0 h-8 bg-zinc-700/50 border-y-2 border-yellow-500/30" />
              <div className="absolute left-[50%] top-0 bottom-0 w-8 bg-zinc-700/50 border-x-2 border-yellow-500/30" />
              <div className="absolute top-[70%] left-0 right-0 h-6 bg-zinc-700/40 border-y border-yellow-500/20" />
              <div className="absolute left-[25%] top-0 bottom-0 w-6 bg-zinc-700/40 border-x border-yellow-500/20" />

              {/* Buildings/Areas */}
              <div className="absolute top-[20%] left-[55%] w-32 h-32 bg-slate-700/60 border-2 border-white/20 rounded-lg" />
              <div className="absolute top-[25%] left-[15%] w-40 h-40 bg-slate-700/60 border-2 border-white/20 rounded-lg" />
              <div className="absolute top-[60%] left-[70%] w-48 h-36 bg-slate-700/60 border-2 border-white/20 rounded-lg" />
              <div className="absolute top-[65%] left-[35%] w-36 h-32 bg-slate-700/60 border-2 border-white/20 rounded-lg" />
              <div className="absolute top-[55%] left-[10%] w-28 h-28 bg-slate-700/60 border-2 border-white/20 rounded-lg" />

              {/* Water/Park Areas */}
              <div className="absolute top-[10%] right-[10%] w-40 h-40 bg-blue-900/40 border-2 border-blue-500/30 rounded-full" />
              <div className="absolute bottom-[10%] left-[60%] w-48 h-32 bg-green-900/40 border-2 border-green-500/30 rounded-lg" />
            </div>

            {/* Locations */}
            {locations.map((location) => (
              <motion.div
                key={location.id}
                className="absolute"
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                whileHover={{ scale: 1.2 }}
                onClick={() => setSelectedLocation(location.id)}
              >
                <div className={`relative ${location.color} p-4 rounded-full border-4 border-white/30 shadow-2xl cursor-pointer`}>
                  <location.icon className="text-white" size={24} />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-black/80 px-3 py-1 rounded-full text-xs font-black text-white uppercase">
                      {location.name}
                    </div>
                  </div>
                  {selectedLocation === location.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {/* Player */}
            <motion.div
              className="absolute z-50"
              style={{
                left: `${playerPos.x}%`,
                top: `${playerPos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-sky-500 rounded-full border-4 border-white shadow-2xl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                <MapPin className="absolute -top-8 left-1/2 -translate-x-1/2 text-sky-400" size={20} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 z-50">
        <h3 className="text-sm font-black text-white uppercase mb-3">Controls</h3>
        <div className="space-y-2 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">WASD</kbd>
            <span>or</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">↑↓←→</kbd>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">Scroll</kbd>
            <span>Zoom In/Out</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">Click</kbd>
            <span>Select Location</span>
          </div>
        </div>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-6 right-6 w-48 h-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-800 to-blue-900/20" />
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={`absolute w-2 h-2 ${loc.color} rounded-full`}
              style={{
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          <div
            className="absolute w-3 h-3 bg-sky-500 rounded-full border-2 border-white"
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
