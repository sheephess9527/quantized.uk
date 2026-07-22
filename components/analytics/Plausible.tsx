import Script from 'next/script';

/** Production domain — no env var required for zero-config deploy. */
const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'quantized.uk';

export default function Plausible() {
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
