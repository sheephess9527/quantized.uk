/**
 * Cloudflare's Email Address Obfuscation (Scrape Shield) rewrites any bare
 * email address or `mailto:` link it finds in the HTML leaving the edge —
 * this site's static export bakes the real text in at build time, so the
 * origin response and what the browser actually receives can differ by the
 * time Cloudflare is done with it. React's client bundle then hydrates
 * against the *unmutated* text it was built from, and the mismatch is a
 * textbook cause of hydration errors #418/#425 (text content did not match).
 *
 * `<!--email_off-->…<!--/email_off-->` is Cloudflare's own documented escape
 * hatch: it skips rewriting anything between the pair. React can't emit a
 * literal comment node directly, so the two markers are rendered via
 * `dangerouslySetInnerHTML` on empty siblings rather than a wrapping element
 * — Cloudflare's rewriter reads the token stream in document order, and a
 * wrapping element risks the comment reading as scoped to that element
 * instead of the sibling range that follows it.
 *
 * This is a best-effort code-side mitigation; it has not been confirmed
 * against the live, Cloudflare-fronted site (this environment can't observe
 * Scrape Shield's actual rewrite). Disabling Scrape Shield → Email Address
 * Obfuscation in the Cloudflare dashboard is the more certain fix and needs
 * the site owner to do it — see QTZ-124.
 */
export default function EmailOffGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span aria-hidden="true" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: '<!--email_off-->' }} />
      {children}
      <span aria-hidden="true" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: '<!--/email_off-->' }} />
    </>
  );
}

/**
 * Splits a `'...{email}...'` template on the placeholder and renders the
 * address through `EmailOffGuard` as plain text (no link) — for prose that
 * mentions the address mid-sentence rather than presenting it as a click
 * target. Renders the template unchanged if `{email}` isn't present.
 */
export function textWithGuardedEmail(template: string, email: string) {
  const parts = template.split('{email}');
  if (parts.length !== 2) return template;
  return (
    <>
      {parts[0]}
      <EmailOffGuard>{email}</EmailOffGuard>
      {parts[1]}
    </>
  );
}
