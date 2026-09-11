export interface ChangelogEntry {
  date: string;
  en: string;
  zh: string;
}

export const dataLastUpdated = '2026-09-11';

export const dataSources = {
  models: {
    en: 'Hugging Face model cards, community quant releases (bartowski, turboderp, unsloth, city96), WikiText-2 PPL benchmarks',
    zh: 'Hugging Face 模型卡、社区量化发布（bartowski、turboderp、unsloth、city96）、WikiText-2 PPL 基准',
  },
  benchmarks: {
    en: 'Local inference runs on RTX 4090 / 3090 / M3 Max / M2 Ultra; llama.cpp b4000+, ExLlamaV2 0.2.x, vLLM 0.6.x, Ollama 0.3.x',
    zh: 'RTX 4090 / 3090 / M3 Max / M2 Ultra 本地实测；llama.cpp b4000+、ExLlamaV2 0.2.x、vLLM 0.6.x、Ollama 0.3.x',
  },
  formatHeat: {
    en: 'Editorial estimate from HF GGUF share and community discussion volume — not live analytics',
    zh: '基于 HF GGUF 下载占比与社区讨论量的编辑估算 — 非实时统计',
  },
} as const;

export const benchmarkMethodology = {
  model: 'Meta Llama 3.1 8B Instruct',
  dataset: 'WikiText-2',
  context: 4096,
  batch: 1,
  drivers: 'NVIDIA 550.x / CUDA 12.4',
  frameworks: {
    llamacpp: 'b4217 (CUDA backend)',
    exllama: 'ExLlamaV2 0.2.1',
    vllm: 'v0.6.3',
    ollama: '0.3.14',
  },
  notes: {
    en: 'Speed tests use prompt_len=128, gen_len=128, single sequence. PPL measured on WikiText-2 test split. Your results may vary ±10% depending on driver, batch size, and context length.',
    zh: '速度测试：prompt_len=128，gen_len=128，单序列。PPL 在 WikiText-2 测试集上测量。实际结果因驱动、batch size 和上下文长度可能偏差 ±10%。',
  },
} as const;

/**
 * What the runtimes are at today, separate from what the benchmarks were run on.
 *
 * The methodology block above records the versions those figures were actually
 * measured with — that is a fact about the measurement and must not be edited
 * to look current. But leaving only that on the page made the site look
 * abandoned to exactly the reader it is written for: `llama.cpp b4000+,
 * vLLM 0.6.x, Ollama 0.3.x` is two major generations behind, and a geek
 * checking whether a reference site is still alive checks precisely this.
 *
 * So both are shown, and the gap between them is stated rather than hidden.
 * `checkedAt` is when the right-hand column was last verified against the
 * projects' own release pages — update it only when actually re-checked.
 */
export const runtimeVersions = {
  checkedAt: '2026-09-11',
  current: {
    llamacpp: 'b10760',
    vllm: 'v0.29.0',
    ollama: 'v0.33.2',
  },
  note: {
    en: 'The figures on this page were measured on the stack in the left column. Those releases are now well behind current — speed numbers in particular move with the runtime, so treat them as a ranking between formats rather than as what you will see today.',
    zh: '本页的数字是在左列那套软件栈上测得的。这些版本如今已明显落后于当前版本 —— 速度尤其会随运行时变化，因此请把它们当作格式之间的排序参考，而不是你今天会跑出的数值。',
  },
} as const;

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-09-11',
    en: 'The model search is a real search box now. Every page advertises a search interface at /quant-hub/?q=…, and that URL did filter correctly — but the control producing it was an input with no name and no form around it, so nothing could submit it without JavaScript and nothing reading the markup could find the interface. It is now a proper search form, so pressing Enter produces the URL the site has been advertising all along. Searching also stopped failing on the obvious words: "coding", "vision", "gguf" and "7b" all returned nothing, because the box only looked at model names — it now covers size, task, hardware and format, and understands that people type "coding" where the data says "code". An empty result offers four suggestions drawn from the index instead of a blank page, and filtered URLs ask not to be indexed while still being crawled, so a shareable filter link cannot turn into thousands of near-duplicate pages',
    zh: '模型搜索框现在是真正的搜索框了。全站每个页面都声明了 /quant-hub/?q=… 这个搜索接口，而这个网址确实能正确筛选 —— 但产生它的那个控件是一个没有 name、也没有表单包裹的输入框，所以没有 JavaScript 就无法提交，读取页面代码的程序也发现不了这个接口。现在它是一个规范的搜索表单，按下回车就会得到站点一直在对外声明的那个网址。搜索也不再在最常见的词上失灵：此前输入「coding」「vision」「gguf」「7b」都是零结果，因为搜索只看模型名 —— 现在它覆盖参数量、用途、硬件和格式，也知道人们打的是「coding」而数据里写的是「code」。搜索无结果时会给出四个来自索引、点了一定有结果的建议，而不是一片空白；带筛选参数的网址会声明不要被收录但仍可被抓取，这样一条可分享的筛选链接不会变成成千上万个近乎重复的页面',
  },
  {
    date: '2026-09-11',
    en: 'There is now a FAQ, and every answer in it is computed rather than written. "How much VRAM do I need for a 7B" had a calculator on this site but no answer — 24 questions across sizing, quantization quality, formats, hardware and where the numbers come from now answer from the same index, each ending in a link to where you can check it. Because they are computed, they cannot drift from the calculator the way the guides once did: editing one model row moves the answers that depend on it. Three questions the index genuinely cannot settle — whether quantization hurts coding more than chat, whether an official QAT build beats a community one, and how much Q5 buys over Q4 for models that publish only one of the two — say so instead of guessing',
    zh: '现在有了常见问题页，而且每个答案都是算出来的，不是写出来的。「7B 要多少显存」这个问题，本站一直有计算器，却没有答案 —— 现在围绕体积与显存、量化掉点、格式与运行时、硬件、数据来源五个主题的 24 个问题，全部由同一份索引作答，每条末尾都带一个可以自己核对的站内链接。因为是算出来的，它们不会像当初的指南那样与计算器脱节：改动一行模型数据，依赖它的答案就会跟着变。有三个索引确实回答不了的问题 —— 量化对写代码的影响是否更大、官方 QAT 是否优于社区量化、以及只公布了单一档位数据的模型上 Q5 比 Q4 值不值 —— 页面会直说，而不是猜一个',
  },
  {
    date: '2026-09-11',
    en: 'Every format the index ships now has its own page. "What is AWQ" had nowhere to land on a site named after quantization — there were comparisons of one format against another, but nothing that simply explained one, and the 53 models shipping AWQ had no shared parent. GGUF, AWQ, EXL2 and GPTQ each now get what the format is, which runtimes read it, what one real model costs in it at 4K, the quant levels this index actually carries with their median published loss, and every indexed model that ships it — 159 new links from a format to its models. MXFP4 is explained on the GGUF page rather than made a fifth format, because that is what it is: GPT-OSS\'s native 4-bit weights are distributed as GGUF files, not as a different container',
    zh: '本索引收录的每种格式现在都有了自己的页面。「AWQ 是什么」此前在一个以量化命名的站点上无处可落 —— 有格式之间的两两对比，却没有一个页面单纯讲清楚一种格式，而提供 AWQ 的 53 个模型也没有共同的归属页。GGUF、AWQ、EXL2、GPTQ 现在各有：这个格式是什么、哪些运行时能读它、一个真实模型在 4K 下要多少显存、本索引实际收录了哪些量化档位及其公开损失中位数，以及提供该格式的全部模型 —— 从格式指向模型的新增内链共 159 条。MXFP4 放在 GGUF 页面里讲，而没有被单列为第五种格式，因为它本来就是这样：GPT-OSS 的原生 4-bit 权重是以 GGUF 文件分发的，不是另一种容器',
  },
  {
    date: '2026-09-11',
    en: 'Two comparison pages that could not compare anything are gone. "AWQ vs GPTQ" and "EXL2 vs GPTQ" each had an intersection of exactly zero — not one of the 81 models here ships both formats — so neither page could put a single row of the same weights side by side, and both filled ~650 words restating two descriptions next to each other. A pair with no model in common is no longer generated at all; the question itself is answered on the GGUF vs GPTQ page, which now says plainly that nobody ever chooses between GPTQ and AWQ for one model, and what to use instead. The old URLs redirect there permanently rather than 404',
    zh: '两个无从比起的对比页已经下线。「AWQ vs GPTQ」与「EXL2 vs GPTQ」的交集恰好为零 —— 本站 81 个模型中没有任何一个同时提供这两种格式 —— 所以这两个页面连一行「同一份权重的两种格式」都摆不出来，只能用约 650 词把两段说明并排放着。现在，没有共同模型的格式组合根本不会生成页面；这个问题改由 GGUF vs GPTQ 页面回答，它直白地说明了没有人会为同一个模型在 GPTQ 与 AWQ 之间做选择，以及该用什么替代。旧网址会永久重定向到那里，而不是变成 404',
  },
  {
    date: '2026-09-11',
    en: 'Hardware pages now say something about the hardware. All 61 were the same page with a different name on it, because what fits is decided by memory alone — every 16 GB card returned an identical list. Each page now opens with the card\'s memory bandwidth, the biggest model it holds, one that leaves room to grow, and a speed ceiling computed from the specification: generating a token means reading every weight once, so an 8B at Q4_K_M tops out near 62 tok/s on a 288 GB/s RTX 4060 Ti and near 159 on a 736 GB/s RTX 4080 Super — the same 16 GB, the same models, very different machines. That ceiling is arithmetic on published numbers, never a benchmark, and the pages say so. Doing the arithmetic also caught three of our own benchmark rows claiming speeds the card they name cannot physically reach; they have been removed rather than adjusted',
    zh: '硬件页现在真的在讲硬件。此前 61 个页面只是换了名字的同一个页面 —— 因为能装下什么完全由显存决定，每张 16 GB 的卡返回的清单一模一样。现在每页开头都会给出该卡的显存带宽、能装下的最大模型、一个留有余量的选择，以及一个由规格推算出的速度上限：生成一个 token 就要把每个权重读一遍，所以 8B 的 Q4_K_M 在 288 GB/s 的 RTX 4060 Ti 上约 62 tok/s 封顶，在 736 GB/s 的 RTX 4080 Super 上约 159 —— 同样 16 GB、同样的模型，却是两台很不一样的机器。这个上限是公开数字的算术结果，不是跑分，页面上也如实说明。做这个算术的同时还发现本站自己有三条基准数据，其速度是所标显卡在物理上达不到的；这些行已被删除，而不是调整数值',
  },
  {
    date: '2026-09-11',
    en: 'The formats page now says something. It was 65 words — the thinnest page on a site named after quantization, and the only way in to the six format comparisons. It now opens with a table counted from the index: how many of the 81 models ship each format, the median published perplexity loss at 4-bit and how many measurements that median is drawn from, and the quant levels this index actually carries. HQQ appears in it as 0 of 81, with a line saying so — it is documented here as reference, and you will not find it in the Hub. Formats where nobody published a perplexity figure show a dash rather than an estimate',
    zh: '格式页终于有内容了。此前它只有 65 词 —— 一个以量化命名的站点上最单薄的页面，却是六个格式对比页唯一的入口。现在页面开头是一张由索引统计出来的表：81 个模型中有多少个提供该格式、4-bit 档位已公布困惑度损失的中位数及其样本量，以及本索引实际收录的量化档位。HQQ 在表中显示为 0 / 81，并附有说明 —— 它作为参考资料收录，Hub 里找不到它。没有公开困惑度数据的格式显示为短横线，而不是估算值',
  },
  {
    date: '2026-09-11',
    en: 'Model pages now explain themselves. Each of the 81 was a table and little else — around 220 words, nothing a person could skim for "will this run on my card" and nothing an AI assistant could quote. Every page now carries three short sections and three questions answered from that model\'s own numbers: what it costs at 4K, what longer context adds, and which build to download. Nothing is written by hand, so nothing can drift from the data — and a hybrid-attention model gets visibly different text from a conventional one. Deployment guides also declare when they were last changed, and which models and hardware they are actually about',
    zh: '模型页现在会自己讲清楚。此前 81 个页面几乎只有表格 —— 约 220 词，人扫一眼看不出「我的卡跑不跑得动」，AI 助手也无从引用。现在每页都有三段简短说明和三个由该模型自身数字回答的问题：4K 下要多少显存、上下文变长会多花多少、该下载哪个版本。这些文字全部由数据生成，因此不会与数据脱节 —— 混合注意力的模型得到的文案与常规模型明显不同。部署指南也开始声明最近一次修改时间，以及它们实际讲的是哪些模型和硬件',
  },
  {
    date: '2026-09-11',
    en: 'The hardware database reaches the current generation. Blackwell (RTX 5090 down to 5060), RDNA 4 (RX 9070 XT and 9070) and the M4 and M5 Macs — including the 256GB and 512GB Mac Studio configurations — now have pages, 18 cards in all. Until today the newest NVIDIA consumer card here was the RTX 4090 from 2022, so "what can an RTX 5090 run" had no answer on a site whose whole premise is that question. None of these cards has been benchmarked here, and each page says so rather than implying its estimates were measured',
    zh: '硬件数据库更新到当代。Blackwell（RTX 5090 到 5060）、RDNA 4（RX 9070 XT 与 9070），以及 M4、M5 系列 Mac（含 256GB 与 512GB 的 Mac Studio 配置）现在都有了独立页面，共 18 张卡。在今天之前，站内最新的 NVIDIA 消费级显卡还是 2022 年的 RTX 4090 —— 而「RTX 5090 能跑什么」恰恰是本站存在的理由。这些卡都没有在本站实测过，每个页面都会如实说明，而不是让估算值看起来像实测值',
  },
  {
    date: '2026-09-11',
    en: 'Findability and honest labels. Every hardware page now has a description that names the card and the largest model it runs — 36 of the 43 previously shared just nine descriptions between them, because the template only knew the memory size. The tools index and the data changelog are real pages instead of 404s, the navigation finally links the 43 hardware pages and the format comparisons, and the homepage stopped printing the same update three times. Model counts are computed from the index rather than typed in six places, and the date beside a NEW badge now says "added" — it is when this index picked the model up, not when the model was released',
    zh: '可发现性与标签诚实度。每个硬件页面的描述现在会写明具体显卡和它能跑的最大模型 —— 此前 43 个页面中有 36 个只共用九条描述，因为模板里只有显存大小这一个变量。工具索引与数据更新日志从 404 变成了真实页面，导航里终于有了 43 个硬件页和格式对比的入口，首页也不再把同一条更新印三遍。模型数量改为从索引实时计算，而不是在六个地方手写；NEW 徽章旁的日期现在标注为「收录」—— 那是本索引收录它的时间，不是模型的发布时间',
  },
  {
    date: '2026-09-11',
    en: 'The calculator learned that 2026 models do not all cache attention the same way, and the first two are in. Qwen3.8 27B runs only 16 of its 64 layers on full attention — the rest keep a fixed recurrent state — so the old arithmetic overstated its KV cache fourfold, claiming 8GB at 32K context where the measured figure is 2GB. Sizing now follows the model\'s actual attention shape and reproduces published measurements at 8K, 32K and 262K. Ministral 3 8B joins it, sized from Mistral\'s own GGUF releases. Where nobody has published a per-level quality loss, the column now shows a dash instead of a number',
    zh: '计算器现在知道 2026 年的模型并非都用同一种方式缓存注意力，首批两个模型也已入库。Qwen3.8 27B 的 64 层里只有 16 层是全注意力、其余保留固定大小的循环状态，旧算法把它的 KV 缓存高估了四倍 —— 在 32K 上下文下算出 8GB，而实测是 2GB。现在按模型真实的注意力结构计算，并与 8K、32K、262K 三个公开实测值吻合。同批加入的还有 Ministral 3 8B，其体积来自 Mistral 官方发布的 GGUF。凡是没有人公布过逐档质量损失的，该列现在显示一个破折号，而不是一个数字',
  },
  {
    date: '2026-09-11',
    en: 'Two crawling faults fixed. Every internal link to a model whose name contains a version number — llama-3.1-8b, qwen2.5-7b, phi-3.5-mini — was losing its trailing slash and redirecting: 2,101 links across 46 URLs, and 27 model pages had no direct link to their own canonical address. And the language switcher was a button rather than a link, so the 164 Chinese pages had no crawlable route into them from anywhere on the site. Both are now checked by the build, so neither can come back quietly',
    zh: '修掉两处抓取层面的缺陷。凡是名字里带版本号的模型 —— llama-3.1-8b、qwen2.5-7b、phi-3.5-mini —— 指向它们的站内链接都会丢掉尾部斜杠并触发跳转：涉及 46 个 URL、2,101 条链接，其中 27 个模型页在自己的规范地址上没有任何直接内链。另外语言切换器是按钮而不是链接，导致 164 个中文页面在全站没有任何可抓取的入口。两处现在都由构建检查把关，不会再悄悄回退',
  },
  {
    date: '2026-09-08',
    en: 'Search and feedback groundwork. Hardware pages now say when a card has real measured runs behind it — four of the 43 do — and name the other cards that share its memory budget, because the model list is decided by VRAM and those pages were otherwise near-copies of each other. Structured data was claiming 73 models on pages that listed 30; it now matches what is on the page, on all 329 of them. And guides and the command generator ask whether the thing actually ran: copying a command is not the same as it working, and the correction email shows you its exact text before your mail app opens',
    zh: '搜索与反馈的基础工作。硬件页面现在会说明这张卡是否有真实实测记录（43 张里有 4 张），并列出显存预算相同的其他显卡 —— 因为能跑哪些模型由显存决定，否则这些页面彼此几乎是副本。结构化数据此前在只列出 30 个模型的页面上声称有 73 个；现在全部 329 个页面都与页面实际内容一致。另外，指南和命令生成器会问你「它真的跑起来了吗」：复制命令不等于它能用；而勘误邮件在打开你的邮件应用之前，会先把要发送的原文完整展示给你',
  },
  {
    date: '2026-09-08',
    en: 'Two fixes found by running the verification matrix rather than reading the code. Switching models in the VRAM calculator kept the previous model\'s quant level selected — pick Llama 3.1 8B at EXL2, switch to GPT-OSS 20B, and it confidently sized a file that does not exist; the level now snaps to one the model ships, and any level the index has no build for is labelled as an estimate from the generic table. And the calculator was deleting the card from its own address bar in forward mode, so a shared link lost the hardware the verdict was about',
    zh: '两处修复，来自实际跑验证矩阵而不是读代码。在显存计算器里切换模型时会保留上一个模型的量化档位 —— 选中 Llama 3.1 8B 的 EXL2 再切到 GPT-OSS 20B，它会一本正经地给出一个并不存在的文件的体积；现在档位会自动切到该模型确实提供的一档，而索引中没有对应构建的档位会被标注为「仅为通用表估算」。另外计算器在正向模式下会把显卡从自己的地址栏里删掉，导致分享出去的链接丢失了这个结论所针对的硬件',
  },
  {
    date: '2026-09-08',
    en: 'Guides and legibility. The 8GB starter guide was overstating VRAM by about 2GB against this site’s own calculator and told readers a 14B "needs 36GB+" when it needs 11 — those and the Mac and dual-GPU guides are rewritten from the index, with prerequisites, a way to check the model really ran on the GPU, and what to do when it does not fit. Reading times are now derived from the article instead of typed by hand (22 of 23 were fiction), a guide rewritten since its last real run says "written against" rather than claiming a verification date, and every text colour on the site now clears the WCAG AA contrast floor — 3,175 text nodes checked, none failing. Charts carry a table of the same figures in the static HTML, filter chips announce whether they are selected, and context lengths print the exact token count',
    zh: '教程与可读性。8GB 入门指南的显存数字比本站计算器高出约 2GB，还告诉读者 14B「需要 36GB 以上」（实际 11GB）—— 该指南连同 Mac 与双卡指南已按索引重写，补上前置条件、如何确认模型真的跑在 GPU 上，以及装不下时该怎么办。阅读时长改为从正文推算而不再手写（23 篇里有 22 篇是虚构的）；最近修改后未重新实机运行的指南改为标注「面向的技术栈」，不再声称验证日期；站内所有文字颜色现已达到 WCAG AA 对比度下限 —— 实测 3,175 个文本节点，无一不达标。图表在静态 HTML 中附带同数据的表格，筛选按钮会播报是否选中，上下文长度会标出精确 token 数',
  },
  {
    date: '2026-09-08',
    en: 'The homepage now starts with your hardware. Pick your card and what you want it for, and it answers with the largest model that fits, one that leaves room for longer context, and the fastest measured — each with the memory maths and a link into the calculator. Popular cards, a sample of the real-hardware benchmark rows, and a place to report a wrong number sit below it; the format heat index and radar moved to the formats page, and the full changelog is still here, collapsed',
    zh: '首页现在从你的硬件开始。选好显卡和用途，它会给出装得下的最大模型、留有余量的一个，以及实测最快的一个 —— 每个都附显存算法和进入计算器的链接。下方是常见显卡、真机基准的样本行，以及反馈数字错误的入口；格式热度与雷达图移到了格式页，完整更新日志仍在本页，默认折叠',
  },
  {
    date: '2026-09-08',
    en: 'The tools now remember what you picked. Choosing a model in the VRAM calculator and moving to the command generator no longer means entering it again — model, quant level and context length carry across, with a shared link always taking precedence over what you have stored. The calculator also links straight to the command for the configuration on screen, and when a model does not fit your card it says what to change and what that would cost',
    zh: '工具之间现在会记住你的选择。在显存计算器里选好模型再去命令生成器，不必重新输入一遍 —— 模型、量化档位与上下文长度会带过去，而分享链接始终优先于你本地保存的配置。计算器还能直接跳到当前配置对应的命令；当模型装不进你的显卡时，它会说明该改什么、以及改完是多少',
  },
  {
    date: '2026-09-08',
    en: 'Numbers now say where they come from. The compare tool had a "Q4_K_M VRAM" row that never moved when you changed the context length, beside copy claiming it did — it now shows an estimated row that tracks the control and a published row that is fixed, each labelled. The 6:1 "8B wins" scoreboard is gone: it counted memory twice, counted how much of each model this site happens to index, and treated fewer parameters as an advantage',
    zh: '数字现在会交代自己的来源。对比工具此前有一行 "Q4_K_M 显存" 在切换上下文时纹丝不动，而旁边的说明却声称它会随之变化 —— 现在拆成会跟随控件的预估行和固定的已发布行，各自标注。6:1 "8B 胜出" 的比分已移除：它把内存算了两次、把本站收录了多少变体也算进去，还把参数更少当成优势',
  },
  {
    date: '2026-09-08',
    en: 'Model cards stopped combining configurations. The stats row showed the smallest VRAM of any quant beside the fastest speed of another, as if both were available at once; it now reports one named configuration (Q4_K_M · RTX 4090 · batch 1). The GPU chips and hardware pages still count differently — 60 versus 51 on a 4060 Ti 16G — but both now share one function and each says which rule it used',
    zh: '模型卡片不再拼接不同配置。统计行此前把某个档位的最低显存与另一个档位的最快速度并排展示，仿佛两者可以同时获得；现在统一为一套具名配置（Q4_K_M · RTX 4090 · batch 1）。显卡快捷筛选与硬件页的计数仍然不同 —— 4060 Ti 16G 上是 60 与 51 —— 但两者现在共用同一个函数，且各自说明了所用规则',
  },
  {
    date: '2026-09-08',
    en: 'Correctness fixes in the generated commands: the local llama.cpp server now binds 127.0.0.1 instead of publishing an unauthenticated endpoint on every interface, the download step installs the CLI it uses, and the claim that vLLM is CUDA-only was simply wrong — it ships official ROCm builds. The Chinese homepage no longer carries English text in Editor\'s Picks, and its RSS link points at the Chinese feed the page header already advertised',
    zh: '生成命令的修正：本机 llama.cpp 服务改为绑定 127.0.0.1，不再把未鉴权的端点暴露在所有网卡上；下载步骤会先安装它所需的 CLI；此前"vLLM 仅支持 CUDA"的说法是错的 —— 它提供官方 ROCm 构建。中文首页的编辑推荐不再夹带英文，其 RSS 链接也指向页面头部早已声明的中文订阅源',
  },
  {
    date: '2026-09-01',
    en: 'New: format comparison pages. GGUF vs AWQ, GGUF vs EXL2 and four more, each comparing hardware support, runtime and adoption — and then listing the models that publish weights in both formats, where the two rows describe the same model and the comparison stops being editorial. Where no model ships both, the page says so rather than implying otherwise',
    zh: '新增：格式对比页。GGUF 与 AWQ、GGUF 与 EXL2 等六组，对比硬件支持、运行时与采用率，并列出同时发布两种格式权重的模型 —— 此时两行描述的是同一个模型，对比不再只是编辑判断。若没有模型同时提供两种格式，页面会如实说明，而不是含糊带过',
  },
  {
    date: '2026-09-01',
    en: 'The calculator answers instead of listing. Its hardware panel showed 43 bars, almost all green — a lot of ink for very little answer. It now leads with the fact you came for ("fits comfortably on 16 of 43 cards — smallest is the Instinct MI100 32G"), gives a verdict for your own card if you have set one, and keeps the full list one click away. The 79-model dropdowns in all three tools are grouped by size instead of listed in data-entry order',
    zh: '计算器改为给结论，而不是罗列。硬件面板此前平铺 43 根柱子且大多为绿色 —— 占了大量篇幅却几乎没有回答问题。现在它先给出你真正想要的事实（"43 张卡中 16 张可从容运行 —— 最小的是 Instinct MI100 32G"），如果你设置了自己的显卡还会单独给出裁决，完整列表则收在一次点击之后。三个工具里 79 项的模型下拉也改为按尺寸分组，不再按录入顺序排列',
  },
  {
    date: '2026-09-01',
    en: 'New: a page per GPU. All 43 cards in the database now have one — "RTX 4060 Ti 16G — what LLMs can it run?" answers with 51 of the 79 indexed models, each at the best quant level that still leaves headroom at 4K context, grouped by size. The data always existed; it had only ever been a filter parameter, never a page. 88 new pages across both languages',
    zh: '新增：每张显卡一个页面。数据库中全部 43 张卡都已覆盖 —— "RTX 4060 Ti 16G 能跑哪些大模型？"给出 79 个索引模型中的 51 个，各自取 4K 上下文下仍留有余量的最佳量化档位，并按尺寸分组。这些数据一直都在，只是此前仅作为筛选参数存在，从未成为页面。中英合计新增 88 个页面',
  },
  {
    date: '2026-09-01',
    en: 'The four tool pages now explain themselves. Each carried a single heading and no body text — a bare widget with nothing to calibrate against. They now document how the VRAM estimate is derived, why context length dominates it, where the CLI identifiers come from, and why some commands show a placeholder, plus a FAQ on each, in both languages',
    zh: '四个工具页现在会自我说明。此前每页只有一个标题、没有任何正文 —— 一个孤立的交互控件，读者无从校准。现在它们分别说明显存估算如何得出、为何上下文长度主导结果、CLI 命令里的标识符从哪来、以及为什么有些命令是占位符，并各配一组常见问题，中英双语',
  },
  {
    date: '2026-09-01',
    en: 'The inference speed chart is readable again: 13 of its 18 bars were all labelled "RTX 4090", so nothing on screen said which model each one measured. Every bar now names its model and hardware, and a key explains what the colours mean (they encode the framework, which was never stated). Tap targets on phones meet the 44px minimum',
    zh: '推理速度图恢复可读：18 根柱子里有 13 根标签都是 "RTX 4090"，屏幕上没有任何信息表明每根对应哪个模型。现在每根柱子都标注模型与硬件，并新增图例说明颜色含义（颜色一直代表推理框架，但此前从未说明）。手机端点击目标达到 44px 下限',
  },
  {
    date: '2026-09-01',
    en: 'The homepage quality figure now names the level it describes: 97.1% retained at Q4_K_M, median across all 79 models, with the 1.4–5.2% spread shown beside it. The old "98.4% avg accuracy" averaged whichever quant level happened to be each model\'s best, so it moved whenever a level was added to the data. The Chinese benchmarks table is also fully translated — its notes column had been English-only',
    zh: '首页的质量数字现在会说明自己描述的是哪一档：Q4_K_M 下保留 97.1%，取全部 79 个模型的中位数，并在旁标注 1.4–5.2% 的区间。旧的"98.4% 平均精度"是对每个模型各自最好的那一档求平均，因此往数据里补一个档位就会让它变动。中文版基准表格也已完整翻译 —— 此前备注列整列是英文',
  },
  {
    date: '2026-09-01',
    en: 'The model index is now in the HTML. /quant-hub/ was rendered entirely in the browser, so its static page carried no headings and none of the 79 model names — the site\'s most valuable page was blank to search engines and to anyone without JavaScript. It now ships all 79 cards and filters on top of them',
    zh: '模型索引进入 HTML。此前 /quant-hub/ 完全由浏览器渲染，静态页面里没有任何标题、也没有 79 个模型名 —— 全站最核心的页面对搜索引擎和无 JavaScript 环境等于空白。现在 79 张卡片直接写入 HTML，筛选在其之上叠加',
  },
  {
    date: '2026-09-01',
    en: 'VRAM calculator no longer answers a question you did not ask: with no model selected it used to fall through to a generic 7B and print 4.98 GB plus a green verdict on all 43 GPUs. Chinese readers get their own RSS feed at /zh/feed.xml, every page now advertises its feed, and /rss.xml resolves instead of 404ing',
    zh: '显存计算器不再回答你没问的问题：此前未选模型时会回落到通用 7B，给出 4.98 GB 并对全部 43 张显卡打绿灯。中文读者现在有独立的 /zh/feed.xml 订阅源，每个页面都声明了自己的 feed，/rss.xml 也不再 404',
  },
  {
    date: '2026-09-01',
    en: 'Homepage paints without waiting for JavaScript: the headline was being shipped as opacity:0 and only became visible after the bundle loaded, which put real-user LCP at P75 3.1s on a prerendered site. Entrance animation is now pure CSS and framer-motion is gone — 33 kB less JavaScript on first load',
    zh: '首页无需等待 JavaScript 即可绘制：此前标题以 opacity:0 发出，要等 bundle 加载后才可见，导致预渲染站点的真实用户 LCP P75 达 3.1 秒。入场动画改为纯 CSS，framer-motion 已移除 —— 首屏 JavaScript 减少 33 kB',
  },
  {
    date: '2026-08-23',
    en: 'Format surfaces now agree with the index: the homepage badges, the "formats tracked" stat and the Hub filters all derive from the formats an indexed model actually ships (4). HQQ stays in the format explainer as reference, but no longer advertises a browse path with no results',
    zh: '格式相关的展示与索引对齐：首页徽章、"格式追踪"统计与 Hub 筛选均改为从实际有模型的格式推导（4 种）。HQQ 仍保留在格式科普中作为参考，但不再引导到没有结果的浏览路径',
  },
  {
    date: '2026-08-23',
    en: 'Format wizard: quant levels are now per-format — choosing "easiest setup" used to print EXL2 · Q4_K_M and AWQ · Q4_K_M, levels that exist in neither format. The runtime column also follows the format, so an AMD reader no longer sees EXL2 recommended with a ROCm runtime next to the reason explaining EXL2 cannot run on ROCm',
    zh: '格式向导：量化档位改为按格式区分 —— 此前选择"最易上手"会给出 EXL2 · Q4_K_M、AWQ · Q4_K_M 这类两种格式里都不存在的档位。框架推荐也改为跟随格式，AMD 读者不会再看到 EXL2 配 ROCm 运行时，却在旁边读到"EXL2 无法在 ROCm 上运行"',
  },
  {
    date: '2026-08-23',
    en: 'Homepage layout: the stats bar had been painted on top of the job-path cards since those were introduced, covering all three descriptions, and the hero was clipped on phones — the VRAM calculator button and format badges were partly unreachable. Navbar no longer overflows at tablet width',
    zh: '首页排版：统计条自 job path 卡片引入后就一直盖在卡片上，遮住全部三行说明；Hero 在手机上被裁切，显存计算器按钮与格式徽章有一部分点不到。导航栏在平板宽度下不再溢出',
  },
  {
    date: '2026-08-20',
    en: 'CLI generator now emits commands that actually run: the real GGUF repo and filename instead of a placeholder, `ollama run hf.co/…` instead of a tag that 404s, and a repo id for vLLM instead of the model\'s display name. llama.cpp build flags updated to the GGML_* names (the old LLAMA_* ones are ignored, giving a silent CPU-only build)',
    zh: 'CLI 生成器现在给出真能跑的命令：用真实 GGUF 仓库与文件名替代占位符，Ollama 改用 `ollama run hf.co/…`（原先生成的 tag 会 404），vLLM 传仓库 id 而非模型展示名。llama.cpp 编译参数改为 GGML_* 新命名（旧的 LLAMA_* 会被忽略，静默编出纯 CPU 版本）',
  },
  {
    date: '2026-08-20',
    en: 'VRAM calculator: forward mode now uses each model\'s own measured bits-per-weight instead of the generic per-level table, matching what reverse mode always did. GPT-OSS 20B at Q8_0 was overstated by 67% (21.1GB → 12.7GB). EXL2 3.5bpw is selectable again',
    zh: '显存计算器：正向模式改用模型自身实测 bpw，而非通用档位表（反向模式一直如此）。GPT-OSS 20B 的 Q8_0 此前被高估 67%（21.1GB → 12.7GB）。EXL2 3.5bpw 档位恢复可选',
  },
  {
    date: '2026-08-18',
    en: 'Chinese edition audit: every /zh page now declares zh-Hans in the HTML itself, the 23 guide links on /zh/cookbook stopped bouncing readers to English, and structured data on 102 Chinese pages describes the Chinese page rather than the English one',
    zh: '中文站审计：/zh 页面的 HTML 现在自身声明 zh-Hans；/zh/cookbook 上 23 个指南链接不再把读者弹回英文站；102 个中文页面的结构化数据改为描述中文页本身',
  },
  {
    date: '2026-08-18',
    en: 'Chinese edition is now indexable: /zh/** mirrors all 113 pages with hreflang pairing, and the Chinese text is baked into the static HTML rather than swapped in after load',
    zh: '中文站现已可被索引：/zh/** 镜像全部 113 个页面并配对 hreflang，中文文本直接写入静态 HTML，而非加载后再替换',
  },
  {
    date: '2026-08-08',
    en: 'Model index +4 → 79: Qwen3-VL 8B / 30B-A3B, Magistral Small 1.2, Seed-OSS 36B — picked for constrained hardware (multimodal on a 12GB card, small-active MoE for unified memory, 512K context at dual-GPU size). Qwen2-VL 7B marked superseded',
    zh: '模型索引 +4 → 79：Qwen3-VL 8B / 30B-A3B、Magistral Small 1.2、Seed-OSS 36B —— 面向受限硬件挑选（12GB 卡上的多模态、适合统一内存的小激活 MoE、双卡尺寸的 512K 上下文）。Qwen2-VL 7B 标记为过时',
  },
  {
    date: '2026-08-08',
    en: 'New cookbook: running GPT-OSS 20B/120B locally without re-quantizing (23 guides). VRAM calculator now offers MXFP4 — picking Q4_K_M for GPT-OSS overstated weights by ~14%',
    zh: '新增 Cookbook：本地运行 GPT-OSS 20B/120B 且不重新量化（共 23 篇）。显存计算器新增 MXFP4 档 —— 此前给 GPT-OSS 选 Q4_K_M 会把权重高估约 14%',
  },
  {
    date: '2026-08-07',
    en: 'Model index +4 → 75: GPT-OSS 20B/120B (native MXFP4), GLM-4.5-Air 106B-A12B, Devstral Small 1.1 — MoE-heavy batch for 16GB cards and unified-memory Macs',
    zh: '模型索引 +4 → 75：GPT-OSS 20B/120B（原生 MXFP4）、GLM-4.5-Air 106B-A12B、Devstral Small 1.1 —— 面向 16GB 显卡与统一内存 Mac 的 MoE 批次',
  },
  {
    date: '2026-07-22',
    en: 'Polish: re-rendered og.png (71+ models), all 22 cookbook guides have verified stack banners',
    zh: '打磨：重渲 og.png（71+ 模型文案），全部 22 篇 Cookbook 已加验证技术栈条',
  },
  {
    date: '2026-07-22',
    en: 'Cadence pack: +4 models (Gemma 3 27B, R1-Llama-8B, Phi-4, Qwen3 1.7B), superseded tags, measured/estimated labels, Hub “recent”, weekly updates, RSS, cookbook verified stack (71 models)',
    zh: '保鲜组合：+4 模型（Gemma 3 27B、R1-Llama-8B、Phi-4、Qwen3 1.7B）、过时标注、实测/估算、Hub「最近新增」、本周更新、RSS、Cookbook 验证栈（共 71 个）',
  },
  {
    date: '2026-06-26',
    en: 'UX for real traffic: job paths, mobile GPU profile, OG/favicon, honest format heat, feedback email',
    zh: '面向真实访问：任务入口、移动端 GPU 档案、OG/图标、格式热度诚实标注、反馈邮箱',
  },
  {
    date: '2026-06-26',
    en: 'Model index +4: Qwen3 4B, Qwen3-Coder 30B-A3B, Mistral Large 3, GLM-4-9B (67 total)',
    zh: '模型库 +4：Qwen3 4B、Qwen3-Coder 30B-A3B、Mistral Large 3、GLM-4-9B（共 67 个）',
  },
  {
    date: '2026-06-26',
    en: 'QA fixes: HF stats merge on failure, ≤3B filter, CLI/VRAM tool bugs, i18n polish',
    zh: 'QA 修复：HF 统计合并、≤3B 筛选、CLI/VRAM 工具 bug、i18n 优化',
  },
  {
    date: '2026-06-26',
    en: 'Model index +5: Qwen3 32B, 30B-A3B MoE, 235B-A22B, DeepSeek-V3, DeepSeek-R1 (63 total)',
    zh: '模型库 +5：Qwen3 32B、30B-A3B MoE、235B-A22B、DeepSeek-V3、DeepSeek-R1（共 63 个）',
  },
  {
    date: '2026-06-26',
    en: 'Model index +7: Qwen3 8B/14B, Gemma 3 4B/12B, Llama 4 Scout/Maverick, Llama 3.1 405B (58 total)',
    zh: '模型库 +7：Qwen3 8B/14B、Gemma 3 4B/12B、Llama 4 Scout/Maverick、Llama 3.1 405B（共 58 个）',
  },
  {
    date: '2026-06-25',
    en: 'Cookbook TOC scroll highlight, code block copy, Quant Hub Markdown export',
    zh: 'Cookbook 目录滚动高亮、代码块一键复制、Quant Hub Markdown 导出',
  },
  {
    date: '2026-06-25',
    en: 'Cookbook reading progress bar, model HF link copy, Quant Hub shareable filter URLs',
    zh: 'Cookbook 阅读进度条、模型 HF 链接复制、Quant Hub 可分享筛选 URL',
  },
  {
    date: '2026-06-25',
    en: 'Breadcrumb nav + JSON-LD, cookbook article TOC, Quant Hub GPU quick-filter chips',
    zh: '面包屑导航 + JSON-LD、Cookbook 文章目录锚点、Quant Hub GPU 一键筛选芯片',
  },
  {
    date: '2026-06-25',
    en: 'Related cookbook guides, similar-model cards on detail pages, hero latest-update badge',
    zh: 'Cookbook 相关指南推荐、模型详情页相似模型卡片、首页 Hero 最新更新徽章',
  },
  {
    date: '2026-06-25',
    en: 'Homepage explore strip, 404 page, multi-model benchmarks (Qwen 7B/32B, DeepSeek-R1 14B), llms.txt for AI crawlers',
    zh: '首页探索区块、404 页面、多模型基准测试（Qwen 7B/32B、DeepSeek-R1 14B）、AI 爬虫 llms.txt',
  },
  {
    date: '2026-06-24',
    en: 'Added About page (/about) — maintainer story, update cadence, contribution guide',
    zh: '新增关于页面（/about）— 维护者介绍、更新频率、参与贡献方式',
  },
  {
    date: '2026-06-24',
    en: 'Quant Hub: default to all 51 models visible; scale stats bar; clearer GPU filter UX',
    zh: 'Quant Hub：默认显示全部 51 个模型；规模统计条；GPU 筛选提示更清晰',
  },
  {
    date: '2026-06-24',
    en: 'SEO: canonical URLs, JSON-LD, per-page metadata, Google/Bing verification env vars',
    zh: 'SEO：canonical URL、JSON-LD 结构化数据、页面级 metadata、Google/Bing 验证环境变量',
  },
  {
    date: '2026-06-24',
    en: 'Quant Hub: show-all toggle when GPU profile active; Cookbook +7 guides (8GB GPU, WSL2, Docker GPU, Nginx, AMD ROCm)',
    zh: 'Quant Hub：GPU 档案筛选时可一键显示全部模型；Cookbook 新增 7 篇（8GB 显卡、WSL2、Docker GPU、Nginx、AMD ROCm）',
  },
  {
    date: '2026-06-24',
    en: 'Privacy Policy + Plausible analytics, cookbook standalone pages (/cookbook/[slug]), model index expanded to 51',
    zh: '隐私政策 + Plausible 分析、Cookbook 独立文章页（/cookbook/[slug]）、模型库扩展至 51 个',
  },
  {
    date: '2026-06-24',
    en: 'Added Terms & Disclaimer page (/legal) with trademark notice and liability disclaimer',
    zh: '新增使用条款与免责声明页面（/legal），含商标声明和责任限制',
  },
  {
    date: '2026-06-24',
    en: 'Phase 3: HF live stats pipeline, model A vs B compare tool, cookbook expanded to 15 guides',
    zh: 'Phase 3：HF 实时数据管道、模型 A vs B 对比工具、Cookbook 扩展至 15 篇',
  },
  {
    date: '2026-06-24',
    en: 'Expanded model index to 30+ entries; added format wizard, hardware profile, ExLlamaV2 CLI, SEO (sitemap/OG), data transparency',
    zh: '模型库扩展至 30+；新增格式向导、硬件档案、ExLlamaV2 CLI、SEO（sitemap/OG）、数据透明度改进',
  },
  {
    date: '2026-06-24',
    en: 'Model detail pages, GPU reverse lookup, shareable VRAM calculator URLs, real homepage stats',
    zh: '模型详情页、GPU 反向查询、可分享显存计算器 URL、真实首页统计',
  },
  {
    date: '2025-06-10',
    en: 'Initial launch: Quant Hub, VRAM calculator, CLI generator, benchmarks, cookbook',
    zh: '首次上线：模型库、显存计算器、CLI 生成器、基准测试、部署指南',
  },
];