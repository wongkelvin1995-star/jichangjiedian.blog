/**
 * 推广链接校验：
 *  1. 34 条链接与站长原始文件 docs/source-material/affiliate-mapping-2026-10-29.txt 逐字一致（序号、顺序、域名、code、大小写）；
 *  2. 每家品牌恰好有一条，且不重复；
 *  3. 构建产物里：目录页为 34 家各放一个推广按钮，全部 target=_blank，rel 含 sponsored nofollow noopener noreferrer；
 *  4. 推广链接不出现在搜索索引、CSV、JSON-LD 和结构化数据里——它不是证据，也不应被当成数据传播；
 *  5. 站内没有任何“改写”过的推广链接（域名相同但 code 不同的链接）。
 * 第 3–5 项需要先 npm run build；没有 dist/ 时只检查第 1–2 项。
 */
import fs from 'node:fs';
import path from 'node:path';
import { AFFILIATE_URLS } from '../src/data/affiliates';
import { BRANDS } from '../src/data/brands';
import { DIST, pages, walk } from './lib/dist';
import { Report } from './lib/report';

const r = new Report('推广链接校验');

// ------------------------------------------------------------------ 与原始文件逐字比对
const raw = fs.readFileSync('docs/source-material/affiliate-mapping-2026-10-29.txt', 'utf8').split(/\r?\n/);
const original: { no: number; name: string; url: string }[] = [];
for (let i = 0; i < raw.length; i++) {
  const m = raw[i]!.match(/^(\d{2})\s+(.+?)\s*$/);
  if (m && /^https?:\/\//.test(raw[i + 1] ?? '')) original.push({ no: Number(m[1]), name: m[2]!, url: raw[i + 1]!.trim() });
}
r.check(original.length === 34, `原始文件应含 34 条推广链接，读到 ${original.length}`);
r.check(
  original.every((o, i) => o.no === i + 1),
  '原始文件序号应为 01..34 连续',
);
r.check(Object.keys(AFFILIATE_URLS).length === 34, `AFFILIATE_URLS 应有 34 条，实际 ${Object.keys(AFFILIATE_URLS).length}`);
r.check(new Set(Object.values(AFFILIATE_URLS)).size === 34, '34 条推广链接不能有重复');

for (const o of original) {
  const brand = BRANDS[o.no - 1];
  if (!r.check(!!brand, `第 ${o.no} 位品牌不存在`)) continue;
  const mine = AFFILIATE_URLS[brand!.slug];
  r.check(mine === o.url, `第 ${o.no} 位 ${brand!.brandName}：推广链接与原文不一致`, `原文：${o.url}\n      站内：${mine}`);
  r.check(brand!.affiliateUrl === o.url, `第 ${o.no} 位 ${brand!.brandName}：brand.affiliateUrl 与原文不一致`);
}

// ------------------------------------------------------------------ 构建产物
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  r.warn('没有 dist/，跳过构建产物检查（先运行 npm run build）。');
  r.finish();
}

const allUrls = new Set(Object.values(AFFILIATE_URLS));
const hostOf = (u: string): string => new URL(u).host;
const affiliateHosts = new Set([...allUrls].map(hostOf));

// 目录页：34 家各一个按钮
const directory = pages().find((p) => p.urlPath === '/airports/');
if (r.check(!!directory, '找不到目录页 /airports/')) {
  const links = directory!.root.querySelectorAll('a').filter((a) => allUrls.has(a.getAttribute('href') ?? ''));
  const found = new Set(links.map((a) => a.getAttribute('href')));
  r.check(found.size === 34, `目录页应包含 34 条不同的推广链接，实际 ${found.size}`);
  for (const u of allUrls) r.check(found.has(u), `目录页缺少推广链接：${u}`);
}

// 所有页面：凡是推广链接，属性必须齐全；凡是指向推广域名的链接，必须是原文里的那一条
for (const p of pages()) {
  for (const a of p.root.querySelectorAll('a')) {
    const href = a.getAttribute('href') ?? '';
    if (!/^https?:\/\//i.test(href)) continue;
    let host: string;
    try {
      host = hostOf(href);
    } catch {
      continue;
    }
    if (!affiliateHosts.has(host)) continue;
    const where = `${p.urlPath} → ${href}`;
    r.check(allUrls.has(href), `${where}：指向推广域名，但不是原文里的链接（疑似被改写）`);
    r.check(a.getAttribute('target') === '_blank', `${where}：推广链接必须在新窗口打开（target=_blank）`);
    const rel = new Set((a.getAttribute('rel') ?? '').split(/\s+/));
    for (const need of ['sponsored', 'nofollow', 'noopener', 'noreferrer']) r.check(rel.has(need), `${where}：rel 缺少 ${need}`);
  }
}

// 数据文件里不得出现推广链接
const scanForAffiliates = (label: string, text: string): void => {
  for (const u of allUrls) r.check(!text.includes(u), `${label} 含有推广链接：${u}`);
};
for (const file of walk(DIST)) {
  const rel = path.relative(DIST, file);
  if (/\.(json|csv|xml|txt)$/i.test(file)) scanForAffiliates(rel, fs.readFileSync(file, 'utf8'));
}
for (const p of pages()) {
  for (const s of p.root.querySelectorAll('script[type="application/ld+json"]')) scanForAffiliates(`${p.urlPath} 的 JSON-LD`, s.text);
}

r.finish();
