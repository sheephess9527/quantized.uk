# quantized.uk 项目对话归档

> 归档日期：2026-06-24  
> 站点：https://quantized.uk  
> 仓库：本地 `C:\Users\MECHREVO\quantized.uk`（公开站点不展示仓库链接）

---

## 1. 项目背景

**quantized.uk** 是基于 Next.js 14 的静态站点（`output: 'export'`），部署在 Cloudflare Pages。  
目标用户：在自有硬件（NVIDIA / Mac / VPS）上跑量化 LLM 的开发者。

核心能力：模型库、显存计算器、格式向导、CLI 生成器、基准测试、部署 Cookbook。

---

## 2. 对话时间线与已完成工作

### Phase 0 — 基础功能（早期）

- 首页真实统计（`lib/stats.ts`）
- 模型详情页 `/quant-hub/[modelId]/`
- VRAM 计算器双向模式 + 可分享 URL
- Footer、README 修正

### Phase 1–3 — 内容与工具

- Today Feed → Editor's Picks
- 格式向导、硬件档案、ExLlamaV2 CLI
- HF 构建时 stats 管道、模型对比工具
- Cookbook 4 → 15 → 22 篇，独立 `/cookbook/[slug]/` 页面
- 模型库 10 → 30 → **51**
- `CONTRIBUTING.md`

### 合规与 SEO

- `/legal` 条款与免责
- `/privacy` 隐私政策 + Plausible（`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`）
- `sitemap.xml`（89 URL）、`robots.txt`、canonical、JSON-LD
- Google / Bing 站点验证（`lib/seo.ts`，不公开仓库地址）
- `.env.example`

### Quant Hub 规模感

- **问题**：首页写 51 个模型，Hub 只显示 ~30（非分页，是 GPU 档案默认筛选）
- **修复**：默认显示全部 51；规模统计条；GPU 筛选可选；`51 / 51` 明确计数

### Cookbook 扩充（+7）

- 8GB 显卡入门、M1 8GB、WSL2、Docker GPU、Nginx 反代、AMD ROCm、Windows 原生 Ollama

### About 页面

- `/about` 双语「有人味」介绍：维护动机、数据来源、更新频率
- **隐私要求**：About / Footer / 全站均**不展示** GitHub 仓库地址

### 搜索引擎收录

- 用户完成 Google / Bing Search Console 验证
- 提交 sitemap：`https://quantized.uk/sitemap.xml`

---

## 3. 架构要点

| 项 | 说明 |
|----|------|
| 数据 | 全部在 `lib/data/*.ts`，构建时静态化 |
| i18n | `lib/i18n/translations.ts`，客户端 EN/ZH 切换 |
| 模型 | `models.ts` + `models-extra.ts` + `models-extra-2.ts` |
| HF stats | `scripts/fetch-hf-stats.mjs` prebuild |
| 部署 | `npm run build` → `out/` → Cloudflare Pages |

---

## 4. 用户反馈与处理

| 反馈 | 结论 / 处理 |
|------|-------------|
| Hub 只有 10/30 个模型 | GPU 筛选 UX + 默认显示全部 |
| Benchmarks / Cookbook 偏薄 | Cookbook +7；Benchmarks 待扩多模型 |
| 需要 Google 收录 | SEO 全套 + Search Console |
| 需要 About 页 | 已上线，无仓库链接 |
| 不要公开 GitHub 仓库 | 已从 Footer、About、JsonLd 移除 |
| 继续优化成优秀网站 | 本归档后的迭代：404、Benchmarks 扩模型、首页探索区 |

---

## 5. 待办 / 后续可优化方向

- Benchmarks 增加 Qwen / DeepSeek 等多模型实测行
- 首页精选 Cookbook / 模型入口
- 自定义 404
- `public/llms.txt` 供 AI 爬虫理解站点
- 模型详情页「相似模型」内链
- 可选：联系反馈方式（不含公开仓库）

---

## 6. 关键提交（main 分支）

| Commit | 摘要 |
|--------|------|
| `510634e` | Privacy + Plausible + Cookbook SSG + 51 models |
| `178e1aa` | Hub show-all + Cookbook +7 |
| `aca152a` | Hub 默认 51 + 规模统计条 |
| `a496e46` | About 页面 |
| `33de79d` / `56fa325` | SEO canonical + JSON-LD + 验证 |
| `03d8edd` | Google/Bing 验证码 |
| `1aa6baf` / `43b4fed` | 移除公开站点上的仓库链接 |

---

## 7. 对话原文

完整未压缩 transcript 如仍保存在 Cursor/Grok 会话目录，路径因环境而异。  
本文件为**结构化摘要**；若需逐字稿，请在 Cursor 中对应用会话导出。

---

*由 AI 助手根据项目会话整理，供维护者私有留存。*