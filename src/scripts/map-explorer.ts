/**
 * 地图探索器：点击地区 → 右侧资料面板切换、航线高亮、柔和放大；
 * 品牌 / 线路类型 / 资料状态三个筛选器作用于当前面板。
 * 所有内容都在 HTML 中服务端渲染，这里只负责显示与隐藏，没有数据请求。
 */
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

  function applyFilters(panel: HTMLElement): void {
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
      if (on) applyFilters(p);
    }
    if (opts.zoom) zoomTo(code);
    const active = panels.find((p) => p.dataset.regionPanel === code);
    const title = active?.querySelector('h3')?.textContent?.replace(/[A-Za-z ]+$/, '') ?? code;
    const nums = active?.querySelectorAll('.cover-line .num');
    if (live && nums && nums.length >= 2) live.textContent = `已选择${title}：${nums[0]!.textContent} 家机场提供，${nums[1]!.textContent} 家资料补充中。`;
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

  // 首次进入：默认地区只高亮，不放大
  select(current, { zoom: false });
}

export {};
