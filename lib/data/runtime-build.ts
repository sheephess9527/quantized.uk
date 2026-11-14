/**
 * The llama.cpp release build the site's commands are written against — the
 * same value `runtimeVersions.current.llamacpp` shows. It lives in its own
 * file because the CLI generator ships to the browser, and importing `meta.ts`
 * there would carry the whole changelog into the bundle. The Windows commands
 * download this build's prebuilt zips by name, so bump it only to a build whose
 * release page lists the `llama-<build>-bin-win-*` assets (patrols re-check it).
 */
export const LLAMACPP_BUILD = 'b12376';
