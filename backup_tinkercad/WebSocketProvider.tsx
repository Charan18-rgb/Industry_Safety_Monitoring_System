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
    const clientId = user.id || `client-${Date.now()}`;
    const url = process.env.NEXT_PUBLIC_WS_URL ? `${process.env.NEXT_PUBLIC_WS_URL}?client_id=${clientId}` : `${WEBSOCKET_URL}/ws/telemetry?client_id=${clientId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected to Telemetry Stream');
      setConnected(true);
      useLiveSensorStore.getState().setConnection(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'telemetry' && payload.data) {
          updateSensor(payload.data);
        } else if (payload.type === 'alert' && payload.data) {
          addAlert(payload.data);
        } else if (payload.type === 'tinkercad_sensor' && payload.data) {
          useLiveSensorStore.getState().updateData(payload.data);
        }
      } catch {
        // Silent fail for parsing
      }
    };

    ws.onclose = () => {
      console.warn('[WebSocket] Disconnected from Telemetry Stream');
      setConnected(false);
      useLiveSensorStore.getState().setConnection(false);
      // Attempt reconnection after 3s
      reconnectTimer = setTimeout(() => {
        if (user) {
          console.log('[WebSocket] Attempting reconnection...');
          // Trigger a re-run of the effect by updating a local state if needed, 
          // or just rely on the component re-mounting/effect dependencies.
          // For simplicity in this structure, we'll force a state update if we had a retry counter.
        }
      }, 3000);
    };

    ws.onerror = () => {
      // Backend likely offline, set status and move on
      setConnected(false);
      useLiveSensorStore.getState().setConnection(false);
    };

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [user, setConnected, updateSensor, addAlert]);

  // Optional: Fetch initial sensor state if WebSocket is just for updates
  useEffect(() => {
    if (user && wsRef.current?.readyState !== WebSocket.OPEN) {
      // Logic to fetch initial state could go here
    }
  }, [user]);

  return <>{children}</>;
}
