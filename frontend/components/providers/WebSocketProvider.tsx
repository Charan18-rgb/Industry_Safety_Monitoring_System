'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store';
import { useSimulationDomainStore } from '@/store/simulationDomain';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const setConnection = useSimulationDomainStore((state) => state.setConnection);
  const ingestSensorReading = useSimulationDomainStore((state) => state.ingestSensorReading);
  const addAlert = useSimulationDomainStore((state) => state.addAlert);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let attempts = 0;
    const clientId = user.id || `client-${Date.now()}`;
    const url = process.env.NEXT_PUBLIC_WS_URL
      ? `${process.env.NEXT_PUBLIC_WS_URL}?client_id=${clientId}`
      : `${WEBSOCKET_URL}/ws/telemetry?client_id=${clientId}`;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        setConnection(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if ((payload.type === 'telemetry' || payload.type === 'sensor_update') && payload.data) {
            ingestSensorReading(payload.data);
          } else if (payload.type === 'alert' && payload.data) {
            addAlert(payload.data);
          }
        } catch {
          // Ignore malformed messages without interrupting the stream.
        }
      };

      ws.onclose = () => {
        setConnection(false);
        if (!cancelled) {
          const delay = Math.min(1000 * 2 ** attempts, 15000);
          attempts += 1;
          reconnectTimer = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
    };
  }, [user, setConnection, ingestSensorReading, addAlert]);

  return <>{children}</>;
}
