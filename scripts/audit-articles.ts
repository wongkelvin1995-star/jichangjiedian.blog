/**
 * 逐篇文章审核（上线前审计用）：读取 dist 里每篇文章 / 教程的完整 HTML，检查
 * Title、Description、H1、标题层级、正文字数、重复段落、跨文章相似度、占位文字、第三方站名、
 * 内链数、图片 alt、日期与 JSON-LD。结果写入 reports/article-audit.json。
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const DIST = path.resolve('dist');
const dirs = ['articles', 'guides'];
const banned = ['待补充', 'Lorem', 'lorem ipsum', 'TODO', 'TBD', '占位', 'undefined', 'NaN', '[object Object]'];
// 第三方资料站的名称（站长要求不在页面上出现）
const thirdParty = fs.existsSync('docs/INTERNAL_SOURCES.md')
  ? [...fs.readFileSync('docs/INTERNAL_SOURCES.md', 'utf8').matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]!.replace(/^www\./, '').split('.')[0]!).filter((x) => x.length > 4)
  : [];

interface Row {
  url: string; title: string; titleLen: number; description: string; descLen: number; h1: string;
  chars: number; h2: number; h3: number; headingSkip: boolean; internalLinks: number; images: number; imagesNoAlt: number;
  published: string | null; modified: string | null; ldTypes: string[]; issues: string[]; paragraphs: string[];
}
const rows: Row[] = [];

for (const d of dirs) {
  for (const id of fs.readdirSync(path.join(DIST, d))) {
    const f = path.join(DIST, d, id, 'index.html');
    if (!fs.existsSync(f)) continue;
    const root = parse(fs.readFileSync(f, 'utf8'));
    const main = root.querySelector('main')!;
    const art = main.querySelector('article') ?? main;
    const body = art.querySelector('.prose') ?? art;
    const text = body.text.replace(/\s+/g, '');
    const issues: string[] = [];
    const title = root.querySelector('title')?.text.trim() ?? '';
    const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    const h1 = root.querySelectorAll('h1').map((h) => h.text.trim());
    const hs = art.querySelectorAll('h1,h2,h3,h4').map((h) => Number(h.tagName[1]));
    let skip = false;
    for (let i = 1; i < hs.length; i++) if (hs[i]! - hs[i - 1]! > 1) skip = true;
    const paragraphs = body.querySelectorAll('p,li').map((p) => p.text.replace(/\s+/g, '')).filter((p) => p.length >= 40);
    const seen = new Set<string>();
    for (const p of paragraphs) { if (seen.has(p)) issues.push(`文内重复段落：${p.slice(0, 30)}…`); seen.add(p); }
    for (const w of banned) if (text.includes(w)) issues.push(`出现占位或异常文字“${w}”`);
    for (const t of thirdParty) if (text.toLowerCase().includes(t.toLowerCase())) issues.push(`出现第三方资料站名称“${t}”`);
    if (h1.length !== 1) issues.push(`H1 数量 ${h1.length}`);
    if (title.length < 15 || title.length > 70) issues.push(`Title 长度 ${title.length}`);
    if (description.length < 50 || description.length > 160) issues.push(`Description 长度 ${description.length}`);
    if (skip) issues.push('标题层级跳级');
    if (text.length < 800) issues.push(`正文偏短（${text.length} 字）`);
    const links = art.querySelectorAll('a[href^="/"]').length;
    if (links < 3) issues.push(`站内链接偏少（${links}）`);
    const imgs = art.querySelectorAll('img');
    const noAlt = imgs.filter((i) => !(i.getAttribute('alt') ?? '').trim()).length;
    if (noAlt) issues.push(`${noAlt} 张图片缺少 alt`);
    const lds = root.querySelectorAll('script[type="application/ld+json"]').flatMap((s) => {
      try { const j = JSON.parse(s.text); return (Array.isArray(j) ? j : [j]).map((x) => x['@type']); } catch { issues.push('JSON-LD 无法解析'); return []; }
    });
    if (!lds.some((t) => t === 'Article' || t === 'BlogPosting' || t === 'TechArticle' || t === 'HowTo')) issues.push(`缺少文章类结构化数据（现有：${lds.join('、')}）`);
    const pub = root.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ?? null;
    const mod = root.querySelector('meta[property="article:modified_time"]')?.getAttribute('content') ?? null;
    if (pub && mod && mod < pub) issues.push('修改日期早于发布日期');
    if (mod && mod.slice(0, 10) > '2026-10-29') issues.push(`修改日期在未来：${mod}`);
    rows.push({ url: `/${d}/${id}/`, title, titleLen: title.length, description, descLen: description.length, h1: h1[0] ?? '', chars: text.length, h2: hs.filter((x) => x === 2).length, h3: hs.filter((x) => x === 3).length, headingSkip: skip, internalLinks: links, images: imgs.length, imagesNoAlt: noAlt, published: pub, modified: mod, ldTypes: lds, issues, paragraphs });
  }
}

// 跨文章：重复 title / description / H1，重复段落，正文相似度（12 字片段 Jaccard）
const dupe = (k: 'title' | 'description' | 'h1') => {
  const m = new Map<string, string[]>();
  for (const r of rows) m.set(r[k], [...(m.get(r[k]) ?? []), r.url]);
  for (const us of m.values()) if (us.length > 1) for (const u of us) rows.find((r) => r.url === u)!.issues.push(`${k} 与 ${us.filter((x) => x !== u).join('、')} 重复`);
};
dupe('title'); dupe('description'); dupe('h1');
const paraOwner = new Map<string, string>();
for (const r of rows) for (const p of r.paragraphs) {
  const o = paraOwner.get(p);
  if (o && o !== r.url) r.issues.push(`段落与 ${o} 完全相同：${p.slice(0, 24)}…`);
  else paraOwner.set(p, r.url);
}
const grams = (s: string) => { const g = new Set<string>(); for (let i = 0; i + 12 <= s.length; i++) g.add(s.slice(i, i + 12)); return g; };
const G = rows.map((r) => grams(r.paragraphs.join('')));
const similar: { a: string; b: string; jaccard: number }[] = [];
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
  let inter = 0; for (const x of G[i]!) if (G[j]!.has(x)) inter++;
  const jac = inter / (G[i]!.size + G[j]!.size - inter || 1);
  if (jac > 0.08) { similar.push({ a: rows[i]!.url, b: rows[j]!.url, jaccard: Math.round(jac * 1000) / 1000 }); rows[i]!.issues.push(`与 ${rows[j]!.url} 相似度 ${(jac * 100).toFixed(1)}%`); rows[j]!.issues.push(`与 ${rows[i]!.url} 相似度 ${(jac * 100).toFixed(1)}%`); }
}

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/article-audit.json', JSON.stringify({ count: rows.length, similar, rows: rows.map(({ paragraphs: _paragraphs, ...r }) => r) }, null, 1));
for (const r of rows) console.log(`${r.issues.length ? '✗' : '✓'} ${r.url}  ${r.chars}字  H2×${r.h2}  内链${r.internalLinks}  ${r.issues.join('；')}`);
console.log(`共 ${rows.length} 篇，有问题 ${rows.filter((r) => r.issues.length).length} 篇`);
