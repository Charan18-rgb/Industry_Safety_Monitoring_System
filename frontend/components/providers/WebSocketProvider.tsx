'use client';

import { useEffect, useRef } from 'react';
import { useTelemetryStore, useAlertStore, useAuthStore, useLiveSensorStore } from '@/store';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { setConnected, updateSensor } = useTelemetryStore();
  const { addAlert } = useAlertStore();
  
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
        setConnected(true);
        useLiveSensorStore.getState().setConnection(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if ((payload.type === 'telemetry' || payload.type === 'sensor_update') && payload.data) {
            updateSensor(payload.data);
          } else if (payload.type === 'alert' && payload.data) {
            addAlert(payload.data);
          } else if (payload.type === 'tinkercad_sensor' && payload.data) {
            useLiveSensorStore.getState().updateData(payload.data);
          }
        } catch {
          // Ignore malformed messages without interrupting the stream.
        }
      };

      ws.onclose = () => {
        setConnected(false);
        useLiveSensorStore.getState().setConnection(false);
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
  }, [user, setConnected, updateSensor, addAlert]);

  return <>{children}</>;
}
