/**
 * /search/ 页面：读取 ?q=，在浏览器内匹配站内索引并显示全部结果。
 * 页面里的静态入口列表（data-search-fallback）在脚本启动后隐藏；没有脚本时它就是搜索页的内容。
 */
import { queryTokens, runSearch } from '../lib/search-core';
import { loadIndex, rawTokens, renderGroups } from './search-ui';

const root = document.querySelector<HTMLElement>('[data-search-page]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('form');
  const input = form?.querySelector<HTMLInputElement>('input[name="q"]');
  const out = root.querySelector<HTMLElement>('[data-search-results]');
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  const fallback = root.querySelector<HTMLElement>('[data-search-fallback]');

  if (form && input && out && status) {
    let seq = 0;
    const baseTitle = document.title;

    const run = async (q: string): Promise<void> => {
      const my = ++seq;
      out.replaceChildren();
      if (queryTokens(q).length === 0) {
        status.textContent = '输入机场名称、地区、线路缩写或想了解的问题。';
        if (fallback) fallback.hidden = false;
        document.title = baseTitle;
        return;
      }
      if (fallback) fallback.hidden = true;
      status.textContent = '搜索中…';
      try {
        const hits = runSearch(await loadIndex(), q);
        if (my !== seq) return;
        document.title = `搜索“${q.trim()}”｜机场节点`;
        if (hits.length === 0) {
          status.textContent = `没有找到与“${q.trim()}”相关的内容。可以试试机场简称、地区名称（如“香港”）、线路缩写（如“IEPL”），或者“抖动”“倍率”这类词。`;
          if (fallback) fallback.hidden = false;
        } else {
          status.textContent = `找到 ${hits.length} 条与“${q.trim()}”相关的内容。`;
          renderGroups(out, hits, rawTokens(q), { idPrefix: 'sp' });
        }
      } catch {
        if (my !== seq) return;
        status.textContent = '搜索暂时不可用，请刷新页面重试，或从下面的入口查找。';
        if (fallback) fallback.hidden = false;
      }
    };

    const initial = (new URLSearchParams(location.search).get('q') ?? '').slice(0, 40);
    input.value = initial;
    let composing = false;
    const sync = (): void => {
      const q = input.value.slice(0, 40);
      const url = new URL(location.href);
      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');
      history.replaceState(null, '', url);
      void run(q);
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sync();
    });
    input.addEventListener('input', (e) => {
      if (composing || (e as InputEvent).isComposing) return;
      sync();
    });
    input.addEventListener('compositionstart', () => {
      composing = true;
    });
    input.addEventListener('compositionend', () => {
      composing = false;
      sync();
    });
    void run(initial);
  }
}

export {};
