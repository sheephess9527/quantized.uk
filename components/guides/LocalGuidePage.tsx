import { Suspense } from 'react';
import Link from 'next/link';
import VRAMCalculator from '@/components/tools/VRAMCalculator';
import { localGuides, localGuideSlugs, type LocalGuide } from '@/lib/data/local-guides';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { BEST_TIERS, APPLE_LADDER, bestPage } from '@/lib/utils/best-page';
import { fitsOnGpu, gpuSlug, GPU_PAGE_BUCKETS, GPU_PAGE_CONTEXT, type GpuFit } from '@/lib/utils/gpu-page';
import { matchesParamRange } from '@/lib/utils/param-buckets';
import { isSuperseded } from '@/lib/utils/model-meta';

type Lang = 'en' | 'zh';
const panel = 'glass rounded-2xl p-5 sm:p-6 space-y-3';
const link = 'text-cyan-300 hover:underline';
const cell = 'px-3 py-3 align-top border-b border-white/10';

function activeFits(gpu: GPU) {
  return fitsOnGpu(gpu).filter(({ model }) => !isSuperseded(model) && model.contextLength >= GPU_PAGE_CONTEXT);
}

function ModelFit({ fit, lang }: { fit: GpuFit; lang: Lang }) {
  return <div>
    <Link className={link} href={`${lang === 'zh' ? '/zh' : ''}/quant-hub/${fit.model.id}/`}>{fit.model.name}</Link>
    <div className="text-xs text-slate-400 mt-1">{fit.quant.format} · {fit.quant.level} · {fit.totalGB.toFixed(1)} GiB</div>
  </div>;
}

function Picks({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const labels = zh ? { chat: '对话', code: '编程', multimodal: '多模态' } : { chat: 'Chat', code: 'Code', multimodal: 'Multimodal' };
  return <>
    <p>{zh ? '以 NVIDIA 显卡为例，每种用途选取预计可留出显存余量的较大模型。同一模型入选多个用途时只列一次。数字按单路文本推理估算，图像输入还需计入视觉编码器。' : 'For each task, these NVIDIA tiers favor a larger model that leaves memory headroom. A model selected for two tasks appears once. Estimates assume one text sequence. Image inputs also need encoder memory.'}</p>
    {BEST_TIERS.filter(t => t.kind === 'vram').map(t => <section className={panel} key={t.slug}>
      <h2 className="text-xl font-semibold"><Link className={link} href={`${zh ? '/zh' : ''}/best/${t.slug}/`}>{t.vram} GB</Link></h2>
      <ul className="grid gap-4 md:grid-cols-3">{bestPage(t).picks.filter(p => p.model.contextLength >= GPU_PAGE_CONTEXT).slice(0, 3).map(p =>
        <li key={p.model.id}><p className="text-sm text-slate-400">{p.useCases.map(c => labels[c]).join(' / ')}</p><ModelFit fit={p} lang={lang} /></li>
      )}</ul>
    </section>)}
  </>;
}

function Requirements({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const buckets = [...GPU_PAGE_BUCKETS].reverse();
  const cards = ['rtx4060ti', 'rtx3060', 'rtx4060ti16', 'rtx4090', 'rtx5090'];
  return <section className={panel}>
    <p>{zh ? '每格选一个能留出余量的模型，列出具体量化版本和预计占用。空格表示该档未找到符合条件的目录模型。' : 'Each cell shows one catalog model with headroom, its quantization and its estimated memory. A dash means no qualifying example was found in that size class.'}</p>
    <div className="overflow-x-auto"><table className="text-sm text-left w-full min-w-[760px]">
      <thead><tr>{[zh ? '显卡' : 'GPU', ...buckets].map(label => <th className={cell} scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{cards.map(id => {
        const gpu = gpuDatabase.find(g => g.id === id);
        if (!gpu) return null;
        const fits = activeFits(gpu);
        return <tr key={id}><th scope="row" className={cell}><Link className={link} href={`${zh ? '/zh' : ''}/gpu/${gpuSlug(gpu)}/`}>{gpu.name}</Link></th>
          {buckets.map(b => {
            const fit = fits.find(f => matchesParamRange(f.model.params, b));
            return <td className={cell} key={b}>{fit ? <ModelFit fit={fit} lang={lang} /> : '—'}</td>;
          })}</tr>;
      })}</tbody></table></div>
  </section>;
}

function MemoryOptions({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const cpus = gpuDatabase.filter(g => g.isCPU).sort((a,b) => a.vram - b.vram);
  const mac = gpuDatabase.find(g => g.type === 'apple');
  const macs = mac ? APPLE_LADDER.map(vram => ({ ...mac, vram })) : [];
  return <>{[cpus, macs].map((group, i) => <section key={i} className={panel}>
    <h2 className="text-xl font-semibold">{i ? (zh ? 'Mac 统一内存' : 'Apple silicon unified memory') : (zh ? '纯 CPU · 系统内存' : 'CPU only · system RAM')}</h2>
    <p>{i ? (zh ? 'GPU 与系统共享内存。本站按统一内存的 75% 计算可用预算，再筛选有余量的模型。' : 'The Mac GPU shares memory with the system. The calculator budgets 75% of installed memory before checking headroom.') : (zh ? '用 llama.cpp 在 CPU 上加载 GGUF。关闭占用内存较多的应用，给系统留下空间。实际生成速度还取决于 CPU 和内存带宽。' : 'Use llama.cpp to load GGUF on the CPU. Leave RAM for the OS and open applications. Generation speed also depends on the processor and memory bandwidth.')}</p>
    <table className="text-left w-full text-sm"><thead><tr><th scope="col" className={cell}>{zh ? '内存' : 'Memory'}</th><th scope="col" className={cell}>{zh ? '对话模型示例' : 'Example chat model'}</th></tr></thead>
      <tbody>{group.map(gpu => {
        const fit = activeFits(gpu).find(f => f.model.categories.some(c => c === 'general' || c === 'instruct'));
        return <tr key={gpu.vram}><th scope="row" className={cell}>{gpu.vram} GB</th><td className={cell}>{fit ? <ModelFit fit={fit} lang={lang} /> : '—'}</td></tr>;
      })}</tbody></table>
  </section>)}</>;
}

export default function LocalGuidePage({ slug, lang }: { slug: LocalGuide; lang: Lang }) {
  const zh = lang === 'zh';
  const [title, intro] = localGuides[slug][lang];
  return <article className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-6 text-slate-300">
    <header><h1 className="text-3xl font-bold text-slate-100 mb-2">{title}</h1><p>{intro}</p></header>
    {slug === 'what-llm-can-i-run-locally' ? <>
      <Suspense fallback={<p>{zh ? '正在加载计算器…' : 'Loading calculator…'}</p>}><VRAMCalculator defaultMode="reverse" /></Suspense>
      <section className={panel}><h2 className="text-xl font-semibold">{zh ? '常见问题' : 'Frequently asked questions'}</h2>
        <h3>{zh ? '我的显卡可以运行哪些大模型？' : 'Which LLM can I run locally?'}</h3>
        <p>{zh ? '选择具体显卡和上下文长度，优先看有显存余量的配置。点击模型可比较不同量化版本。' : 'Select your exact GPU and context length. Start with results that leave memory headroom, then compare quantization levels on the model page.'}</p>
        <h3>{zh ? '如何挑选适合本机的模型？' : 'How do you choose an LLM you can run locally?'}</h3>
        <p>{zh ? '先按对话或编程等用途筛选。需要长文档时，用目标上下文重新估算。图像输入请切换到图像模式。' : 'Start with your task, such as chat or coding. For long documents, check the fit again at the context you need. For images, select image input.'}</p>
      </section></> : <>
      <p className="text-sm text-slate-400">{zh ? '按 4096 tokens 上下文、单路文本推理估算。' : 'Memory estimates at 4,096 tokens for one text sequence.'}</p>
      {slug === 'best-llm-to-run-locally' ? <Picks lang={lang} /> : slug === 'local-llm-gpu-requirements' ? <Requirements lang={lang} /> : <MemoryOptions lang={lang} />}
    </>}
    <nav aria-label={zh ? '相关工具和指南' : 'Related tools and guides'} className="flex flex-wrap gap-4 text-sm">
      <Link className={link} href={`${zh ? '/zh' : ''}/tools/vram-calc/`}>{zh ? '显存 / 内存计算器' : 'VRAM / RAM Calculator'}</Link>
      {localGuideSlugs.filter(s => s !== slug).map(s => <Link className={link} key={s} href={`${zh ? '/zh' : ''}/${s}/`}>{localGuides[s][lang][0]}</Link>)}
    </nav>
  </article>;
}
