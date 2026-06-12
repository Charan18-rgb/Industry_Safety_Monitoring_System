'use client';

import { useEffect } from 'react';
import { useSimulationDomainStore } from '@/store/simulationDomain';

export function SimulationEngineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useSimulationDomainStore.getState().tick();
    const timer = window.setInterval(() => {
      useSimulationDomainStore.getState().tick();
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return children;
}
