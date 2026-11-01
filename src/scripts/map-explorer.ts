/**
 * 地图探索器：点击地区 → 右侧资料面板切换、航线高亮、柔和放大；
 * 品牌 / 线路类型 / 资料状态三个筛选器作用于当前面板。
 * 首页 HTML 只带默认地区（香港）的概况；各地区的机场清单、以及其他地区的概况，从 /region-rows.json 读取：
 * 香港的清单在页面加载时，其他地区在第一次点开时（首页 HTML 的体积，见 pages/region-rows.json.ts）。
 * 生成的结构与 RegionPanel.astro 服务端渲染的一致，文字一律用 textContent / append 写入。
 */

/** /region-rows.json 的结构，字段说明见 pages/region-rows.json.ts */
interface LazyRow {
  s: string;
  n: string;
  k: number;
  l: string;
  g: [string, string?][];
  c: number | null;
  a: number | null;
  w: boolean;
  t: [string, string, boolean][];
}
interface LazyHead {
  d: number;
  u: number;
  x: number;
  rc: [string, number, number][];
  sr: number;
  sn: [number, number, string] | null;
  tp: number;
  slug: string;
  total: number;
}
type RegionData = Record<string, { h: LazyHead; r: LazyRow[] }>;

const root = document.querySelector<HTMLElement>('[data-map-explorer]');

if (root) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = root.querySelector<SVGSVGElement>('.worldmap');
  const zoomG = root.querySelector<SVGGElement>('.map-zoom');
  const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-region-tab]'));
  const dots = Array.from(root.querySelectorAll<SVGAElement>('.dot'));
  const routes = Array.from(root.querySelectorAll<SVGPathElement>('.route'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-region-panel]'));
  const resetBtn = root.querySelector<HTMLButtonElement>('[data-map-reset]');
  const live = root.querySelector<HTMLElement>('[data-map-live]');
  const selects = Array.from(root.querySelectorAll<HTMLSelectElement>('[data-filter]'));

  const W = Number(svg?.dataset.w ?? 1000);
  const H = Number(svg?.dataset.h ?? 461);
  let current = root.dataset.default ?? 'HK';

  /** 各地区的放大倍数：亚洲点位密集，放大更多；美国范围大，放大较少 */
  const SCALE: Record<string, number> = { HK: 3.4, TW: 3.4, JP: 3, KR: 3.4, SG: 3.4, US: 1.9, DE: 3.2, GB: 3.2, FR: 3.2 };

  const filters = () => Object.fromEntries(selects.map((s) => [s.dataset.filter!, s.value])) as Record<string, string>;

  // ---- 按需加载的地区数据
  let regionData: Promise<RegionData> | null = null;
  const loadRegions = (): Promise<RegionData> => {
    if (!regionData) {
      regionData = fetch('/region-rows.json', { credentials: 'omit' }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RegionData>;
      });
      regionData.catch(() => {
        regionData = null; // 失败后允许下次重试
      });
    }
    return regionData;
  };
  const mk = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    e.append(...kids);
    return e;
  };
  const span = (cls: string, ...kids: (Node | string)[]): HTMLSpanElement => mk('span', cls, ...kids);
  const num = (n: number | string): HTMLElement => mk('b', 'num', String(n));

  /** 概况（与 RegionPanel.astro 的 cover-line / facts / count / empty 一致），插在清单前后 */
  const buildHead = (panel: HTMLElement, list: HTMLElement, h: LazyHead): void => {
    const cover = mk('p', 'cover-line', span('is-doc', num(h.d), '家机场提供'), ' ', span('is-unv', num(h.u), '家资料补充中'), ' ', span('is-none', num(h.x), '家未列出'));
    const routesDd = mk('dd');
    if (h.rc.length) {
      const row = span('chip-row');
      for (const [label, ok, pending] of h.rc) {
        const chip = span('chip', `${label} `, num(ok));
        if (pending > 0) chip.append(' ', span('text-mute', `＋${pending}`));
        row.append(chip);
      }
      routesDd.append(row);
    } else routesDd.append(span('', '资料中没有可用的线路类型记录。'));
    const recDd = mk('dd');
    recDd.append(h.sr > 0 ? span('', '本站实测 ', num(h.sr), ' 条') : span('', '该地区实测持续更新中'));
    if (h.sn) recDd.append(span('', '；节点在线快照 ', num(`${h.sn[0]}/${h.sn[1]}`), `（${h.sn[2]}）`));
    if (h.tp > 0) recDd.append(span('', '；其他测速参考 ', num(h.tp), ' 行'));
    const link = mk('a', '', '查看记录');
    link.href = `/regions/${h.slug}/#records`;
    recDd.append('。', link);
    const facts = mk('dl', 'region-panel__facts', mk('div', '', mk('dt', '', '线路类型'), routesDd), mk('div', '', mk('dt', '', '测试记录'), recDd));
    const count = mk('p', 'region-count', '共 ', span('num', String(h.total)), ' 家有记录');
    count.dataset.regionCount = '';
    count.setAttribute('aria-live', 'polite');
    const empty = mk('p', 'region-empty', '没有符合当前筛选条件的机场。可以放宽品牌、线路类型或资料状态的筛选。');
    empty.dataset.regionEmpty = '';
    empty.hidden = true;
    list.before(cover, facts, count);
    list.after(empty);
    delete panel.dataset.shell;
  };

  /** 清单的一行（与 RegionPanel.astro 的行结构一致） */
  const buildRow = (d: LazyRow): HTMLLIElement => {
    const li = mk('li');
    li.dataset.brand = d.s;
    li.dataset.level = d.l;
    li.dataset.routes = d.t.map((x) => x[0]).join(' ');
    const a = mk('a', '', d.n);
    a.href = `/airports/${d.s}/`;
    const main = span('rb__main', a);
    for (const [label, title] of d.g) {
      const chip = span('chip chip--gray', label);
      if (title) chip.title = title;
      main.append(' ', chip);
    }
    const node =
      d.c !== null ? span('', '节点 ', num(d.c), ' 个') : d.a !== null ? span('', `该地区未写数量（全站${d.w ? '不少于 ' : '约 '}`, num(d.a), ' 个）') : span('', '节点数未公布');
    const meta = span('rb__meta', span('', node), ' ');
    for (const [, label, ok] of d.t) meta.append(span(ok ? 'chip' : 'chip chip--gray', label));
    li.append(span('rb__rank num', String(d.k).padStart(2, '0')), ' ', main, ' ', meta);
    return li;
  };

  async function fillPanel(panel: HTMLElement): Promise<void> {
    const list = panel.querySelector<HTMLElement>('.region-brands[data-rows="lazy"]');
    if (!list) return;
    list.dataset.rows = 'loading';
    list.setAttribute('aria-busy', 'true');
    const count = panel.querySelector<HTMLElement>('[data-region-count]');
    const fail = panel.querySelector<HTMLElement>('[data-region-fail]');
    if (count) count.textContent = '正在加载机场清单…';
    if (fail) fail.hidden = true;
    try {
      const all = await loadRegions();
      // 先让这次点击的画面（面板切换、地图放大）画出来，再生成清单：数据已缓存时也不在同一帧里做，交互响应更快
      await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
      const data = all[panel.dataset.regionPanel ?? ''];
      if (!data) throw new Error('no data');
      if (panel.dataset.shell) buildHead(panel, list, data.h);
      list.append(...data.r.map(buildRow));
      delete list.dataset.rows;
      list.removeAttribute('aria-busy');
      applyFilters(panel);
      if (panel.dataset.regionPanel === current) announce(panel);
    } catch {
      list.dataset.rows = 'lazy';
      list.removeAttribute('aria-busy');
      if (count) count.textContent = '';
      if (fail) fail.hidden = false;
    }
  }

  /** 读屏软件的播报：概况加载完以后才有数字 */
  function announce(panel: HTMLElement): void {
    const title = panel.querySelector('h3')?.textContent?.replace(/[A-Za-z ]+$/, '').trim() ?? panel.dataset.regionPanel;
    const nums = panel.querySelectorAll('.cover-line .num');
    if (!live) return;
    // 概况还没加载时先播报地区名，加载完再补上数字
    live.textContent = nums.length >= 2 ? `已选择${title}：${nums[0]!.textContent} 家机场提供，${nums[1]!.textContent} 家资料补充中。` : `已选择${title}，正在加载机场清单。`;
  }

  function applyFilters(panel: HTMLElement): void {
    // 清单还没加载完时不计数，免得先闪一下“没有符合条件的机场”
    if (panel.querySelector('.region-brands[data-rows]')) return;
    const f = filters();
    const items = Array.from(panel.querySelectorAll<HTMLElement>('.region-brands > li'));
    let shown = 0;
    for (const li of items) {
      const okBrand = !f.brand || li.dataset.brand === f.brand;
      const okRoute = !f.route || (li.dataset.routes ?? '').split(' ').includes(f.route);
      const okLevel = !f.level || li.dataset.level === f.level;
      const show = okBrand && okRoute && okLevel;
      li.hidden = !show;
      if (show) shown++;
    }
    const count = panel.querySelector<HTMLElement>('[data-region-count]');
    if (count) count.textContent = shown === items.length ? `共 ${items.length} 家有记录` : `显示 ${shown} / ${items.length} 家`;
    const empty = panel.querySelector<HTMLElement>('[data-region-empty]');
    if (empty) empty.hidden = shown !== 0;
  }

  function zoomTo(code: string | null): void {
    if (!zoomG) return;
    if (!code) {
      zoomG.style.setProperty('--zs', '1');
      zoomG.style.setProperty('--zx', '0px');
      zoomG.style.setProperty('--zy', '0px');
      if (resetBtn) resetBtn.hidden = true;
      return;
    }
    const dot = dots.find((d) => d.dataset.region === code);
    if (!dot) return;
    const s = SCALE[code] ?? 3;
    const x = Number(dot.dataset.x);
    const y = Number(dot.dataset.y);
    const tx = Math.min(0, Math.max(W - s * W, W / 2 - s * x));
    const ty = Math.min(0, Math.max(H - s * H, H / 2 - s * y));
    zoomG.style.setProperty('--zs', String(s));
    zoomG.style.setProperty('--zx', `${tx}px`);
    zoomG.style.setProperty('--zy', `${ty}px`);
    if (resetBtn) resetBtn.hidden = false;
  }

  function select(code: string, opts: { zoom: boolean }): void {
    current = code;
    for (const d of dots) d.classList.toggle('is-selected', d.dataset.region === code);
    for (const r of routes) r.classList.toggle('is-selected', r.dataset.region === code);
    for (const t of tabs) {
      const on = t.dataset.regionTab === code;
      t.dataset.selected = on ? 'true' : 'false';
      if (on) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    }
    for (const p of panels) {
      const on = p.dataset.regionPanel === code;
      if (on && p.hidden) {
        p.hidden = false;
        if (!reduce) {
          p.classList.add('is-entering');
          p.addEventListener('animationend', () => p.classList.remove('is-entering'), { once: true });
        }
      } else if (!on) {
        p.hidden = true;
      }
      if (on) {
        applyFilters(p);
        void fillPanel(p);
      }
    }
    if (opts.zoom) zoomTo(code);
    const active = panels.find((p) => p.dataset.regionPanel === code);
    if (active) announce(active);
  }

  // 启用交互：解除筛选器禁用，并让圆点和切换条改为就地选择
  root.dataset.enhanced = 'true';
  for (const s of selects) {
    s.disabled = false;
    s.addEventListener('change', () => {
      const p = panels.find((x) => x.dataset.regionPanel === current);
      if (p) applyFilters(p);
    });
  }

  const intercept = (el: Element, code: string) => {
    el.addEventListener('click', (ev) => {
      const e = ev as MouseEvent;
      // 保留“新标签页打开”等修饰键行为
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      select(code, { zoom: true });
    });
  };
  for (const t of tabs) intercept(t, t.dataset.regionTab!);

  // 手机上地图缩得很小，相邻地区的圆点只隔几个像素（香港与台湾约 7px），触摸命中区会相互重叠；
  // 重叠处浏览器只把点击交给最上面那个圆点。这里改为：落在命中区内的所有圆点里，选离点击位置最近的。
  const nearestDot = (e: MouseEvent, fallback: SVGElement): SVGElement => {
    // 键盘回车或辅助技术触发的点击没有真实坐标，直接用被激活的那个圆点
    const pointerType = (e as PointerEvent).pointerType;
    if (e.detail === 0 || pointerType === '') return fallback;
    let best = fallback;
    let bestDist = Infinity;
    for (const d of dots) {
      const hit = d.querySelector('.dot__hit')?.getBoundingClientRect();
      const core = d.querySelector('.dot__core')?.getBoundingClientRect();
      if (!hit || !core) continue;
      const dist = Math.hypot(e.clientX - (core.left + core.width / 2), e.clientY - (core.top + core.height / 2));
      if (dist <= hit.width / 2 + 0.5 && dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    return best;
  };
  for (const d of dots) {
    d.addEventListener('click', (ev) => {
      const e = ev as MouseEvent;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      select(nearestDot(e, d).dataset.region!, { zoom: true });
    });
  }

  resetBtn?.addEventListener('click', () => {
    zoomTo(null);
    resetBtn.hidden = true;
  });

  // 鼠标移到地图或键盘进入地图区域时，提前加载其他地区的清单（只加载一次，失败也不影响当前面板）
  const prefetch = (): void => {
    root.removeEventListener('pointerover', prefetch);
    root.removeEventListener('focusin', prefetch);
    loadRegions().catch(() => undefined);
  };
  root.addEventListener('pointerover', prefetch);
  root.addEventListener('focusin', prefetch);

  // 首次进入：默认地区只高亮，不放大
  select(current, { zoom: false });
}

export {};
