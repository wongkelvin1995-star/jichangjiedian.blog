/**
 * 全站轻量脚本：
 *  1. 滚动出现（只对首屏以下元素生效，尊重 prefers-reduced-motion）；
 *  2. 横向可滚动的表格容器：能滚动时才可键盘聚焦，并带上名称（WCAG 2.1.1；axe: scrollable-region-focusable）；
 *  3. 站内搜索（在 search.ts 中按需加载，首次聚焦输入框才加载索引）。
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (!items.length || reduce || !('IntersectionObserver' in window)) return;
  const vh = window.innerHeight;
  const pending = items.filter((el) => el.getBoundingClientRect().top > vh * 0.95);
  pending.forEach((el) => el.classList.add('is-pending'));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.remove('is-pending');
        el.classList.add('is-in');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  pending.forEach((el) => io.observe(el));
  // 兜底：无论观察器是否触发（标签页在后台、元素被折叠等），几秒后一律显示，内容不会一直藏着
  window.setTimeout(() => {
    pending.forEach((el) => {
      el.classList.remove('is-pending');
      el.classList.add('is-in');
    });
    io.disconnect();
  }, 6000);
}

/**
 * 表格在窄屏上会在 .table-scroll 里横向滚动。鼠标和触摸可以直接滚，键盘用户需要先能聚焦它，
 * 再用左右方向键滚动——所以只在“确实能滚动”时给它 tabindex、role 与名称（名称取自它前面最近的标题）。
 * 不能滚动时不加，避免给键盘用户增加无意义的 Tab 停靠点。
 */
function initScrollRegions(): void {
  const boxes = Array.from(document.querySelectorAll<HTMLElement>('.table-scroll'));
  if (!boxes.length) return;
  const headings = Array.from(document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main h4'));
  const seen = new Map<string, number>();
  const names = new Map<HTMLElement, string>();
  for (const box of boxes) {
    let title = '';
    for (const h of headings) {
      if (h.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING) title = (h.textContent ?? '').replace(/\s+/g, ' ').trim();
      else break;
    }
    const base = `${(title || '数据').slice(0, 40)}：表格，可左右滚动`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    names.set(box, n === 1 ? base : `${base}（${n}）`); // 同一标题下有多张表时保证名称唯一
  }
  const apply = (box: HTMLElement): void => {
    if (box.scrollWidth > box.clientWidth + 1) {
      box.tabIndex = 0;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', names.get(box) ?? '数据表格，可左右滚动');
    } else {
      box.removeAttribute('tabindex');
      box.removeAttribute('role');
      box.removeAttribute('aria-label');
    }
  };
  const ro = 'ResizeObserver' in window ? new ResizeObserver((entries) => entries.forEach((e) => apply((e.target.closest('.table-scroll') ?? e.target) as HTMLElement))) : null;
  for (const box of boxes) {
    apply(box);
    ro?.observe(box);
    const table = box.querySelector('table');
    if (table) ro?.observe(table);
  }
}

/**
 * 火焰边框只在看得见的时候才动：滚出屏幕就暂停（CSS 里用 .is-live 控制），
 * 省电，也不会拖慢页面上其他交互。没有脚本或浏览器不支持时，火焰保持静止的样子。
 */
function initFlames(): void {
  const boxes = Array.from(document.querySelectorAll<HTMLElement>('.flame-frame, .bcard--hot'));
  if (!boxes.length) return;
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-live', e.isIntersecting);
    },
    { rootMargin: '80px 0px' },
  );
  boxes.forEach((el) => io.observe(el));
}

initReveal();
initScrollRegions();
initFlames();

/** 返回顶部：滚过一屏半后出现；只切换 hidden，滚动监听是 passive，不影响交互响应 */
function initToTop(): void {
  const el = document.querySelector<HTMLAnchorElement>('.to-top');
  if (!el) return;
  let shown = false;
  const update = (): void => {
    const want = window.scrollY > window.innerHeight * 1.5;
    if (want !== shown) {
      shown = want;
      el.hidden = !want;
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
initToTop();

// 搜索框：首次聚焦或输入时才加载搜索模块
const searchForm = document.querySelector<HTMLFormElement>('[data-site-search]');
if (searchForm) {
  const input = searchForm.querySelector<HTMLInputElement>('input[name="q"]');
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    void import('./search').then((m) => m.initSiteSearch(searchForm));
  };
  input?.addEventListener('focus', load, { once: true });
  input?.addEventListener('input', load, { once: true });
}


// 页面头部的背景地球：只在宽屏（≥ 900px，与 CSS 一致）加载，等页面空闲后再加载，不影响首屏
if (window.matchMedia('(min-width: 900px)').matches) {
  const go = () => void import('./globe');
  const w = window as unknown as { requestIdleCallback?: (f: () => void) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(go);
  else setTimeout(go, 600);
}

export {};
