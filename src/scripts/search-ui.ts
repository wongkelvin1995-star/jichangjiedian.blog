/**
 * 站内搜索的浏览器端公共部分：索引加载（只在用户第一次需要时请求）、命中文字高亮、结果行与分组的 DOM 构造。
 * 所有文字都通过 textContent / createTextNode 写入，不使用 innerHTML，所以用户输入不会被当成 HTML 执行。
 */
import { KIND_LABEL, groupHits, hitDescription, prepare } from '../lib/search-core';
import type { Hit, Prepared, SearchEntry } from '../lib/search-core';

let prepared: Prepared[] | null = null;
let pending: Promise<Prepared[]> | null = null;

export function loadIndex(): Promise<Prepared[]> {
  if (prepared) return Promise.resolve(prepared);
  if (!pending) {
    pending = fetch('/search-index.json', { credentials: 'omit' })
      .then((r) => {
        if (!r.ok) throw new Error(`搜索索引加载失败：HTTP ${r.status}`);
        return r.json() as Promise<SearchEntry[]>;
      })
      .then((d) => {
        prepared = prepare(d);
        return prepared;
      })
      .catch((e: unknown) => {
        pending = null; // 允许下次重试
        throw e;
      });
  }
  return pending;
}

/** 把查询切成用于高亮的原始词（小写，不做标点清洗，这样能在标题里按原样找到位置） */
export const rawTokens = (q: string): string[] =>
  q
    .toLowerCase()
    .split(/[\s　]+/)
    .filter(Boolean);

/** 返回带 <mark> 的文档片段 */
export function highlight(text: string, tokens: readonly string[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const tok of tokens) {
    let from = 0;
    for (;;) {
      const i = lower.indexOf(tok, from);
      if (i < 0) break;
      ranges.push([i, i + tok.length]);
      from = i + tok.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  let pos = 0;
  for (const [a, b] of merged) {
    if (a > pos) frag.append(document.createTextNode(text.slice(pos, a)));
    const m = document.createElement('mark');
    m.textContent = text.slice(a, b);
    frag.append(m);
    pos = b;
  }
  if (pos < text.length) frag.append(document.createTextNode(text.slice(pos)));
  return frag;
}

/** 一条结果：<a class="search-hit"> 标题 + 简介 */
export function hitElement(h: Hit, tokens: readonly string[], opts: { id?: string; option?: boolean } = {}): HTMLAnchorElement {
  const a = document.createElement('a');
  a.className = 'search-hit';
  a.href = h.entry.u;
  if (opts.id) a.id = opts.id;
  if (opts.option) {
    a.setAttribute('role', 'option');
    a.setAttribute('aria-selected', 'false');
  }
  a.append(highlight(h.entry.t, tokens));
  const sub = document.createElement('span');
  sub.className = 'search-hit__sub';
  sub.textContent = hitDescription(h);
  a.append(sub);
  return a;
}

/** 按类型分组渲染，返回所有结果行（按显示顺序，供键盘导航使用） */
export function renderGroups(container: HTMLElement, hits: readonly Hit[], tokens: readonly string[], opts: { option?: boolean; idPrefix?: string } = {}): HTMLAnchorElement[] {
  const links: HTMLAnchorElement[] = [];
  for (const g of groupHits(hits)) {
    const section = document.createElement('div');
    section.className = 'search-group';
    if (opts.option) section.setAttribute('role', 'group');
    const title = document.createElement('div');
    title.className = 'search-group__title';
    title.textContent = KIND_LABEL[g.kind];
    const titleId = `${opts.idPrefix ?? 'sr'}-g-${g.kind}`;
    title.id = titleId;
    if (opts.option) section.setAttribute('aria-labelledby', titleId);
    section.append(title);
    for (const h of g.hits) {
      const el = hitElement(h, tokens, { id: `${opts.idPrefix ?? 'sr'}-${links.length}`, option: opts.option });
      section.append(el);
      links.push(el);
    }
    container.append(section);
  }
  return links;
}

export const SEARCH_PAGE = '/search/';
export const searchPageUrl = (q: string): string => `${SEARCH_PAGE}?q=${encodeURIComponent(q)}`;
