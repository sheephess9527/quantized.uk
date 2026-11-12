'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { gpuDatabase, GPU } from '@/lib/data/gpus';

/** Previous key: a bare GPU id string. Read once, then migrated. */
const LEGACY_KEY = 'quantized-hw-profile';
const STORAGE_KEY = 'quantized-config-v1';

/**
 * The configuration a reader carries between tools.
 *
 * Grown from the GPU-only profile rather than replaced: the calculator, CLI
 * generator and compare tool each asked for the same model / quant / context
 * independently, so moving between them meant entering the same three answers
 * again. Fields are added as a tool actually needs them — system RAM, runtime
 * and OS are not here because nothing reads them yet.
 *
 * Precedence everywhere is **URL > stored config > default**: a shared link
 * must win over whatever the recipient happens to have saved.
 */
export interface SharedConfig {
  gpuId: string;
  modelId: string;
  /** Calculator/CLI level key, e.g. `Q4_K_M` or `AWQ INT4`. */
  quantLevel: string;
  contextLen: number;
}

const EMPTY: SharedConfig = { gpuId: '', modelId: '', quantLevel: '', contextLen: 4096 };

interface HardwareProfileContextValue {
  gpuId: string;
  gpu: GPU | null;
  setGpuId: (id: string) => void;
  clearProfile: () => void;
  hasProfile: boolean;
  /** Everything the tools share. `hydrated` is false during the first render. */
  config: SharedConfig;
  hydrated: boolean;
  updateConfig: (patch: Partial<SharedConfig>) => void;
}

const HardwareProfileContext = createContext<HardwareProfileContextValue | null>(null);

/**
 * Drop anything that no longer exists. A model or GPU can be removed from the
 * index between visits, and a stale id must degrade to "not set" rather than
 * silently producing a result for something else.
 */
function sanitize(raw: Partial<SharedConfig> | null): SharedConfig {
  if (!raw) return EMPTY;
  const gpuId = typeof raw.gpuId === 'string' && gpuDatabase.some(g => g.id === raw.gpuId) ? raw.gpuId : '';
  // Shape only. Whether the id still exists is checked once, on load, by `knownModelId()` below:
  // importing the model index here put all of its data into every page's JavaScript, since this
  // provider sits in the root layout. Later writes come from the tools, which pick from the index.
  const modelId = typeof raw.modelId === 'string' && /^[a-z0-9][a-z0-9.\-]{0,80}$/.test(raw.modelId) ? raw.modelId : '';
  const quantLevel =
    typeof raw.quantLevel === 'string' && raw.quantLevel.length > 0 ? raw.quantLevel : '';
  const contextLen =
    typeof raw.contextLen === 'number' && raw.contextLen >= 512 && raw.contextLen <= 1_048_576
      ? raw.contextLen
      : 4096;
  return { gpuId, modelId, quantLevel, contextLen };
}

/**
 * A stored model id may name a model that has since left the index. The index is loaded on demand,
 * and only for a reader who has a model saved — i.e. one who has used the tools, whose pages load
 * the same chunk anyway. A failed load drops the id rather than keeping an unchecked one.
 */
async function knownModelId(id: string): Promise<string> {
  if (id === '' || id === 'custom') return id;
  try {
    const { models } = await import('@/lib/data/models');
    return models.some(m => m.id === id) ? id : '';
  } catch {
    return '';
  }
}

export function HardwareProfileProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SharedConfig>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored: Partial<SharedConfig> | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as Partial<SharedConfig>;
      else {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) stored = { gpuId: legacy };
      }
    } catch {
      // Corrupt or unavailable storage is not an error worth surfacing —
      // the tools simply start from their defaults.
      stored = null;
    }
    const base = sanitize(stored);
    let cancelled = false;
    knownModelId(base.modelId).then(modelId => {
      if (cancelled) return;
      setConfig({ ...base, modelId });
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: SharedConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, []);

  const updateConfig = useCallback(
    (patch: Partial<SharedConfig>) => {
      setConfig(prev => {
        const next = sanitize({ ...prev, ...patch });
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setGpuId = useCallback((id: string) => updateConfig({ gpuId: id }), [updateConfig]);
  const clearProfile = useCallback(() => updateConfig({ gpuId: '' }), [updateConfig]);

  const gpu = useMemo(
    () => (hydrated ? gpuDatabase.find(g => g.id === config.gpuId) ?? null : null),
    [hydrated, config.gpuId],
  );

  const value = useMemo<HardwareProfileContextValue>(
    () => ({
      gpuId: hydrated ? config.gpuId : '',
      gpu,
      setGpuId,
      clearProfile,
      hasProfile: hydrated && config.gpuId !== '',
      config: hydrated ? config : EMPTY,
      hydrated,
      updateConfig,
    }),
    [hydrated, config, gpu, setGpuId, clearProfile, updateConfig],
  );

  return <HardwareProfileContext.Provider value={value}>{children}</HardwareProfileContext.Provider>;
}

export function useHardwareProfile() {
  const ctx = useContext(HardwareProfileContext);
  if (!ctx) throw new Error('useHardwareProfile must be used within HardwareProfileProvider');
  return ctx;
}
