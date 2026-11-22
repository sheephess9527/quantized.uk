import { models } from '@/lib/data/models';
import { GPU_COUNT, CPU_ROW_COUNT } from '@/lib/seo';
import { articles } from '@/lib/data/cookbook';
import { formatPairs } from '@/lib/utils/format-compare';
import { dataLastUpdated } from '@/lib/data/meta';
import { SITE_URL, FEEDBACK_EMAIL } from '@/lib/seo';

const pages = [
  ['/', 'Home', '首页'],
  ['/quant-hub/', 'Model index', '模型索引'],
  ['/gpu/', 'GPU index', '显卡索引'],
  ['/tools/', 'Tools', '工具'],
  ['/tools/vram-calc/', 'VRAM calculator', '显存计算器'],
  ['/tools/feel/', 'Feel the speed', '速度体验'],
  ['/formats/', 'Format comparisons', '量化格式对比'],
  ['/cookbook/', 'Cookbook', '部署指南'],
  ['/benchmarks/', 'Benchmarks', '基准测试'],
  ['/changelog/', 'Data changelog', '数据更新日志'],
  ['/pending/', 'Released but not runnable locally yet (with reasons)', '已发布但暂无法本地运行的模型（附原因）'],
  ['/about/', 'About', '关于本站'],
  ['/feed.xml', 'Feed', '订阅源'],
] as const;

function keyUrls(lang: 'en' | 'zh') {
  const base = `${SITE_URL}${lang === 'zh' ? '/zh' : ''}`;
  return pages.map(([path, en, zh]) => `- ${lang === 'zh' ? zh : en}: ${base}${path}`).join('\n') + `
- ${lang === 'zh' ? '站点地图' : 'Sitemap'}: ${SITE_URL}/sitemap.xml
- ${lang === 'zh' ? '数据（JSON，CC BY 4.0）' : 'Data (JSON, CC BY 4.0)'}: ${SITE_URL}/data/v1/models.json, ${SITE_URL}/data/v1/gpus.json`;
}

export function buildLlms(lang: 'en' | 'zh') {
  if (lang === 'en') return englishLlms();
  return `# quantized.uk

> 面向在消费级硬件上运行大语言模型的开发者，提供量化模型资料与部署参考。
> 数据最后更新于 ${dataLastUpdated}。

## 本站内容

- 静态资料站（不托管模型，无需注册账号）
- 收录 ${models.length} 个量化大语言模型，提供各量化等级的显存、速度和质量资料
- ${GPU_COUNT} 种显卡及 Mac 配置，另有 ${CPU_ROW_COUNT} 种纯 CPU 内存容量；各自页面列出 4K 上下文下可运行的模型
- ${formatPairs.length} 个量化格式对比页面
- ${articles.length} 篇部署指南（llama.cpp、Ollama、vLLM、Docker、WSL2）
- 真实硬件基准测试（RTX 4090/3090、Apple Silicon）
- 完整中英文版本，内容对应，并通过 hreflang 关联

## 数据计算与测量方式

- 显存数值为**计算值**，并非实测：按量化等级的每权重位数计算模型权重，加上指定上下文的 KV 缓存，再预留 10% 的激活缓冲。绿色适配判定的上限为显卡容量的 88%，而非 100%。
- 对于各层注意力缓存方式不同的模型（如混合线性注意力、滑动窗口），明确记录注意力结构，不会假设每一层都缓存完整上下文来计算 KV 缓存。
- 仅在已有公开数据时展示各量化等级的困惑度损失。没有公开数值的模型显示横线，不会把估算伪装成实测。
- 速度数据来自本站的基准测试，并注明测试硬件与框架版本。

## 主要链接

${keyUrls('zh')}

## 语言版本

- 英文版位于根目录：${SITE_URL}/
- 简体中文版位于 /zh/：${SITE_URL}/zh/
- 英文版 LLM 站点摘要：${SITE_URL}/llms.txt
- 中文版 LLM 站点摘要：${SITE_URL}/zh/llms.txt
- 语言由 URL 决定，不依赖 Cookie 或切换状态。每个页面都有通过 hreflang 关联的另一语言版本，且均已预渲染；中文正文直接包含在 HTML 中，而非通过 JavaScript 替换。

## 联系

本站不提供公开源码仓库链接。如需反馈、纠错或联系维护者，请发送邮件至 ${FEEDBACK_EMAIL}。
维护与更新政策见 ${SITE_URL}/zh/about/。
`;
}

export function llmsResponse(lang: 'en' | 'zh') {
  return new Response(buildLlms(lang), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
function englishLlms() {
  const body = `# quantized.uk

> LLM quantization intelligence for developers running models on consumer hardware.
> Data last updated ${dataLastUpdated}.

## What this site is

- Static reference site (no model hosting, no accounts)
- ${models.length} quantized LLM index with per-quant VRAM, speed and quality metadata
- ${GPU_COUNT} GPUs and Macs plus ${CPU_ROW_COUNT} CPU-only RAM sizes, each with a page listing what fits it at 4K context
- ${formatPairs.length} quantization-format comparison pages
- ${articles.length} deployment cookbook guides (llama.cpp, Ollama, vLLM, Docker, WSL2)
- Real-hardware benchmarks (RTX 4090/3090, Apple Silicon)
- Full Chinese edition at /zh/ (same content, hreflang-paired)

## How the numbers are produced

- VRAM figures are **calculated**, not measured: model weights at the level's
  bits-per-weight, plus KV cache for the stated context, plus a 10% activation
  buffer. The green verdict stops at 88% of the card, not 100%.
- Models whose layers do not all cache attention the same way (hybrid linear
  attention, sliding-window) carry an explicit attention shape, so their KV
  cache is not sized as though every layer cached the full context.
- Per-quant perplexity loss is shown only where someone published one. A model
  without a published figure shows a dash, never an estimate dressed as a
  measurement.
- Speed figures come from this site's own benchmark runs and name the hardware
  and framework version they were produced on.

## Key URLs

${keyUrls('en')}

## Languages

- English at the root: ${SITE_URL}/
- Chinese (Simplified) under /zh/: ${SITE_URL}/zh/
- English LLM summary: ${SITE_URL}/llms.txt
- Chinese LLM summary: ${SITE_URL}/zh/llms.txt
- Language is carried by the URL, not a cookie or toggle state. Every page has a
  hreflang-paired mirror in the other tree, and both are prerendered — the
  Chinese text is in the HTML, not swapped in by JavaScript.

## Contact

No public source repository link on the site. Contact (feedback, corrections, the maintainer): ${FEEDBACK_EMAIL}.
See /about/ for maintenance and update policy.
`;

  return body;
}
