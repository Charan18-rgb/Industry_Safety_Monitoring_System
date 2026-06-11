'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Map, Users, AlertTriangle, Activity, Cpu, Shield, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { mockZones, mockEquipment } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import type { Equipment } from '@/types';
import { useLiveSensorStore } from '@/store';

const ZONE_COLORS: Record<string, { bg: string; border: string; glow: string; label: string }> = {
  safe: { bg: 'rgba(0,255,136,0.08)', border: '#00ff88', glow: '0 0 20px rgba(0,255,136,0.2)', label: 'text-green-400' },
  caution: { bg: 'rgba(255,184,0,0.08)', border: '#ffb800', glow: '0 0 20px rgba(255,184,0,0.2)', label: 'text-amber-400' },
  danger: { bg: 'rgba(255,51,85,0.10)', border: '#ff3355', glow: '0 0 25px rgba(255,51,85,0.25)', label: 'text-red-400' },
  evacuate: { bg: 'rgba(255,51,85,0.20)', border: '#ff3355', glow: '0 0 30px rgba(255,51,85,0.4)', label: 'text-red-400' },
};

const EQ_STATUS_COLORS: Record<string, string> = {
  operational: '#00ff88',
  degraded: '#ffb800',
  critical: '#ff3355',
  offline: '#3a5a7a',
  maintenance: '#00d4ff',
};

function EquipmentNode({ equipment }: { equipment: Equipment }) {
  const color = EQ_STATUS_COLORS[equipment.status] ?? '#7fa3c4';
  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Cpu className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-medium truncate">{equipment.name}</div>
        <div className="text-[#3a5a7a] text-[10px] font-mono">{equipment.zone}</div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="text-xs font-bold font-mono" style={{ color }}>{equipment.healthScore}%</div>
        <div className="text-[10px] capitalize" style={{ color, opacity: 0.7 }}>{equipment.status}</div>
      </div>
    </div>
  );
}

interface Room {
  id: string; x: number; y: number; w: number; h: number; name: string; status: string;
}

interface Sensor {
  id: string; type: string; x: number; y: number; reading: string; status: string; room: string;
}

interface ZoneStats {
  id: string;
  status: string;
  riskScore: number;
  workerCount: number;
  activeAlerts: number;
  sensors: number;
}

export default function DigitalTwinPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneStats | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setSelectedSensor(null);
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setSelectedRoom(null);
  };

  const { data } = useLiveSensorStore();
  const tempStatus = data?.temperature && data.temperature > 60 ? 'critical' : data?.temperature && data.temperature > 40 ? 'warning' : 'safe';
  const gasStatus = data?.gasLevel && data.gasLevel > 80 ? 'critical' : data?.gasLevel && data.gasLevel > 40 ? 'warning' : 'safe';
  const machineStatus = data?.machineFault ? 'critical' : 'safe';

  const rooms = [
    { id: 'entrance', x: 20, y: 20, w: 120, h: 80, name: 'Entrance', status: 'safe' },
    { id: 'safetyGate', x: 160, y: 20, w: 120, h: 80, name: 'Safety Gate', status: 'safe' },
    { id: 'controlRoom', x: 80, y: 480, w: 200, h: 100, name: 'Control Room', status: 'safe' },
    { id: 'gasRoom', x: 80, y: 80, w: 200, h: 150, name: 'Gas Monitoring', status: gasStatus },
    { id: 'tempRoom', x: 320, y: 80, w: 200, h: 150, name: 'Temperature Monitoring', status: tempStatus },
    { id: 'machineArea', x: 80, y: 260, w: 440, h: 200, name: 'Machine Area', status: machineStatus },
    { id: 'storage', x: 560, y: 80, w: 200, h: 380, name: 'Storage', status: 'safe' },
    { id: 'maintenance', x: 560, y: 480, w: 200, h: 100, name: 'Maintenance', status: 'safe' },
    { id: 'emergencyExit', x: 720, y: 500, w: 60, h: 80, name: 'Emergency Exit', status: 'safe' },
  ];

  const sensors = [
    { id: 'gas1', type: 'gas', x: 180, y: 155, reading: '0.2% CO2', status: 'ok', room: 'gasRoom' },
    { id: 'gas2', type: 'gas', x: 220, y: 180, reading: '0.5% CH4', status: 'warning', room: 'gasRoom' },
    { id: 'temp1', type: 'temp', x: 420, y: 155, reading: '22°C', status: 'ok', room: 'tempRoom' },
    { id: 'temp2', type: 'temp', x: 460, y: 180, reading: '38°C', status: 'warning', room: 'tempRoom' },
    { id: 'cam1', type: 'camera', x: 300, y: 360, reading: 'Live', status: 'ok', room: 'machineArea' },
    { id: 'cam2', type: 'camera', x: 180, y: 530, reading: 'Live', status: 'ok', room: 'controlRoom' },
    { id: 'vib1', type: 'vibration', x: 200, y: 340, reading: '2.1mm/s', status: 'ok', room: 'machineArea' },
    { id: 'smoke1', type: 'smoke', x: 660, y: 270, reading: 'Clear', status: 'ok', room: 'storage' },
  ];

  const getRoomColor = (room: Room) => {
    if (selectedRoom?.id === room.id) return '#002a5c';
    switch (room.status) {
      case 'critical': return 'rgba(255, 51, 85, 0.15)';
      case 'warning': return 'rgba(255, 184, 0, 0.1)';
      default: return 'rgba(0, 255, 136, 0.05)';
    }
  };

  const getRoomBorderColor = (room: Room) => {
    if (selectedRoom?.id === room.id) return '#00d4ff';
    switch (room.status) {
      case 'critical': return '#ff3355';
      case 'warning': return '#ffb800';
      default: return '#00ff88';
    }
  };

  const sensorIcon = (type: string) => {
    const map: Record<string, string> = {
      gas: '🔺',
      temp: '🌡️',
      camera: '📷',
      vibration: '📳',
      smoke: '💨',
    };
    return map[type] || '⚙️';
  };

  const getSensorColor = (status: string) => {
    switch (status) {
      case 'warning': return '#ffb800';
      case 'critical': return '#ff3355';
      default: return '#00ff88';
    }
  };

  const zoneStats = [
    { label: 'Risk Score', value: `${selectedZone?.riskScore ?? 0}/100`, icon: Shield },
    { label: 'Workers', value: selectedZone?.workerCount ?? 0, icon: Users },
    { label: 'Active Alerts', value: selectedZone?.activeAlerts ?? 0, icon: AlertTriangle },
    { label: 'Sensors', value: selectedZone?.sensors ?? 0, icon: Activity },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Digital Twin — Operations View</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Live spatial view of Titan Industrial Complex — Plant 7</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(ZONE_COLORS).map(([status, c]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.border, opacity: 0.8 }} />
              <span className="text-[10px] text-[#7fa3c4] capitalize font-mono">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Twin View */}
        <div className={cn("transition-all duration-300", isFullscreen ? "fixed inset-4 z-50 col-span-12" : "col-span-12 lg:col-span-8")}>
          <div className={cn("glass-card overflow-hidden flex flex-col", isFullscreen ? "h-full" : "")}>
            {/* Top banner */}
            <div className="p-3 border-b border-[rgba(0,212,255,0.08)] flex items-center gap-2">
              <Map className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-medium">Plant Floor Map — Zone Overview</span>
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                  <span className="text-green-400 text-xs font-mono">LIVE</span>
                </div>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-[#7fa3c4] hover:text-cyan-400 transition-colors" title="Toggle Fullscreen">
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Map canvas */}
            <div className="relative bg-[#010a14] m-4 rounded-xl overflow-hidden flex-1" style={{ minHeight: isFullscreen ? 'calc(100vh - 100px)' : '480px' }}
                 onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
              <TransformWrapper
                doubleClick={{ mode: 'reset' }}
                wheel={{ step: 0.1 }}
                limitToBounds={false}
                minScale={0.5}
                maxScale={3}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent wrapperStyle={{ width: '100%', height: '480px' }} contentStyle={{ width: '100%', height: '100%' }}>
                      {/* Floor plan SVG */}
                      <svg viewBox="0 0 800 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Grid pattern */}
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0a2a4a" strokeWidth="0.5" opacity="0.4" />
                          </pattern>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Background */}
                        <rect x="0" y="0" width="800" height="600" fill="#060e18" />
                        <rect x="0" y="0" width="800" height="600" fill="url(#grid)" />

                        {/* Building outline */}
                        <rect x="10" y="10" width="780" height="580" fill="none" stroke="#00d4ff" strokeWidth="2" rx="4" opacity="0.6" />

                        {/* Rooms */}
                        {rooms.map((room) => (
                          <g key={room.id} 
                             onClick={() => handleRoomClick(room)} 
                             onMouseEnter={() => setHoveredRoom(room)}
                             onMouseLeave={() => setHoveredRoom(null)}
                             cursor="pointer">
                            <rect
                              x={room.x}
                              y={room.y}
                              width={room.w}
                              height={room.h}
                              fill={getRoomColor(room)}
                              stroke={getRoomBorderColor(room)}
                              strokeWidth={selectedRoom?.id === room.id ? 2 : 1}
                              rx="3"
                              className="transition-all duration-200"
                            />
                            {/* Room label */}
                            <text
                              x={room.x + room.w / 2}
                              y={room.y + 16}
                              textAnchor="middle"
                              fill="#7fa3c4"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {room.name}
                            </text>
                            {/* Room status indicator */}
                            {room.status !== 'safe' && (
                              <circle
                                cx={room.x + room.w - 12}
                                cy={room.y + 12}
                                r="4"
                                fill={getRoomBorderColor(room)}
                                opacity="0.9"
                              >
                                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                              </circle>
                            )}
                          </g>
                        ))}

                        {/* Wiring / Connection paths */}
                        <g stroke="#00d4ff" strokeWidth="1" opacity="0.25" strokeDasharray="4 4">
                          <line x1="180" y1="230" x2="180" y2="260" />
                          <line x1="420" y1="230" x2="420" y2="260" />
                          <line x1="300" y1="460" x2="300" y2="480" />
                          <line x1="520" y1="360" x2="560" y2="360" />
                          <line x1="660" y1="460" x2="660" y2="480" />
                        </g>

                        {/* Sensors */}
                        {sensors.map((s) => (
                          <g key={s.id} onClick={(e) => { e.stopPropagation(); handleSensorClick(s); }} cursor="pointer">
                            {/* Sensor pulse ring */}
                            <circle cx={s.x} cy={s.y} r="12" fill="none" stroke={getSensorColor(s.status)} strokeWidth="1" opacity="0.4">
                              <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                            </circle>
                            {/* Sensor dot */}
                            <circle cx={s.x} cy={s.y} r="6" fill={getSensorColor(s.status)} opacity="0.8" />
                            {/* Sensor icon */}
                            <text x={s.x} y={s.y + 1} fontSize="8" textAnchor="middle" dominantBaseline="central" fill="white">
                              {sensorIcon(s.type)}
                            </text>
                            {/* Sensor label */}
                            <text x={s.x} y={s.y + 22} fontSize="7" textAnchor="middle" fill={getSensorColor(s.status)} fontFamily="monospace">
                              {s.reading}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </TransformComponent>

                    {/* Zoom controls */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <button onClick={() => zoomIn()} className="w-8 h-8 rounded-lg bg-[#0a1b2c]/80 border border-cyan-800/30 text-cyan-400 flex items-center justify-center hover:bg-cyan-900/40 transition-colors">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button onClick={() => zoomOut()} className="w-8 h-8 rounded-lg bg-[#0a1b2c]/80 border border-cyan-800/30 text-cyan-400 flex items-center justify-center hover:bg-cyan-900/40 transition-colors">
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button onClick={() => resetTransform()} className="w-8 h-8 rounded-lg bg-[#0a1b2c]/80 border border-cyan-800/30 text-cyan-400 flex items-center justify-center hover:bg-cyan-900/40 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </TransformWrapper>

              {/* Hover Tooltip Overlay */}
              <AnimatePresence>
                {hoveredRoom && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed pointer-events-none z-50 glass-card p-3 shadow-xl border border-cyan-400/30"
                    style={{ left: mousePos.x + 15, top: mousePos.y + 15, minWidth: '180px' }}
                  >
                    <h4 className="text-white text-sm font-bold border-b border-[rgba(0,212,255,0.1)] pb-1 mb-2">{hoveredRoom.name}</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7fa3c4]">Status</span>
                        <span className="font-mono font-bold capitalize" style={{ color: getRoomBorderColor(hoveredRoom) }}>{hoveredRoom.status}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7fa3c4]">Sensors</span>
                        <span className="text-white font-mono">{sensors.filter(s => s.room === hoveredRoom.id).length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7fa3c4]">Risk Score</span>
                        <span className="text-white font-mono">{hoveredRoom.status === 'critical' ? 85 : hoveredRoom.status === 'warning' ? 55 : 12}/100</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7fa3c4]">Active Alerts</span>
                        <span className="text-white font-mono">{hoveredRoom.status === 'critical' ? 2 : hoveredRoom.status === 'warning' ? 1 : 0}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info Panels */}
            <AnimatePresence>
              {selectedRoom && (
                <motion.div
                  key="room"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[rgba(0,212,255,0.08)] overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2">{selectedRoom.name}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass-card p-2 text-center">
                        <div className="text-[#7fa3c4] text-[10px]">Room ID</div>
                        <div className="text-cyan-400 text-xs font-mono mt-0.5">{selectedRoom.id}</div>
                      </div>
                      <div className="glass-card p-2 text-center">
                        <div className="text-[#7fa3c4] text-[10px]">Status</div>
                        <div className={cn('text-xs font-mono mt-0.5', selectedRoom.status === 'alert' ? 'text-red-400' : 'text-green-400')}>{selectedRoom.status}</div>
                      </div>
                      <div className="glass-card p-2 text-center">
                        <div className="text-[#7fa3c4] text-[10px]">Sensors</div>
                        <div className="text-cyan-400 text-xs font-mono mt-0.5">{sensors.filter(s => s.room === selectedRoom.id).length}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {selectedSensor && (
                <motion.div
                  key="sensor"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[rgba(0,212,255,0.08)] overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2">
                      {sensorIcon(selectedSensor.type)} Sensor: {selectedSensor.type.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass-card p-2 text-center">
                        <div className="text-[#7fa3c4] text-[10px]">ID</div>
                        <div className="text-cyan-400 text-xs font-mono mt-0.5">{selectedSensor.id}</div>
                      </div>
                      <div className="glass-card p-2 text-center">
                        <div className="text-[#7fa3c4] text-[10px]">Reading</div>
                        <div className="text-white text-xs font-mono mt-0.5">{selectedSensor.reading}</div>
                      </div>
                      <div className="glass-card p-2 text-center">
                        <div className="text-[#7fa3c4] text-[10px]">Status</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: getSensorColor(selectedSensor.status) }}>{selectedSensor.status}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel — Equipment & Zone status */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Zone stats (when a zone is selected) */}
          <AnimatePresence>
            {selectedZone && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-4"
              >
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Zone Details — {selectedZone.id}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {zoneStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="glass-card p-3 text-center">
                        <Icon className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                        <div className="text-white text-sm font-bold font-mono">{stat.value}</div>
                        <div className="text-[#3a5a7a] text-[10px]">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Equipment status */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Equipment Status
            </h3>
            <div className="space-y-2">
              {mockEquipment.map((eq) => (
                <EquipmentNode key={eq.id} equipment={eq} />
              ))}
            </div>
          </div>

          {/* Zone summary */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Map className="w-4 h-4 text-cyan-400" />
              Zone Summary
            </h3>
            <div className="space-y-2">
              {mockZones.map((zone) => {
                const colors = ZONE_COLORS[zone.status] ?? ZONE_COLORS.safe;
                return (
                  <div
                    key={zone.id}
                    className={cn('p-3 rounded-lg cursor-pointer transition-all', selectedZone?.id === zone.id ? 'ring-1 ring-cyan-400/30' : '')}
                    style={{ background: colors.bg, border: `1px solid ${colors.border}30` }}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-medium">{zone.id}</span>
                      <span className="text-[10px] font-mono capitalize" style={{ color: colors.border }}>{zone.status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono" style={{ color: colors.border, opacity: 0.7 }}>
                      <span><Users className="w-2.5 h-2.5 inline mr-1" />{zone.workerCount}</span>
                      <span><AlertTriangle className="w-2.5 h-2.5 inline mr-1" />{zone.activeAlerts}</span>
                      <span>RISK: {zone.riskScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
