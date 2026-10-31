/** 读取 dist/ 的公共工具：列出页面、解析 HTML、把 URL 路径映射回文件。 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';

export const DIST = path.resolve('dist');

export function requireDist(): void {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('✗ 找不到 dist/index.html，请先运行 npm run build。');
    process.exit(2);
  }
}

export function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

export interface Page {
  /** 站内路径，例如 /airports/ ；404 页为 /404.html */
  urlPath: string;
  file: string;
  html: string;
  root: HTMLElement;
}

let cache: Page[] | null = null;

export function pages(): Page[] {
  if (cache) return cache;
  cache = [];
  for (const file of walk(DIST)) {
    if (!file.endsWith('.html')) continue;
    const rel = path.relative(DIST, file).split(path.sep).join('/');
    const urlPath = rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? `/${rel.slice(0, -'index.html'.length)}` : `/${rel}`;
    const html = fs.readFileSync(file, 'utf8');
    cache.push({ urlPath, file, html, root: parse(html, { comment: false }) });
  }
  cache.sort((a, b) => a.urlPath.localeCompare(b.urlPath));
  return cache;
}

/** 站内路径 -> dist 里应当存在的文件（/x/ -> /x/index.html；/a.png -> /a.png） */
export function fileForPath(urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split('#')[0]!.split('?')[0]!);
  const candidates = clean.endsWith('/') ? [path.join(DIST, clean, 'index.html')] : [path.join(DIST, clean), path.join(DIST, clean, 'index.html')];
  for (const c of candidates) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}

export const attr = (el: HTMLElement | null | undefined, name: string): string | undefined => el?.getAttribute(name) ?? undefined;

/** 页面主要文字（去掉脚本、样式） */
export function textOf(page: Page): string {
  const clone = parse(page.html);
  clone.querySelectorAll('script, style').forEach((n) => n.remove());
  return clone.text.replace(/\s+/g, ' ');
}

export function readSitemap(): { loc: string; lastmod: string }[] {
  const file = path.join(DIST, 'sitemap.xml');
  const xml = fs.readFileSync(file, 'utf8');
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)].map((m) => ({ loc: m[1]!, lastmod: m[2]! }));
}

export const SITE = 'https://jichangjiedian.blog';
