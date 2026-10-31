/**
 * robots.txt：允许抓取全站，并指向 sitemap。
 * 不用 Disallow 屏蔽 noindex 页面——如果被屏蔽，搜索引擎就读不到页面里的 noindex 指令。
 */
import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site';

export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
