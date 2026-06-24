'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { gpuDatabase, GPU } from '@/lib/data/gpus';

const STORAGE_KEY = 'quantized-hw-profile';

interface HardwareProfileContextValue {
  gpuId: string;
  gpu: GPU | null;
  setGpuId: (id: string) => void;
  clearProfile: () => void;
  hasProfile: boolean;
}

const HardwareProfileContext = createContext<HardwareProfileContextValue | null>(null);

export function HardwareProfileProvider({ children }: { children: ReactNode }) {
  const [gpuId, setGpuIdState] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && gpuDatabase.some(g => g.id === saved)) {
      setGpuIdState(saved);
    }
    setHydrated(true);
  }, []);

  const setGpuId = useCallback((id: string) => {
    setGpuIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearProfile = useCallback(() => setGpuId(''), [setGpuId]);

  const gpu = gpuDatabase.find(g => g.id === gpuId) ?? null;

  return (
    <HardwareProfileContext.Provider value={{ gpuId: hydrated ? gpuId : '', gpu: hydrated ? gpu : null, setGpuId, clearProfile, hasProfile: hydrated && gpuId !== '' }}>
      {children}
    </HardwareProfileContext.Provider>
  );
}

export function useHardwareProfile() {
  const ctx = useContext(HardwareProfileContext);
  if (!ctx) throw new Error('useHardwareProfile must be used within HardwareProfileProvider');
  return ctx;
}