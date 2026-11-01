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

/**
 * 右下角“地球仪”导航（站长 2026-11-01 要求可以拖动）：
 *  - 点一下：打开导航面板（由 popovertarget 负责，这里不管）；
 *  - 按住拖动超过 8px：按钮跟着手指走，松手后贴到最近的左边或右边，并拦下松手时浏览器补发的那次 click；
 *  - 位置只在当前页面有效：隐私政策写明不使用本地存储，所以换页后回到右下角；
 *  - 拖动只改 CSS 变量 --gx / --gy（transform 位移），不让页面重新布局；面板打开时放在按钮旁边空间较大的一侧。
 */
function initGlobeNav(): void {
  const dock = document.querySelector<HTMLElement>('.globe-dock');
  const fab = dock?.querySelector<HTMLButtonElement>('.globe-fab');
  const panel = document.getElementById('globe-nav');
  if (!dock || !fab || !panel || typeof panel.showPopover !== 'function') return;
  const EDGE = 14;
  let gx = 0;
  let gy = 0;
  let origin = { left: 0, top: 0, w: 0, h: 0 }; // 没有位移时（右下角）的位置
  let drag: { id: number; x: number; y: number; gx: number; gy: number; moved: boolean } | null = null;
  let suppressClick = false;
  let frame = 0;

  const paint = (): void => {
    frame = 0;
    dock.style.setProperty('--gx', `${gx}px`);
    dock.style.setProperty('--gy', `${gy}px`);
  };
  const measure = (): void => {
    const r = dock.getBoundingClientRect();
    origin = { left: r.left - gx, top: r.top - gy, w: r.width, h: r.height };
  };
  const settle = (snap: boolean): void => {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    let left = origin.left + gx;
    let top = origin.top + gy;
    if (snap) left = left + origin.w / 2 < vw / 2 ? EDGE : vw - origin.w - EDGE;
    left = Math.min(Math.max(left, EDGE), vw - origin.w - EDGE);
    top = Math.min(Math.max(top, EDGE), vh - origin.h - EDGE);
    gx = Math.round(left - origin.left);
    gy = Math.round(top - origin.top);
  };

  fab.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dock.classList.remove('is-snapping'); // 上一次贴边动画还没结束时，先跳到终点再量位置
    measure();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, gx, gy, moved: false };
    // 按下时就捕获指针：鼠标移动很快时第一下就会离开按钮，没捕获的话后面的移动事件收不到
    fab.setPointerCapture(e.pointerId);
  });
  fab.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const mx = e.clientX - drag.x;
    const my = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(mx) + Math.abs(my) < 8) return;
      drag.moved = true;
      dock.classList.add('is-dragging');
      if (panel.matches(':popover-open')) panel.hidePopover();
    }
    gx = drag.gx + mx;
    gy = drag.gy + my;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  const finish = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    if (!moved) return;
    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, 400);
    if (frame) cancelAnimationFrame(frame);
    dock.classList.remove('is-dragging');
    settle(true);
    dock.classList.add('is-snapping');
    paint();
    window.setTimeout(() => dock.classList.remove('is-snapping'), 300);
  };
  fab.addEventListener('pointerup', finish);
  fab.addEventListener('pointercancel', finish);
  fab.addEventListener(
    'click',
    (e) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    true,
  );

  // 面板放在按钮旁边：按钮在左半边就左对齐，上下取空间大的一侧
  panel.addEventListener('beforetoggle', (e) => {
    if ((e as ToggleEvent).newState !== 'open') return;
    const r = fab.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const onLeft = r.left + r.width / 2 < vw / 2;
    const above = r.top > vh - r.bottom;
    const room = above ? r.top - 16 - EDGE : vh - r.bottom - 16 - EDGE;
    // 面板大约的高度（宽屏两栏约 480px，手机一栏约 630px）；按钮上下两边都放不下时，改为在屏幕中间打开
    const need = Math.min(window.matchMedia('(min-width: 720px)').matches ? 490 : 640, vh - 2 * EDGE);
    const s = panel.style;
    s.setProperty('--gn-left', onLeft ? `${Math.round(Math.max(EDGE, r.left))}px` : 'auto');
    s.setProperty('--gn-right', onLeft ? 'auto' : `${Math.round(Math.max(EDGE, vw - r.right))}px`);
    if (room >= need) {
      s.setProperty('--gn-top', above ? 'auto' : `${Math.round(r.bottom + 16)}px`);
      s.setProperty('--gn-bottom', above ? `${Math.round(vh - r.top + 16)}px` : 'auto');
      s.setProperty('--gn-maxh', `${Math.round(room)}px`);
      s.setProperty('--gn-origin', `${above ? 'bottom' : 'top'} ${onLeft ? 'left' : 'right'}`);
    } else {
      s.setProperty('--gn-top', `${Math.round(Math.max(EDGE, (vh - need) / 2))}px`);
      s.setProperty('--gn-bottom', 'auto');
      s.setProperty('--gn-maxh', `${Math.round(vh - 2 * EDGE)}px`);
      s.setProperty('--gn-origin', `center ${onLeft ? 'left' : 'right'}`);
    }
  });

  // 转屏或改变窗口大小后，把拖过的按钮重新贴边，免得跑出屏幕
  window.addEventListener(
    'resize',
    () => {
      if (!gx && !gy) return;
      measure();
      settle(true);
      paint();
    },
    { passive: true },
  );
}
initGlobeNav();

/**
 * 手机页头的导航是一行可以横向滑动的链接，屏幕上只露出一两个。右边（滑过之后还有左边）淡出一截，
 * 让人看得出“还能往旁边滑”；滑到头就不再淡出。只切换 class，样式在 layout.css。
 */
function initNavHint(): void {
  const nav = document.querySelector<HTMLElement>('.site-nav');
  if (!nav) return;
  let raf = 0;
  const update = (): void => {
    raf = 0;
    const max = nav.scrollWidth - nav.clientWidth;
    nav.classList.toggle('has-more', max > 1 && nav.scrollLeft < max - 4);
    nav.classList.toggle('has-prev', max > 1 && nav.scrollLeft > 4);
  };
  const schedule = (): void => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  nav.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}
initNavHint();

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
