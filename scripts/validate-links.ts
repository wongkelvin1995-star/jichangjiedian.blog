/**
 * 站内链接校验（读取 dist/，需先 npm run build）：
 *  1. 所有站内 href / src / srcset / form action 都能在 dist 里找到对应文件；
 *  2. 带 # 的链接，目标页面里必须有对应 id；同一页面里不得有重复 id；aria-labelledby / for 等引用必须能解析；
 *  3. 站内链接写成规范形式（根路径、目录带结尾斜杠，不写 /index.html，不带域名）；
 *  4. 从首页出发，沿站内链接（含搜索表单）能到达每一个页面——没有孤岛页面；
 *  5. 每个可索引页面至少有 2 个来自其他页面的站内链接；
 *  6. 外部链接：必须新窗口打开并带 noopener；列出外部域名清单。
 *
 * 外部链接本脚本不联网检查（沙箱网络只开放了包管理源），上线后请另行抽查，见 docs/ACCEPTANCE_REPORT.md。
 */
import fs from 'node:fs';
import { DIST, SITE, fileForPath, pages, requireDist } from './lib/dist';
import type { Page } from './lib/dist';
import { Report } from './lib/report';

requireDist();
const r = new Report('站内链接校验');

const all = pages();
const byPath = new Map(all.map((p) => [p.urlPath, p]));
const FALLBACK_404 = '/404.html';

/** 页面里所有 id */
const idsOf = new Map<string, Set<string>>();
for (const p of all) {
  const ids = new Set<string>();
  const seen = new Map<string, number>();
  for (const el of p.root.querySelectorAll('[id]')) {
    const id = el.getAttribute('id')!;
    ids.add(id);
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  for (const a of p.root.querySelectorAll('a[name]')) ids.add(a.getAttribute('name')!);
  idsOf.set(p.urlPath, ids);
  for (const [id, n] of seen) r.check(n === 1, `${p.urlPath}：id="${id}" 重复了 ${n} 次`);

  // 引用类属性必须能解析到同页 id
  for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls'] as const) {
    for (const el of p.root.querySelectorAll(`[${attr}]`)) {
      for (const ref of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
        r.check(ids.has(ref), `${p.urlPath}：${attr}="${ref}" 在本页找不到对应 id`);
      }
    }
  }
  for (const el of p.root.querySelectorAll('label[for]')) {
    const ref = el.getAttribute('for')!;
    r.check(ids.has(ref), `${p.urlPath}：<label for="${ref}"> 在本页找不到对应控件`);
  }
}

interface Edge {
  from: string;
  to: string;
  text: string;
}
const edges: Edge[] = [];
const externalHosts = new Map<string, Set<string>>();
let internalChecked = 0;

const isSkippable = (v: string): boolean => /^(mailto:|tel:|data:|blob:|#$)/i.test(v) || v === '';

function resolve(page: Page, raw: string): URL | null {
  try {
    return new URL(raw, `${SITE}${page.urlPath}`);
  } catch {
    r.check(false, `${page.urlPath}：无法解析的链接 ${raw}`);
    return null;
  }
}

function checkInternal(page: Page, raw: string, kind: string, text = ''): void {
  const url = resolve(page, raw);
  if (!url) return;
  internalChecked++;
  const where = `${page.urlPath} → ${kind} ${raw}`;

  // 规范写法
  if (kind === 'a' || kind === 'form') {
    r.check(!/^https?:/i.test(raw), `${where}：站内链接不要写完整域名，请用根路径`);
    r.check(!/\/index\.html?(?:[#?]|$)/.test(url.pathname), `${where}：不要链接到 /index.html，请链接到目录`);
    const last = url.pathname.split('/').pop() ?? '';
    r.check(url.pathname.endsWith('/') || last.includes('.'), `${where}：目录链接应以 / 结尾（避免多一次重定向）`);
  }

  const file = fileForPath(url.pathname);
  if (!r.check(file !== null, `${where}：目标文件不存在`)) return;

  // 记录页面间的边（只记 HTML 页面）
  const target = file!.endsWith('.html') ? [...byPath.values()].find((p) => p.file === file)?.urlPath : undefined;
  if (target && (kind === 'a' || kind === 'form')) edges.push({ from: page.urlPath, to: target, text });

  // 锚点
  if (url.hash && url.hash.length > 1) {
    const id = decodeURIComponent(url.hash.slice(1));
    const ids = target ? idsOf.get(target) : undefined;
    if (ids) r.check(ids.has(id), `${where}：目标页面里没有 id="${id}"`);
  }
}

for (const p of all) {
  for (const a of p.root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')!.trim();
    if (isSkippable(href)) {
      if (href === '#') r.check(false, `${p.urlPath}：存在空锚点链接 href="#"`);
      continue;
    }
    if (/^javascript:/i.test(href)) {
      r.check(false, `${p.urlPath}：不得使用 javascript: 链接`);
      continue;
    }
    const url = resolve(p, href);
    if (!url) continue;
    if (url.origin === SITE) {
      checkInternal(p, href, 'a', a.text.replace(/\s+/g, ' ').trim());
    } else {
      const set = externalHosts.get(url.host) ?? new Set<string>();
      set.add(p.urlPath);
      externalHosts.set(url.host, set);
      r.check(a.getAttribute('target') === '_blank', `${p.urlPath} → ${href}：外部链接应在新窗口打开`);
      const rel = new Set((a.getAttribute('rel') ?? '').split(/\s+/));
      r.check(rel.has('noopener'), `${p.urlPath} → ${href}：外部链接缺少 rel="noopener"`);
    }
  }
  for (const form of p.root.querySelectorAll('form[action]')) checkInternal(p, form.getAttribute('action')!, 'form');
  for (const el of p.root.querySelectorAll('img[src], script[src], source[src], video[src], audio[src], iframe[src]')) {
    const src = el.getAttribute('src')!;
    if (isSkippable(src)) continue;
    const url = resolve(p, src);
    if (url && url.origin === SITE) checkInternal(p, src, el.tagName.toLowerCase());
    else if (url) r.check(false, `${p.urlPath}：<${el.tagName.toLowerCase()}> 引用了外部资源 ${src}`);
  }
  for (const el of p.root.querySelectorAll('img[srcset], source[srcset]')) {
    for (const part of (el.getAttribute('srcset') ?? '').split(',')) {
      const src = part.trim().split(/\s+/)[0];
      if (src) checkInternal(p, src, 'srcset');
    }
  }
  for (const el of p.root.querySelectorAll('link[href]')) {
    const rel = el.getAttribute('rel') ?? '';
    const href = el.getAttribute('href')!;
    if (rel === 'canonical') continue;
    const url = resolve(p, href);
    if (!url) continue;
    if (url.origin === SITE) checkInternal(p, href, `link[${rel}]`);
    else r.check(false, `${p.urlPath}：<link rel="${rel}"> 引用了外部资源 ${href}`);
  }
}

// ------------------------------------------------------------------ 可达性与入链数
const graph = new Map<string, Set<string>>();
for (const e of edges) {
  if (e.from === e.to) continue;
  graph.set(e.from, (graph.get(e.from) ?? new Set()).add(e.to));
}
const reached = new Set<string>(['/']);
const queue = ['/'];
while (queue.length) {
  const cur = queue.shift()!;
  for (const nxt of graph.get(cur) ?? []) {
    if (!reached.has(nxt)) {
      reached.add(nxt);
      queue.push(nxt);
    }
  }
}
for (const p of all) {
  if (p.urlPath === FALLBACK_404) continue; // 404 由服务器在“找不到”时返回，不需要被链接
  r.check(reached.has(p.urlPath), `${p.urlPath}：从首页出发无法通过站内链接到达（孤岛页面）`);
}

const inbound = new Map<string, Set<string>>();
for (const e of edges) if (e.from !== e.to) inbound.set(e.to, (inbound.get(e.to) ?? new Set()).add(e.from));
const robotsOf = (p: Page): string => p.root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
const weak: string[] = [];
for (const p of all) {
  if (/noindex/i.test(robotsOf(p))) continue;
  const n = inbound.get(p.urlPath)?.size ?? 0;
  r.check(n >= 2, `${p.urlPath}：只有 ${n} 个来自其他页面的站内链接（至少 2 个，便于搜索引擎发现和理解）`);
  if (n < 5) weak.push(`${p.urlPath}(${n})`);
}
if (weak.length) r.warn(`入链较少的可索引页面（<5）：${weak.join('、')}`);

// ------------------------------------------------------------------ 外部域名清单
const hosts = [...externalHosts.entries()].map(([h, s]) => `${h}（${s.size} 页）`);
r.warn(`外部链接域名共 ${externalHosts.size} 个，未联网检查：${hosts.join('、')}`);
r.warn(`已检查站内引用 ${internalChecked} 处。`);

// dist 里不应有被页面引用不到、却又可能被误当作页面的 html（例如草稿残留）
const orphanFiles: string[] = [];
for (const file of fs.readdirSync(DIST, { recursive: true, encoding: 'utf8' })) {
  if (!file.endsWith('.html')) continue;
  const urlPath = file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -'index.html'.length)}` : `/${file}`;
  if (!byPath.has(urlPath)) orphanFiles.push(file);
}
r.check(orphanFiles.length === 0, `dist 里有无法识别的 HTML 文件：${orphanFiles.join('、')}`);

r.finish();
