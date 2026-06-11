'use client';

import { useEffect, useRef } from 'react';
import { useLiveSensorStore } from '@/store';
import { Activity, Thermometer, Wind, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export function SensorMonitoringWidget() {
  const { data, isConnected, setConnection, updateData } = useLiveSensorStore();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to FastAPI WebSocket
    const connectWs = () => {
      const clientId = `widget-${Date.now()}`;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL ? `${process.env.NEXT_PUBLIC_WS_URL}?client_id=${clientId}` : `ws://localhost:8000/ws/telemetry?client_id=${clientId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnection(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'tinkercad_sensor' && message.data) {
            updateData(message.data);
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.onclose = () => {
        setConnection(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setConnection, updateData]);

  const getStatusColor = (value: number, type: 'temp' | 'gas') => {
    if (type === 'temp') {
      if (value > 60) return 'text-red-400 bg-red-400/10 border-red-400/30';
      if (value > 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    } else {
      if (value > 80) return 'text-red-400 bg-red-400/10 border-red-400/30';
      if (value > 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    }
  };

  const getStatusText = (value: number, type: 'temp' | 'gas') => {
    if (type === 'temp') {
      if (value > 60) return 'Critical';
      if (value > 40) return 'Warning';
      return 'Normal';
    } else {
      if (value > 80) return 'Critical';
      if (value > 40) return 'Warning';
      return 'Normal';
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full border-t-4 border-t-cyan-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Sensor Integration Status
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? 'LIVE DATA CONNECTED' : 'SIMULATION MODE'}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {/* Temperature Sensor */}
        <div className="bg-[#040c14] border border-[rgba(0,212,255,0.08)] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[#7fa3c4] text-xs font-semibold tracking-wider">TEMPERATURE (TMP36)</p>
              <p className="text-2xl font-mono text-white font-bold">
                {data ? `${data.temperature.toFixed(1)}°C` : '--'}
              </p>
            </div>
          </div>
          {data && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider ${getStatusColor(data.temperature, 'temp')}`}>
              {getStatusText(data.temperature, 'temp')}
            </div>
          )}
        </div>

        {/* Gas Sensor */}
        <div className="bg-[#040c14] border border-[rgba(0,212,255,0.08)] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wind className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[#7fa3c4] text-xs font-semibold tracking-wider">GAS LEVEL</p>
              <p className="text-2xl font-mono text-white font-bold">
                {data ? `${data.gasLevel.toFixed(1)} ppm` : '--'}
              </p>
            </div>
          </div>
          {data && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider ${getStatusColor(data.gasLevel, 'gas')}`}>
              {getStatusText(data.gasLevel, 'gas')}
            </div>
          )}
        </div>

        {/* Machine Fault Sensor */}
        <div className="bg-[#040c14] border border-[rgba(0,212,255,0.08)] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[#7fa3c4] text-xs font-semibold tracking-wider">MACHINE STATUS</p>
              <p className="text-2xl font-mono text-white font-bold">
                {data ? (data.machineFault ? 'FAULT' : 'OK') : '--'}
              </p>
            </div>
          </div>
          {data && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider flex items-center gap-1 ${data.machineFault ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-green-400 bg-green-400/10 border-green-400/30'}`}>
              {data.machineFault ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              {data.machineFault ? 'CRITICAL' : 'NORMAL'}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.08)] text-xs text-[#7fa3c4] flex justify-between">
        <span>Last Update: {data ? new Date(data.timestamp).toLocaleTimeString() : 'N/A'}</span>
        <span>Polling: 1Hz</span>
      </div>
    </div>
  );
}
