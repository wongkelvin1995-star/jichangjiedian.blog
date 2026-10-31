/** 站内搜索索引：构建时生成的静态 JSON，浏览器首次聚焦搜索框时才加载。 */
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../lib/search-index';

export const GET: APIRoute = async () => {
  const body = JSON.stringify(await buildSearchIndex());
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
