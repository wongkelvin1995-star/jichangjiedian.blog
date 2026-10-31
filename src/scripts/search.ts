/**
 * 顶部搜索框：输入时在浏览器内匹配站内索引，弹出分组结果。
 * 没有 JavaScript、或索引加载失败时，表单仍然会以 GET 提交到 /search/?q=…，不会丢失任何功能入口。
 */
import { queryTokens, runSearch } from '../lib/search-core';
import { loadIndex, rawTokens, renderGroups, searchPageUrl } from './search-ui';

const MAX_IN_PANEL = 8;

export function initSiteSearch(form: HTMLFormElement): void {
  const input = form.querySelector<HTMLInputElement>('input[name="q"]');
  const panel = form.querySelector<HTMLElement>('.site-search__panel');
  if (!input || !panel) return;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-controls', panel.id);
  input.setAttribute('aria-expanded', 'false');

  let links: HTMLAnchorElement[] = [];
  let active = -1;
  let composing = false;
  let seq = 0; // 丢弃过期的异步结果

  const close = (): void => {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const setActive = (i: number): void => {
    links.forEach((el, n) => el.setAttribute('aria-selected', String(n === i)));
    active = i;
    const el = links[i];
    if (el) {
      input.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };
  const open = (): void => {
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };
  const message = (text: string): void => {
    const p = document.createElement('p');
    p.className = 'search-empty';
    p.textContent = text;
    panel.append(p);
  };

  const render = async (): Promise<void> => {
    const q = input.value;
    const my = ++seq;
    if (queryTokens(q).length === 0) {
      close();
      return;
    }
    let hits;
    try {
      hits = runSearch(await loadIndex(), q);
    } catch {
      if (my !== seq) return;
      panel.replaceChildren();
      links = [];
      message('搜索暂时不可用。按回车键可前往搜索页重试。');
      open();
      return;
    }
    if (my !== seq) return;

    panel.replaceChildren();
    links = [];
    active = -1;
    if (hits.length === 0) {
      message(`没有找到与“${q.trim()}”相关的内容。可以试试机场简称、地区（如“香港”）、线路缩写（如“IEPL”）或“抖动”“倍率”这类词。`);
    } else {
      links = renderGroups(panel, hits.slice(0, MAX_IN_PANEL), rawTokens(q), { option: true });
      if (hits.length > MAX_IN_PANEL) {
        const more = document.createElement('a');
        more.className = 'search-hit';
        more.href = searchPageUrl(q.trim());
        more.id = `sr-${links.length}`;
        more.setAttribute('role', 'option');
        more.setAttribute('aria-selected', 'false');
        more.textContent = `查看全部 ${hits.length} 条结果`;
        panel.append(more);
        links.push(more);
      }
    }
    open();
  };

  input.addEventListener('input', (e) => {
    if (composing || (e as InputEvent).isComposing) return; // 拼音输入过程中不搜索
    void render();
  });
  input.addEventListener('compositionstart', () => {
    composing = true;
  });
  input.addEventListener('compositionend', () => {
    composing = false;
    void render();
  });
  input.addEventListener('focus', () => {
    if (input.value.trim() && panel.hidden) void render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!panel.hidden) {
        close();
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (panel.hidden) {
        void render();
        return;
      }
      if (links.length === 0) return;
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? (active + 1) % links.length : (active - 1 + links.length) % links.length;
      setActive(next);
      return;
    }
    if (e.key === 'Enter' && active >= 0 && links[active]) {
      e.preventDefault();
      window.location.assign(links[active]!.href);
    }
  });
  form.addEventListener('focusout', (e) => {
    const next = (e as FocusEvent).relatedTarget as Node | null;
    if (!next || !form.contains(next)) close();
  });
  document.addEventListener('pointerdown', (e) => {
    if (!form.contains(e.target as Node)) close();
  });
  panel.addEventListener('mousemove', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.search-hit');
    const i = el ? links.indexOf(el) : -1;
    if (i >= 0 && i !== active) setActive(i);
  });

  // 首次聚焦时才进入这里：如果输入框已有内容（例如浏览器回填），立即显示结果
  if (input.value.trim()) void render();
}
