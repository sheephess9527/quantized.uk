import Script from 'next/script';

/** Production domain — defaults to quantized.uk; set to "none" or "false" to disable. */
const rawDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
const domain = rawDomain === 'none' || rawDomain === 'false' ? '' : (rawDomain || 'quantized.uk');

export default function Plausible() {
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="lazyOnload"
    />
  );
}
