/**
 * 内容校验（读取 dist/ 与 src/content，需先 npm run build）：
 *  1. 总指令第 22 节要求的 15 个选题全部存在，标题逐字一致；
 *  2. 每篇都有“局限”小节、2–5 条站内内链、足够的篇幅、完整的 frontmatter，发布日期不晚于更新日期、更新日期不晚于今天；
 *  3. 全站不出现编造的评分、星级、用户评价；
 *  4. 没有“只有推广按钮”的薄页面：每个可索引页面正文不少于 500 字符；
 *  5. 每篇文章引用的相关页面、品牌、地区都存在。
 *
 * 字数口径：H1 + 正文（含标点、数字、字母，不含空格），与 Word / WPS 的“字数（不计空格）”一致；同时报告其中汉字个数。
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { BRANDS } from '../src/data/brands';
import { REGION_PAGES } from '../src/data/regions';
import { SITE, fileForPath, pages, requireDist, textOf } from './lib/dist';
import { Report } from './lib/report';

requireDist();
const r = new Report('内容校验');
const todayCN = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

/** 总指令第 22 节：第一批原创文章（标题逐字照抄） */
const REQUIRED: { no: number; slug: string; kind: 'articles' | 'guides'; title: string }[] = [
  { no: 1, slug: 'how-to-choose-airport-nodes-2026', kind: 'articles', title: '2026机场节点选择指南：地区、线路和测速时间怎么判断？' },
  { no: 2, slug: 'why-nodes-slow-down-at-night', kind: 'articles', title: '为什么同一个机场节点晚上会变慢？' },
  { no: 3, slug: 'how-to-speedtest-at-peak-hours', kind: 'articles', title: '机场晚高峰测速应该怎样进行？' },
  { no: 4, slug: 'hong-kong-vs-japan-nodes', kind: 'articles', title: '香港节点与日本节点在实际使用中有什么不同？' },
  { no: 5, slug: 'singapore-node-speedtest-metrics', kind: 'articles', title: '新加坡节点测速：哪些数据可以说明线路质量？' },
  { no: 6, slug: 'iepl-iplc-bgp-differences', kind: 'articles', title: 'IEPL、IPLC与BGP究竟有什么区别？' },
  { no: 7, slug: 'low-latency-not-fast-download', kind: 'articles', title: '为什么节点延迟低不代表下载速度快？' },
  { no: 8, slug: 'jitter-impact-on-use-cases', kind: 'articles', title: '机场节点抖动高会影响哪些使用场景？' },
  { no: 9, slug: 'clash-verge-latency-test', kind: 'guides', title: 'Clash Verge如何测试同一节点的延迟？' },
  { no: 10, slug: 'seven-day-node-speed-log', kind: 'guides', title: '如何记录一个节点连续7天的速度变化？' },
  { no: 11, slug: 'online-rate-vs-stability', kind: 'articles', title: '节点在线率与节点真实稳定性有什么不同？' },
  { no: 12, slug: 'youtube-stats-for-nerds', kind: 'guides', title: 'YouTube Stats for nerds如何辅助判断节点视频播放表现？' },
  { no: 13, slug: 'traffic-multiplier-explained', kind: 'articles', title: '机场套餐的流量倍率应该如何计算？' },
  { no: 14, slug: 'singapore-vs-us-nodes', kind: 'articles', title: '新加坡节点与美国节点应该怎样选择？' },
  { no: 15, slug: 'idle-vs-loaded-latency', kind: 'articles', title: '机场节点测速中的空载延迟与负载延迟是什么？' },
];

/** 站长在总指令之后追加的选题（同样执行全部检查） */
const EXTRA: typeof REQUIRED = [
  { no: 16, slug: 'choose-airport-by-use-case', kind: 'articles', title: '按使用场景选机场：追剧、AI、多设备和备用各看什么？' },
];

const all = pages();
const byPath = new Map(all.map((p) => [p.urlPath, p]));
const brandSlugs = new Set(BRANDS.map((b) => b.slug));
const regionSlugs = new Set(REGION_PAGES.map((x) => x.slug));

interface Front {
  title: string;
  description: string;
  published: string;
  modified: string;
  category: string;
  keywords: string[];
  brands: string[];
  regions: string[];
  related: string[];
  draft: boolean;
}
function front(file: string): Front {
  const head = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const scalar = (k: string): string => head.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
  const inline = (k: string): string[] => {
    const m = head.match(new RegExp(`^${k}:\\s*\\[(.*)\\]\\s*$`, 'm'));
    return m ? m[1]!.split(',').map((x) => x.trim()).filter(Boolean) : [];
  };
  const block = (k: string): string[] => {
    const m = head.match(new RegExp(`^${k}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`, 'm'));
    return m ? [...m[1]!.matchAll(/^\s+-\s+(.+)$/gm)].map((x) => x[1]!.trim()) : [];
  };
  return {
    title: scalar('title'),
    description: scalar('description'),
    published: scalar('published'),
    modified: scalar('modified'),
    category: scalar('category'),
    keywords: inline('keywords'),
    brands: inline('brands'),
    regions: inline('regions'),
    related: block('related').length ? block('related') : inline('related'),
    draft: scalar('draft') === 'true',
  };
}

const lengths: string[] = [];
for (const req of [...REQUIRED, ...EXTRA]) {
  const file = path.resolve('src/content', req.kind, `${req.slug}.md`);
  const label = `选题 ${req.no}「${req.title.slice(0, 18)}…」`;
  if (!r.check(fs.existsSync(file), `${label}：缺少文件 src/content/${req.kind}/${req.slug}.md`)) continue;
  const f = front(file);
  r.check(f.title === req.title, `${label}：标题应与总指令逐字一致`, `实际：${f.title}`);
  r.check(!f.draft, `${label}：不应是草稿`);
  r.check(f.description.length >= 50 && f.description.length <= 160, `${label}：description 长度 ${f.description.length}，应在 50–160 之间`);
  r.check(f.keywords.length >= 3, `${label}：keywords 至少 3 个`);
  r.check(f.category.length > 0, `${label}：缺少分类`);
  r.check(/^\d{4}-\d{2}-\d{2}$/.test(f.published) && /^\d{4}-\d{2}-\d{2}$/.test(f.modified), `${label}：日期格式应为 YYYY-MM-DD`);
  r.check(f.published <= f.modified, `${label}：发布日期晚于更新日期`);
  r.check(f.modified <= todayCN, `${label}：更新日期晚于今天`);
  for (const b of f.brands) r.check(brandSlugs.has(b), `${label}：引用了不存在的品牌 ${b}`);
  for (const g of f.regions) r.check(regionSlugs.has(g), `${label}：引用了不存在的地区 ${g}`);
  for (const rel of f.related) r.check(!!fileForPath(rel), `${label}：相关链接 ${rel} 不存在`);

  const urlPath = `/${req.kind}/${req.slug}/`;
  const page = byPath.get(urlPath);
  if (!r.check(!!page, `${label}：dist 里没有 ${urlPath}`)) continue;
  const prose = page!.root.querySelector('.prose');
  if (!r.check(!!prose, `${label}：页面里没有 .prose 正文`)) continue;

  // 篇幅
  const body = parse(prose!.outerHTML).text.replace(/\s+/g, '');
  const h1 = page!.root.querySelector('h1')?.text.replace(/\s+/g, '') ?? '';
  const total = body.length + h1.length;
  const han = (body.match(/[一-鿿]/g) ?? []).length;
  lengths.push(`${req.no}:${total}/${han}`);
  r.check(total >= 1500, `${label}：H1+正文只有 ${total} 字（含标点，不含空格），低于 1500`);
  r.check(total <= 2600, `${label}：H1+正文有 ${total} 字，超过 2600，请精简或拆分`);
  r.check(han >= 1000, `${label}：汉字只有 ${han} 个，正文可能被数字或代码撑大了篇幅`);

  // 局限小节
  const h2 = prose!.querySelectorAll('h2').map((h) => h.text.trim());
  r.check(h2.some((t) => /局限/.test(t)), `${label}：缺少“局限”小节`);
  r.check(h2.length >= 4, `${label}：二级标题只有 ${h2.length} 个，结构过于单薄`);

  // 站内内链：正文里 2–5 条不同的目标
  const targets = new Set<string>();
  for (const a of prose!.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')!;
    if (href.startsWith('/') && !href.startsWith('//')) targets.add(href.split('#')[0]!);
  }
  targets.delete(urlPath);
  r.check(targets.size >= 2 && targets.size <= 5, `${label}：正文里有 ${targets.size} 个不同的站内链接目标，应为 2–5 个`, [...targets].join(' '));

  // 文章页必须有日期、分类、目录或相关阅读（读者能看出时效）
  r.check(page!.root.querySelector('main time[datetime]') !== null, `${label}：页面没有显示日期`);
  // 不含推广链接：研究文章不得夹带推广按钮
  const promo = prose!.querySelectorAll('a[rel~="sponsored"]');
  r.check(promo.length === 0, `${label}：正文里不得出现推广链接`);
}
r.check(REQUIRED.length === 15, '选题清单应为 15 项');
r.warn(`字数（H1+正文含标点不含空格 / 其中汉字）：${lengths.join('，')}`);

// 文章/教程目录里不应有清单之外的、未经检查的文章
for (const kind of ['articles', 'guides'] as const) {
  const dir = path.resolve('src/content', kind);
  for (const f of fs.readdirSync(dir)) {
    const slug = f.replace(/\.mdx?$/, '');
    r.check([...REQUIRED, ...EXTRA].some((x) => x.slug === slug && x.kind === kind), `src/content/${kind}/${f} 不在选题清单里，请先把它加入 scripts/validate-content.ts 再发布`);
  }
}

// ------------------------------------------------------------------ 编造评分/评价
const FAKE: { re: RegExp; label: string }[] = [
  { re: /[★☆]{2,}|五星(?:好评|推荐)?|[1-5]\s*星级/, label: '星级评分' },
  { re: /(?:综合评分|评分|得分|打分|总分|综合得分)[^，。；\s]{0,4}\d/, label: '评分' },
  { re: /\b\d\.\d\s*\/\s*10\b/, label: '十分制评分' },
  { re: /好评率|满意度|用户评价|网友评价|用户反馈显示|口碑(?:很|极)好/, label: '用户评价' },
  { re: /推荐指数|综合排名|榜首|\btop\s*\d|第\s*[一二三1-3]\s*名/i, label: '排名' },
];
for (const p of all) {
  for (const s of textOf(p).split(/[。；！？\n]/)) {
    if (!s.trim()) continue;
    for (const { re, label } of FAKE) {
      if (!re.test(s)) continue;
      // 否定、解释性语境（“本站不做评分”“不给出分数”）允许
      if (/[不没无非未别]|并非|而不是|不是/.test(s)) continue;
      r.check(false, `${p.urlPath}：出现${label}的表述：“${s.trim().slice(0, 60)}”`);
    }
  }
}

// ------------------------------------------------------------------ 薄页面
const thin: string[] = [];
for (const p of all) {
  if (/noindex/i.test(p.root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '')) continue;
  const main = p.root.querySelector('main');
  if (!main) continue;
  const clone = parse(main.outerHTML);
  clone.querySelectorAll('script, style, nav').forEach((n) => n.remove());
  const n = clone.text.replace(/\s+/g, '').length;
  r.check(n >= 500, `${p.urlPath}：正文只有 ${n} 字符，属于薄页面，不应被索引`);
  if (n < 1200) thin.push(`${p.urlPath}(${n})`);
}
if (thin.length) r.warn(`正文较短的可索引页面（<1200 字符）：${thin.join('、')}`);

// 推广链接所在页面必须有足够的非推广正文，并出现披露说明
for (const p of all) {
  const promos = p.root.querySelectorAll('a[rel~="sponsored"]');
  if (promos.length === 0) continue;
  const text = textOf(p);
  r.check(/推广|佣金/.test(text), `${p.urlPath}：含推广链接的页面必须出现推广披露（推广/佣金）`);
  r.check(p.root.querySelector('a[href="/affiliate-disclosure/"]') !== null, `${p.urlPath}：含推广链接的页面必须链接到合作推广声明`);
}

void SITE;
r.finish();
