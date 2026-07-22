/** Lightweight Plausible helper — no-ops when analytics is not loaded. */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const plausible = (window as Window & { plausible?: (n: string, o?: { props?: Record<string, string | number | boolean> }) => void }).plausible;
  if (typeof plausible === 'function') {
    plausible(name, props ? { props } : undefined);
  }
}
