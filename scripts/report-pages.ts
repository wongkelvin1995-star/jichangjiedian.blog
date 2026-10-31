/**
 * 生成“全站页面清单”（Markdown，输出到标准输出），供 SEO 审计和上线后对照：
 * 每个页面的路径、Title、Description 长度、H1、robots、是否在 sitemap、lastmod、结构化数据类型、正文字数。
 * 数据全部从 dist/ 读取，没有手写内容，所以不会与实际页面不一致。
 *
 * 用法：
 *   npm run build
 *   npx tsx scripts/report-pages.ts > docs/SEO_PAGES.md
 */
import { SITE, pages, readSitemap, requireDist } from './lib/dist';

requireDist();
const sitemap = new Map(readSitemap().map((e) => [e.loc, e.lastmod]));
const today = new Date().toISOString().slice(0, 10);

const cell = (s: string): string => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const chars = (text: string): number => text.replace(/\s+/g, '').length;

const rows = pages().map((p) => {
  const head = (sel: string, attr?: string): string => {
    const el = p.root.querySelector(sel);
    return (attr ? el?.getAttribute(attr) : el?.text) ?? '';
  };
  const title = head('head title');
  const description = head('meta[name="description"]', 'content');
  const canonical = head('link[rel="canonical"]', 'href');
  const robots = head('meta[name="robots"]', 'content') || '（默认：可索引）';
  const h1 = p.root.querySelector('h1')?.text ?? '';
  const loc = p.urlPath === '/404.html' ? '' : `${SITE}${p.urlPath}`;
  const inSitemap = sitemap.has(loc);
  const types = new Set<string>();
  for (const s of p.root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const j = JSON.parse(s.text) as { '@type'?: string; '@graph'?: { '@type'?: string }[] };
      if (j['@type']) types.add(j['@type']);
      for (const g of j['@graph'] ?? []) if (g['@type']) types.add(g['@type']);
    } catch {
      types.add('（JSON 解析失败）');
    }
  }
  const main = p.root.querySelector('main');
  return { path: p.urlPath, title, description, canonical, robots, h1, inSitemap, lastmod: sitemap.get(loc) ?? '', types: [...types].join('、'), bodyChars: chars(main?.text ?? '') };
});

const indexable = rows.filter((r) => r.inSitemap).length;
console.log('# 全站页面清单（自动生成）\n');
console.log(`由 \`scripts/report-pages.ts\` 读取 \`dist/\` 生成，生成日期 ${today}。共 ${rows.length} 个页面，其中 ${indexable} 个在 sitemap.xml 中（可索引），${rows.length - indexable} 个不在（404、站内搜索结果页、资料卡品牌页：均为 noindex）。\n`);
console.log('正文字数 = `<main>` 内去掉空白后的字符数（含标点），只用来发现“过薄”的页面，不是质量指标。\n');
console.log('| 路径 | Title | Description 字数 | H1 | robots | sitemap | lastmod | 结构化数据 | 正文字数 |');
console.log('| --- | --- | ---: | --- | --- | :---: | --- | --- | ---: |');
for (const r of rows) {
  console.log(`| ${cell(r.path)} | ${cell(r.title)} | ${[...r.description].length} | ${cell(r.h1)} | ${cell(r.robots)} | ${r.inSitemap ? '是' : '否'} | ${r.lastmod || '—'} | ${cell(r.types) || '—'} | ${r.bodyChars} |`);
}
