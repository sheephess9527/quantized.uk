# quantized.uk: Google traffic investigation — 2026-11-16

## Conclusion and scope

The owner reports a Google traffic decline on **quantized.uk**. Its size, onset,
affected queries/pages and cause are **not yet verified**. Current evidence does
not support calling it a Google penalty, an indexing failure, or AI answers
replacing clicks. No SEO-wide index/noindex or canonical change is made on that basis.

This is a completed public technical audit and source-access record, not a
completed Search Console performance diagnosis. The owner's approximate weekly
site-visit figure is not verified Google clicks and is not used as a baseline.

## Current observations

Public GET probes on November 16 returned 200 and index/follow metadata, visible
server-rendered H1 content, self-referencing canonicals and paired EN/ZH alternates:

| Sample | Result |
| --- | --- |
| `/`, `/zh/` | 200; homepage headings in HTML; correct canonicals/alternates |
| `/tools/vram-calc/`, `/zh/tools/vram-calc/` | 200; calculator headings in HTML; correct canonicals/alternates |
| `/quant-hub/` | 200; index heading and model content in HTML |
| `/quant-hub/arete-27b/` | 200; new model is present and indexable |
| `/cookbook/amd-rocm-llamacpp/` | 200; historical top AI-cited guide is present and indexable |

- `robots.txt`: public 200, `Allow: /`, sitemap declared. No blanket Googlebot block.
- `sitemap.xml`: public 200; **618 unique URL entries**, including Arete and TwIL.
  Sitemap inclusion is not proof of Google indexing.
- Homepage, calculator and guide probes with a Googlebot user-agent string also
  returned 200 with no X-Robots-Tag exclusion. The probing machine is **not a
  verified Google crawler IP**; this cannot prove how Cloudflare treats real
  Googlebot or replace Search Console crawl/indexing evidence.
- `QueryNoindex.tsx` targets filtered Hub queries. The sampled plain index,
  calculator, guide and model routes are index/follow; this intended query policy
  is not evidence that the entire site was accidentally noindexed.
- Latest production export passed language, canonical, metadata and structured
  data gates. Those are technical consistency checks, not ranking measurements.

Probe snapshots and summaries are outside the repository in
`/workspace/scratch/seo-2026-11-16/`. URLs above are the inspected production source.

## Historical evidence must not be mixed

The repository records a Cloudflare sample for October 11–18 (716 visits / 2,323
views), and a different Google AI-features export for July 18–October 17 (816
impressions, no clicks in that export). Neither is a current ordinary Web-search
click series. Calculator history rewrites were also known to inflate page views.

These observations support checking metric definitions. They **do not** establish
that AI answers caused low Google visits, explain a November decline, or rule out
indexing problems on other pages. The unsupported causal wording in CLAUDE.md has
been corrected while retaining the historical sample and its dates.

## Access checked and still missing

- No Search Console/GA4/Plausible data reader is currently connected in this task.
- A bounded related Gmail search found no relevant Search Console performance
  export; a Drive search for the site found no usable export either.
- OpenSEO was identified as an available Search Console integration and suggested,
  but **installation, connection and access to this property are not confirmed**.
- The public Plausible dashboard URL returned 404 and supplied no usable visit history;
  that alone does not prove a tracking configuration error or absent private account.
- The owner confirmed the site, but has not yet identified the metric surface,
  decline start date or supplied the underlying performance data.

## Evidence needed to finish the diagnosis

Use the site's **Web Search** performance with its exact reporting scope,
separately from Discover, Bing and all-channel analytics. Some AI-feature links
can already be included in Web performance; do not add or subtract a separately
labeled AI report without checking its definitions and overlap. Obtain the latest
three months of daily
clicks/impressions/CTR/position plus page/query/country/device dimensions, property
and filters. Compare equally long complete windows (28 days versus preceding
28 days; also align weekdays), ending on the latest complete available day.
Do not treat a partially reported current day as a collapse.

Then identify the onset and lost-click pages/queries; distinguish exposure loss,
CTR loss, rank movement, device/country mix and index coverage. Reconcile page
and query totals with the headline, allowing for anonymized query omissions.
Use Search Console indexing/crawl evidence and the site's actual deployment
timeline to test technical hypotheses. Timing alone is not a causal finding.

No measured decline percentage, ranking trend or predicted recovery is reported
without these source data. Cross-links are a separate related-tool handoff; they
are not presented as a proven Google recovery measure.

Raw future Search Console exports and credentials must stay outside the public
repository; only reviewed summaries and nonsensitive query definitions belong here.
