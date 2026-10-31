/**
 * 套餐对比：按预算、流量、周期、地区、线路、客户端、可靠度筛选，并可临时按月均价/每 GB 成本/流量排序。
 * 不可精确比较的报价永远排在最后；“恢复默认”回到品牌固定顺序。
 *
 * 性能：表里有三百多行。DOM 的 dataset 是个很慢的代理对象，在排序比较器和筛选循环里反复读取会让
 * 每次输入都卡几十毫秒，所以初始化时只读一次，把每行解析成普通对象；之后的筛选与排序只读这些对象。
 * 排序结果按排序键缓存（排序与筛选条件无关）；hidden 只在状态真的变化时才写，避免无谓的样式失效。
 */

/** 每一行报价解析后的样子（只在初始化时从 DOM 读一次） */
interface Row {
  tr: HTMLTableRowElement;
  /** 品牌固定顺序下的位置 */
  i: number;
  comp: string;
  /** 0 = 可精确比较，1 = 有标注的参考，2 = 不可比较 */
  rank: number;
  period: string;
  monthly: number | null;
  gb: number | null;
  /** 已处理：不可比较的报价没有每 GB 成本 */
  pergb: number | null;
  regions: Set<string>;
  routes: Set<string>;
  clients: Set<string>;
}

type SortKey = 'default' | 'monthly' | 'pergb' | 'gb';

const root = document.querySelector<HTMLElement>('[data-plans]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-plan-filters]');
  const tbody = root.querySelector<HTMLTableSectionElement>('[data-plan-table] tbody');
  const count = root.querySelector<HTMLElement>('[data-plan-count]');
  const empty = root.querySelector<HTMLElement>('[data-plan-empty]');
  const moreWrap = root.querySelector<HTMLElement>('[data-plan-more-wrap]');
  const moreBtn = root.querySelector<HTMLButtonElement>('[data-plan-more]');
  const PAGE = 40;
  let limit = PAGE;
  let currentSort: SortKey = 'default';
  if (form && tbody) {
    // 表单在 HTML 里就占好了位置（控件先禁用），脚本就绪后才启用——这样启用时页面不会发生布局位移（CLS）
    for (const el of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input, select, button')) el.disabled = false;

    const num = (v: string | undefined): number | null => (v === undefined || v === '' ? null : Number(v));
    const words = (v: string | undefined): Set<string> => new Set((v ?? '').split(' ').filter(Boolean));

    const rows: Row[] = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr')).map((tr, pos) => {
      const d = tr.dataset;
      const comp = d.comp ?? 'excluded';
      return {
        tr,
        i: num(d.i) ?? pos,
        comp,
        rank: comp === 'exact' ? 0 : comp === 'flagged' ? 1 : 2,
        period: d.period ?? '',
        monthly: num(d.monthly),
        gb: num(d.gb),
        pergb: comp === 'excluded' ? null : num(d.pergb),
        regions: words(d.regions),
        routes: words(d.routes),
        clients: words(d.clients),
      };
    });

    /** 某种排序下的行顺序（缓存；排序与筛选无关）。不可精确比较的永远在最后，其内部保持默认顺序 */
    const orders = new Map<SortKey, Row[]>();
    const orderFor = (sort: SortKey): Row[] => {
      const cached = orders.get(sort);
      if (cached) return cached;
      const key = (r: Row): number | null => (sort === 'monthly' ? r.monthly : sort === 'pergb' ? r.pergb : sort === 'gb' ? r.gb : null);
      const sorted = [...rows].sort((a, b) => {
        if (sort === 'default') return a.i - b.i;
        if (a.rank !== b.rank) return a.rank - b.rank;
        const ka = key(a);
        const kb = key(b);
        if (ka === null && kb === null) return a.i - b.i;
        if (ka === null) return 1;
        if (kb === null) return -1;
        const diff = sort === 'gb' ? kb - ka : ka - kb;
        return diff !== 0 ? diff : a.i - b.i;
      });
      orders.set(sort, sorted);
      return sorted;
    };

    const get = (name: string): string => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;

    const apply = (resetLimit = true) => {
      if (resetLimit) limit = PAGE;
      const budget = num(get('budget'));
      const gb = num(get('gb'));
      const period = get('period');
      const region = get('region');
      const route = get('route');
      const client = get('client');
      const level = get('level');
      const sort = get('sort') as SortKey;

      const matches = (r: Row): boolean => {
        if (level === 'exact' && r.comp !== 'exact') return false;
        if (level === 'flagged' && r.comp === 'excluded') return false;
        if (period && r.period !== period) return false;
        if (region && !r.regions.has(region)) return false;
        if (route && !r.routes.has(route)) return false;
        if (client && !r.clients.has(client)) return false;
        // 预算与流量条件：缺少数值的报价无法判断，直接不显示（不当作 0）
        if (budget !== null && (r.monthly === null || r.monthly > budget)) return false;
        if (gb !== null && (r.gb === null || r.gb < gb)) return false;
        return true;
      };

      // 排序（只改变 DOM 顺序）。顺序没变就不动 DOM；变了就一次性按新顺序放回去
      const ordered = orderFor(sort);
      if (sort !== currentSort) tbody.append(...ordered.map((r) => r.tr));
      currentSort = sort;

      // 筛选 + 分页：符合条件的行里，只显示前 limit 条（HTML 里仍是全部报价，未启用脚本时全部可见）
      let visible = 0;
      for (const r of ordered) {
        const ok = matches(r);
        if (ok) visible++;
        const hide = !ok || visible > limit;
        if (r.tr.hidden !== hide) r.tr.hidden = hide;
      }

      if (moreWrap && moreBtn) {
        const rest = visible - limit;
        moreWrap.hidden = rest <= 0;
        moreBtn.textContent = `显示更多报价（还有 ${Math.max(rest, 0)} 条）`;
      }

      const filtered = !!(budget !== null || gb !== null || period || region || route || client || level !== 'all' || sort !== 'default');
      if (count) {
        const base = `符合条件 ${visible} / ${rows.length} 条报价，当前显示前 ${Math.min(limit, visible)} 条`;
        count.textContent = filtered || visible > limit ? `${base}${sort === 'default' ? '，按品牌固定顺序' : '，临时排序（点“恢复默认”回到固定顺序）'}` : '';
      }
      if (empty) empty.hidden = visible > 0;
    };

    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', () => apply());
    form.addEventListener('change', () => apply());
    form.addEventListener('reset', () => setTimeout(() => apply(), 0));
    moreBtn?.addEventListener('click', () => {
      limit += PAGE;
      apply(false);
    });
    apply();
  }
}

export {};
