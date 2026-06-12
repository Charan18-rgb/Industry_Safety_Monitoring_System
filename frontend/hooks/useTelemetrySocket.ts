'use client';

import { useEffect, useRef } from 'react';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import type { Alert, SensorReading } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws/telemetry';

type WSMessage =
  | { type: 'sensor_update'; data: SensorReading }
  | { type: 'alert'; data: Alert }
  | { type: 'ping' };

export function useTelemetrySocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnects = 5;

  const ingestSensorReading = useSimulationDomainStore((state) => state.ingestSensorReading);
  const setConnection = useSimulationDomainStore((state) => state.setConnection);
  const addAlert = useSimulationDomainStore((state) => state.addAlert);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      try {
        const clientId = `web-${Math.random().toString(36).substring(7)}`;
        ws.current = new WebSocket(`${WS_URL}?client_id=${clientId}`);

        ws.current.onopen = () => {
          reconnectAttempts.current = 0;
          setConnection(true);
          console.log('[AEGIS-WS] Connected to telemetry stream');
        };

        ws.current.onmessage = (event) => {
          try {
            const msg: WSMessage = JSON.parse(event.data);
            if (msg.type === 'sensor_update') ingestSensorReading(msg.data);
            else if (msg.type === 'alert') addAlert(msg.data);
          } catch {
            // Ignore malformed messages without breaking the stream.
          }
        };

        ws.current.onclose = () => {
          setConnection(false);
          if (!cancelled && reconnectAttempts.current < maxReconnects) {
            const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
            reconnectAttempts.current += 1;
            reconnectTimer.current = setTimeout(connect, delay);
          }
        };

        ws.current.onerror = () => {
          ws.current?.close();
        };
      } catch {
        setConnection(false);
      }
    }

    connect();

    return () => {
      cancelled = true;
      ws.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [ingestSensorReading, addAlert, setConnection]);
}
