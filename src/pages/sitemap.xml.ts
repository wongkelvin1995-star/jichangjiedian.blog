/**
 * sitemap.xml：只列出应被收录的规范 URL（200、可索引、带真实 lastmod）。
 * 清单来自 src/lib/pages.ts；noindex 页面（搜索页、404、资料不足的品牌页）不在其中。
 */
import type { APIRoute } from 'astro';
import { indexablePages } from '../lib/pages';
import { absoluteUrl } from '../lib/site';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const pages = await indexablePages();
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map((p) => `  <url>\n    <loc>${esc(absoluteUrl(p.path))}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
