import type { Lang } from './translations';

/**
 * Long-form bilingual copy for `/legal/`, `/about/`, and `/privacy/`.
 *
 * Kept in its own module so these ~420 lines of static essays stay on the
 * server (`LegalView`, `AboutView`, `PrivacyView`) instead of riding inside
 * `translations.ts` into every page's root-layout client bundle. Only the
 * short `linkLabel` strings used by `Footer` remain in `translations.ts`.
 */
export const staticPages = {
  en: {
    legal: {
      badge: 'Legal',
      title: 'Terms & Disclaimer',
      subtitle: 'Please read before using calculators, benchmarks, or deployment guides on this site.',
      lastUpdated: 'Last updated: 20 October 2026',
      backHome: 'Back to Home',
      footerNote: 'This page is provided for transparency. It does not constitute legal advice.',
      linkLabel: 'Terms & Disclaimer',
      sections: [
        {
          title: '1. About This Site',
          paragraphs: [
            'quantized.uk is an independent, community-driven reference site for LLM quantization. We provide metadata indexes, calculators, benchmarks, and deployment guides to help developers run models on their own hardware.',
            'We do not host, distribute, or sell model weights. All model files are hosted by third parties (primarily Hugging Face and individual quantizers).',
          ],
        },
        {
          title: '2. No Affiliation',
          paragraphs: [
            'quantized.uk is not affiliated with, endorsed by, or sponsored by Meta, NVIDIA, Alibaba (Qwen), Mistral AI, Google, Microsoft, Hugging Face, or any other company whose products are referenced on this site.',
            'References to product names are for identification and descriptive purposes only.',
          ],
        },
        {
          title: '3. Data Accuracy Disclaimer',
          paragraphs: [
            'VRAM estimates, benchmark numbers, perplexity loss figures, and speed data are approximations compiled from community sources, published benchmarks, and editorial curation. They are provided for planning purposes only.',
            'Actual memory usage and inference speed depend on your hardware, driver version, framework build, context length, batch size, and model revision. Always verify against official model cards and your own testing before production deployment.',
            'Hugging Face download and like counts are fetched from the public Hugging Face API at build time and may be outdated between deployments.',
          ],
        },
        {
          title: '4. No Warranty',
          paragraphs: [
            'This site and all tools are provided "as is" without warranty of any kind, express or implied, including but not limited to accuracy, fitness for a particular purpose, or non-infringement.',
            'We do not guarantee that any model, quant format, or configuration will work on your hardware or meet your quality requirements.',
          ],
        },
        {
          title: '5. Limitation of Liability',
          paragraphs: [
            'To the fullest extent permitted by applicable law, the operators of quantized.uk shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this site, including but not limited to hardware damage, data loss, failed deployments, or reliance on calculated VRAM estimates.',
            'You are solely responsible for decisions made based on information from this site.',
          ],
        },
        {
          title: '6. Third-Party Trademarks',
          paragraphs: [
            'Llama, Meta, Qwen, Mistral, Gemma, Phi, Granite, Codestral, Mixtral, DeepSeek, RTX, GeForce, CUDA, Apple, Mac, M1, M2, M3, Hugging Face, GGUF, llama.cpp, Ollama, vLLM, ExLlamaV2, and other names are trademarks of their respective owners.',
            'Use of these names on quantized.uk does not imply endorsement. All trademarks remain the property of their respective holders.',
          ],
        },
        {
          title: '7. Model Licenses',
          paragraphs: [
            'Each AI model is subject to its own license (e.g. Meta Llama License, Qwen License, Apache 2.0, MIT). quantized.uk does not grant any license to use model weights.',
            'Before downloading or deploying any model, you must read and comply with the license terms on the official Hugging Face model card. Deployment guides on this site are educational and do not override those license terms.',
          ],
        },
        {
          title: '8. External Links',
          paragraphs: [
            'This site links to third-party websites including Hugging Face, GitHub, and framework documentation. We are not responsible for the content, availability, or practices of external sites.',
            'Following external links is at your own risk.',
          ],
        },
        {
          title: '9. Content Updates',
          paragraphs: [
            'Model metadata, benchmarks, and deployment guides on this site are curated manually and may be updated without notice.',
            'Material data changes are noted in the homepage changelog. See the About page for how often the index is refreshed.',
          ],
        },
        {
          title: '10. Data License',
          paragraphs: [
            'The benchmark measurements, VRAM figures and data tables this site publishes are licensed under the Creative Commons Attribution 4.0 International license (CC BY 4.0): you may copy, adapt and reuse them, including commercially, provided you credit quantized.uk and link back to the page you used.',
            "This covers the site's own data only. Model weights, model cards, Hugging Face download counts, and third-party names and trademarks remain under their owners' terms.",
            'The same data is published as JSON at https://quantized.uk/data/v1/models.json and https://quantized.uk/data/v1/gpus.json, generated from the index on every update, under the same licence.',
          ],
        },
        {
          title: '11. Changes',
          paragraphs: [
            'We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.',
            'Material changes will be noted in the site changelog on the homepage.',
          ],
        },
      ],
    },
    about: {
      badge: 'About',
      title: 'About quantized.uk',
      subtitle: 'A practical reference for running quantized LLMs on your own hardware — built by someone who actually does it.',
      dataRefresh: 'Data last refreshed: {date}',
      backHome: 'Back to Home',
      linkLabel: 'About',
      maintainerTitle: 'Who maintains this?',
      maintainerContact: 'Write to the maintainer directly:',
      maintainerBody:
        'quantized.uk is an indie side project by a developer who got tired of guessing VRAM requirements and digging through scattered Hugging Face repos. It is maintained in spare time — data gets corrected and expanded as new models ship and as real-world testing surfaces better numbers.',
      cta: 'Found a wrong VRAM number? Know a model we should add?',
      ctaChangelog: 'Homepage changelog',
      ctaHub: 'Browse the model index',
      sections: [
        {
          title: 'Why this exists',
          paragraphs: [
            'Running LLMs locally should not require a PhD in quantization. Yet most knowledge lives in Reddit threads, Discord messages, and model cards written for researchers — not for someone staring at a 12GB VRAM bar wondering if Q4_K_M will fit.',
            'quantized.uk exists to answer the questions people actually ask before downloading a 20GB file: Will it fit? Which format? How much quality do I lose? What is the exact command to run it?',
          ],
        },
        {
          title: 'What we publish',
          paragraphs: [
            'A searchable index of {n} models with per-quant VRAM, speed, and quality estimates; interactive tools (VRAM calculator, format wizard, CLI generator); real-hardware benchmarks; and step-by-step deployment cookbooks.',
            'We index metadata and link to Hugging Face — we do not host, distribute, or sell model weights. Each model remains subject to its own license.',
          ],
        },
        {
          title: 'How we source data',
          paragraphs: [
            'Model stats are manually curated from Hugging Face model cards, community quant releases (bartowski, turboderp, unsloth, and others), and local benchmark runs where possible. Hugging Face download counts are fetched from the public API at each site build.',
            'Numbers are planning estimates, not guarantees. We document our methodology on the Benchmarks page and mark editorial estimates (like format heat) clearly. Always verify against your own hardware before production use.',
          ],
        },
        {
          title: 'How often things update',
          paragraphs: [
            'There is no fixed schedule — updates happen when new models ship or gaps are spotted. Model index and cookbook articles typically grow in batches every few weeks. The homepage changelog lists every data change with dates.',
            'HF download stats refresh automatically on each site rebuild. Major updates are noted in the changelog — that is the best place to see what changed recently.',
          ],
        },
        {
          title: 'How data improves',
          paragraphs: [
            'Model entries, benchmarks, and cookbook guides are curated manually from community releases and hands-on testing. We prioritise models people actually download and hardware configs readers actually use.',
            'If a number looks wrong, cross-check with our VRAM calculator and the official Hugging Face model card — then watch the homepage changelog for corrections in the next data batch.',
          ],
        },
        {
          title: 'What we are not',
          paragraphs: [
            'quantized.uk is not affiliated with Meta, NVIDIA, Alibaba, Mistral, Google, Hugging Face, or any model vendor. We are not a company, a hosting provider, or a model distributor.',
            'For legal terms, liability limits, and trademark notices, see the Terms & Disclaimer page.',
          ],
        },
      ],
    },
    privacy: {
      badge: 'Privacy',
      title: 'Privacy Policy',
      subtitle: 'How quantized.uk handles analytics, local storage, submissions, and third-party services.',
      lastUpdated: 'Last updated: 25 November 2026',
      backHome: 'Back to Home',
      footerNote: 'Questions? Read our',
      linkLabel: 'Privacy Policy',
      sections: [
        {
          title: '1. Overview',
          paragraphs: [
            'quantized.uk is a static website. We do not operate user accounts, collect payment information, or sell personal data.',
            'This policy explains what limited data may be processed when you visit the site and how you can control it.',
          ],
        },
        {
          title: '2. Analytics (Plausible & Cloudflare Web Analytics)',
          paragraphs: [
            'We use Plausible Analytics (plausible.io) and Cloudflare Web Analytics (cloudflareinsights.com), two cookie-free analytics services, to understand aggregate traffic and page performance — e.g. which pages are visited, from which countries, and Core Web Vitals.',
            'Neither service uses cookies, tracks you across websites, or collects personal identifiers. IP addresses in Plausible are anonymised before storage. Plausible runs on quantized.uk by default and can be overridden or set to "none" via NEXT_PUBLIC_PLAUSIBLE_DOMAIN at build time; embed pages (/embed/*) include no analytics scripts.',
            'The VRAM calculator reports which model, quantization, context length and GPU from the site’s own lists produced an answer, and the fit verdict. Your GPU is guessed from your browser’s graphics renderer name; that name stays in your browser and is never sent.',
            'For more detail, see the Plausible data policy (https://plausible.io/data-policy) and Cloudflare Web Analytics privacy documentation (https://developers.cloudflare.com/analytics/web-analytics/).',
          ],
        },
        {
          title: '3. Local Storage',
          paragraphs: [
            'Your browser may store your optional hardware profile (selected GPU) locally via localStorage. Language is determined directly by the URL (/ for English, /zh/ for Chinese) and is not stored in localStorage.',
            'We do not read or sync localStorage server-side. When you share a calculator result or submit a speed, only the settings shown on screen are included.',
            'You can clear this data anytime via your browser settings.',
          ],
        },
        {
          title: '4. Hosting & Logs',
          paragraphs: [
            'The site is hosted on Cloudflare Pages. Cloudflare may process standard web server logs (IP address, user agent, requested URL) for security and delivery.',
            "We do not receive or store those logs directly. Refer to Cloudflare's privacy policy for their data practices.",
            'Sending a calculator speed saves the displayed settings and the fields you submit in a private Cloudflare D1 review queue. The queue stores a daily keyed rate-limit tag, not your raw IP address. Only approved settings and results, including a reviewed public evidence link if available, can be published as community data. Private notes are not published.',
          ],
        },
        {
          title: '5. Third-Party Links',
          paragraphs: [
            'Pages link to external sites (Hugging Face, GitHub, framework docs). Those sites have their own privacy policies.',
            'Clicking external links is at your own discretion.',
          ],
        },
        {
          title: '6. Children',
          paragraphs: [
            'This site is intended for developers and technical users. We do not knowingly collect data from children under 16.',
          ],
        },
        {
          title: '7. Changes',
          paragraphs: [
            'We may update this policy. Material changes will be noted in the site changelog.',
            'Continued use after updates constitutes acceptance of the revised policy.',
          ],
        },
      ],
    },
  },
  zh: {
    legal: {
      badge: '法律声明',
      title: '使用条款与免责声明',
      subtitle: '使用本站计算器、基准数据或部署指南前，请阅读以下内容。',
      lastUpdated: '最后更新：2026 年 10 月 20 日',
      backHome: '返回首页',
      footerNote: '本页面仅供透明披露之用，不构成法律意见。',
      linkLabel: '条款与免责',
      sections: [
        {
          title: '1. 关于本站',
          paragraphs: [
            'quantized.uk 是一个独立的、社区驱动的 LLM 量化技术参考站。我们提供元数据索引、计算器、基准测试和部署指南，帮助开发者在自有硬件上运行模型。',
            '我们不托管、分发或销售模型权重文件。所有模型文件均由第三方（主要为 Hugging Face 及各位量化作者）托管。',
          ],
        },
        {
          title: '2. 非官方声明',
          paragraphs: [
            'quantized.uk 与 Meta、NVIDIA、阿里巴巴（Qwen）、Mistral AI、Google、Microsoft、Hugging Face 或本站引用的任何其他公司均无关联、未获背书或赞助。',
            '提及产品名称仅用于识别和描述目的。',
          ],
        },
        {
          title: '3. 数据准确性免责',
          paragraphs: [
            '显存估算、基准数字、困惑度损失和速度数据均为近似值，来源于社区资料、公开基准和人工整理，仅供规划参考。',
            '实际内存占用和推理速度取决于你的硬件、驱动版本、框架编译、上下文长度、batch size 和模型版本。生产部署前请务必对照官方模型卡并自行实测验证。',
            'Hugging Face 下载量和点赞数在构建时从公开 API 获取，两次部署之间可能已过时。',
          ],
        },
        {
          title: '4. 无担保声明',
          paragraphs: [
            '本站及所有工具均按「现状」提供，不附带任何明示或暗示的担保，包括但不限于准确性、特定用途适用性或非侵权性。',
            '我们不保证任何模型、量化格式或配置能在你的硬件上正常运行或满足你的质量要求。',
          ],
        },
        {
          title: '5. 责任限制',
          paragraphs: [
            '在适用法律允许的最大范围内，quantized.uk 运营方不对因使用本站而产生的任何直接、间接、附带或后果性损害承担责任，包括但不限于硬件损坏、数据丢失、部署失败或依赖显存估算所产生的后果。',
            '基于本站信息做出的决策由你自行承担全部责任。',
          ],
        },
        {
          title: '6. 第三方商标',
          paragraphs: [
            'Llama、Meta、Qwen、Mistral、Gemma、Phi、Granite、Codestral、Mixtral、DeepSeek、RTX、GeForce、CUDA、Apple、Mac、M1、M2、M3、Hugging Face、GGUF、llama.cpp、Ollama、vLLM、ExLlamaV2 等名称均为其各自所有者的商标。',
            '在本站使用这些名称不暗示任何背书。所有商标归其各自持有者所有。',
          ],
        },
        {
          title: '7. 模型许可',
          paragraphs: [
            '每个 AI 模型均受其自身许可协议约束（如 Meta Llama License、Qwen License、Apache 2.0、MIT 等）。quantized.uk 不授予任何模型权重使用许可。',
            '下载或部署任何模型前，你必须阅读并遵守 Hugging Face 官方模型卡上的许可条款。本站部署指南仅供教育参考，不凌驾于上述许可条款之上。',
          ],
        },
        {
          title: '8. 外部链接',
          paragraphs: [
            '本站链接至 Hugging Face、GitHub 及各类框架文档等第三方网站。我们不对外部网站的内容、可用性或做法负责。',
            '访问外部链接风险自负。',
          ],
        },
        {
          title: '9. 内容更新',
          paragraphs: [
            '本站模型元数据、基准数据和部署指南均为人工整理，可能随时更新而不另行通知。',
            '重大数据变更会在首页 changelog 中注明。更新频率说明见「关于」页面。',
          ],
        },
        {
          title: '10. 数据许可',
          paragraphs: [
            '本站发布的基准实测、显存数字和数据表格采用知识共享署名 4.0 国际许可协议（CC BY 4.0）：你可以复制、改编和再利用，包括商业用途，但须注明出自 quantized.uk 并链接回所用的页面。',
            '本许可只适用于本站自己的数据。模型权重、模型卡、Hugging Face 下载量以及第三方名称和商标，仍受各自所有者的条款约束。',
            '同样的数据也以 JSON 形式公开：https://quantized.uk/data/v1/models.json 和 https://quantized.uk/data/v1/gpus.json，每次更新时从索引生成，许可相同。',
          ],
        },
        {
          title: '11. 条款变更',
          paragraphs: [
            '我们可能随时更新本条款。条款变更后继续使用本站即视为接受更新后的条款。',
            '重大变更将在首页数据更新日志中注明。',
          ],
        },
      ],
    },
    about: {
      badge: '关于',
      title: '关于 quantized.uk',
      subtitle: '一份面向「真在自己硬件上跑模型」的量化参考站 — 由同样在做这件事的人维护。',
      dataRefresh: '数据最后刷新：{date}',
      backHome: '返回首页',
      linkLabel: '关于我们',
      maintainerTitle: '谁在维护？',
      maintainerContact: '直接联系维护者：',
      maintainerBody:
        'quantized.uk 是一个开发者业余维护的独立项目，起因很简单：不想再靠猜显存、翻遍 Hugging Face 找量化版本。利用空余时间更新 — 有新模型发布或实测发现更准的数字时，就会修正和扩充数据。',
      cta: '发现显存数据不对？知道该收录哪个模型？',
      ctaChangelog: '首页更新日志',
      ctaHub: '浏览模型库',
      sections: [
        {
          title: '为什么做这个站',
          paragraphs: [
            '本地跑 LLM 不该先读一篇论文。可大部分知识散落在 Reddit、Discord 和写给研究者的模型卡里 — 而不是写给盯着 12GB 显存条、犹豫 Q4_K_M 能不能塞进去的人。',
            'quantized.uk 要回答的是下载 20GB 文件之前真正会问的问题：够不够显存？该用哪种格式？质量损失多少？启动命令怎么写？',
          ],
        },
        {
          title: '我们提供什么',
          paragraphs: [
            '{n} 个模型的可搜索索引（每种量化的显存、速度、质量估算）；交互工具（显存计算器、格式向导、CLI 生成器）；真机基准测试；以及分步骤的部署 Cookbook。',
            '我们只索引元数据并链接到 Hugging Face — 不托管、不分发、不出售模型权重。每个模型仍受其自身许可协议约束。',
          ],
        },
        {
          title: '数据从哪来',
          paragraphs: [
            '模型数据来自 Hugging Face 模型卡、社区量化发布（bartowski、turboderp、unsloth 等），以及在条件允许时的本地实测。HF 下载量在每次构建时从公开 API 拉取。',
            '所有数字都是规划估算，非承诺。方法论见 Benchmarks 页面；编辑估算（如格式热度）会明确标注。生产部署前请务必在自己的硬件上验证。',
          ],
        },
        {
          title: '更新频率',
          paragraphs: [
            '没有固定排期 — 有新模型发布或发现数据缺口时更新。模型库和 Cookbook 通常每隔几周批量扩充一批。首页 changelog 记录每次数据变更及日期。',
            'HF 下载统计在每次站点重建时自动刷新。重大变更会记在 changelog 里 — 想了解最近改了什么，看那里最直观。',
          ],
        },
        {
          title: '数据如何改进',
          paragraphs: [
            '模型条目、基准数据和 Cookbook 教程均根据社区发布和亲手实测人工整理。优先收录大家真正在下载的模型、读者真正在用的硬件配置。',
            '如果某个数字看起来不对，先用显存计算器和 Hugging Face 官方模型卡交叉验证 — 后续数据批次会在首页 changelog 中修正。',
          ],
        },
        {
          title: '我们不是什么',
          paragraphs: [
            'quantized.uk 与 Meta、NVIDIA、阿里、Mistral、Google、Hugging Face 或任何模型厂商无关联。我们不是公司、不是托管商、不是模型分发平台。',
            '法律条款、责任限制和商标声明见「使用条款与免责声明」页面。',
          ],
        },
      ],
    },
    privacy: {
      badge: '隐私',
      title: '隐私政策',
      subtitle: '说明 quantized.uk 如何处理分析数据、本地存储、访客提交和第三方服务。',
      lastUpdated: '最后更新：2026 年 11 月 25 日',
      backHome: '返回首页',
      footerNote: '有疑问？请阅读',
      linkLabel: '隐私政策',
      sections: [
        {
          title: '1. 概述',
          paragraphs: [
            'quantized.uk 是一个静态网站。我们不运营用户账户、不收集支付信息、不出售个人数据。',
            '本政策说明您访问本站时可能处理的有限数据，以及您如何控制这些数据。',
          ],
        },
        {
          title: '2. 分析统计（Plausible 与 Cloudflare Web Analytics）',
          paragraphs: [
            '我们使用 Plausible Analytics（plausible.io）与 Cloudflare Web Analytics（cloudflareinsights.com）两项无 Cookie 的隐私友好型统计服务，了解聚合流量与页面性能表现 —— 例如哪些页面被访问、来自哪些国家，以及核心网页指标（Core Web Vitals）。',
            '两项服务均不使用 Cookie、不跨站追踪、不收集个人标识符；Plausible 在存储前会对 IP 地址进行匿名化处理。Plausible 在生产域名 quantized.uk 默认启用，构建时可通过 NEXT_PUBLIC_PLAUSIBLE_DOMAIN 覆盖或设为 none 关闭；嵌入卡片页（/embed/*）不加载任何分析脚本。',
            '显存计算器会上报得出结果所用的模型、量化、上下文长度、显卡（均来自本站列表）以及适配判定。你的显卡由浏览器的图形渲染器名称推测，该名称只留在你的浏览器中，不会被发送。',
            '更多细节请参阅 Plausible 数据政策（https://plausible.io/data-policy）与 Cloudflare Web Analytics 隐私说明（https://developers.cloudflare.com/analytics/web-analytics/）。',
          ],
        },
        {
          title: '3. 本地存储',
          paragraphs: [
            '浏览器可能通过 localStorage 在本地保存可选的硬件档案（所选 GPU）。页面语言直接由网址决定（英文为 /，中文为 /zh/），不再写入 localStorage。',
            '我们不会在服务端读取或同步 localStorage。分享计算器结果或提交测速时，仅包含界面上展示的配置。',
            '您可随时通过浏览器设置清除这些数据。',
          ],
        },
        {
          title: '4. 托管与日志',
          paragraphs: [
            '本站托管于 Cloudflare Pages。Cloudflare 可能处理标准 Web 服务器日志（IP、User-Agent、请求 URL）以保障安全与内容分发。',
            '我们不直接接收或存储这些日志。请参阅 Cloudflare 隐私政策了解其数据处理方式。',
            '从计算器提交测速时，所显示的配置和您填写的内容会保存在 Cloudflare D1 的私有审核队列中。队列保存用于每日限流的加密标识，不保存您的原始 IP 地址。只有通过审核的配置和结果才可能作为社区数据发布；如有公开依据链接，也需审核后发布。私有备注不会发布。',
          ],
        },
        {
          title: '5. 第三方链接',
          paragraphs: [
            '页面包含指向外部网站的链接（Hugging Face、GitHub、框架文档等），这些网站有各自的隐私政策。',
            '点击外部链接由您自行决定。',
          ],
        },
        {
          title: '6. 未成年人',
          paragraphs: [
            '本站面向开发者和技术用户。我们不会有意收集 16 岁以下儿童的数据。',
          ],
        },
        {
          title: '7. 变更',
          paragraphs: [
            '我们可能更新本政策。重大变更将在站点 changelog 中注明。',
            '更新后继续使用本站即视为接受修订后的政策。',
          ],
        },
      ],
    },
  },
} satisfies Record<Lang, unknown>;
