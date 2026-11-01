/**
 * 套餐对比：按预算、流量、周期、地区、线路、客户端、可靠度筛选，并可临时按月均价/每 GB 成本/流量排序。
 * 不可精确比较的报价永远排在最后；“恢复默认”回到品牌固定顺序。
 *
 * 数据：HTML 里只有前 40 行（没有脚本时也能看）；全部报价在 /plans-rows.json（字段见 src/lib/plan-rows.ts）。
 * 表格里只放“当前要显示的那几十行”：筛选和排序都在内存里的普通对象上算，算完一次性替换 tbody 的内容。
 * 这样页面 HTML 从 700KB 以上降到不到 100KB，DOM 节点也少了一个数量级，手机上输入时不会卡。
 * 生成的行与 pages/plans.astro 的模板结构一致，文字一律用 textContent / append 写入。
 */

/** /plans-rows.json 的一行（与 src/lib/plan-rows.ts 的 PlanRowView 一致） */
interface View {
  i: number;
  comp: string;
  period: string;
  monthly: number | null;
  pergb: number | null;
  gb: number | null;
  regions: string;
  routes: string;
  clients: string;
  slug: string;
  name: string;
  plan: string;
  noCoupon: string;
  note: string;
  periodText: string;
  price: string;
  traffic: string;
  monthlyText: string;
  perGBText: string;
  formula: string | null;
  chip: [string, string];
  reasons: string;
  status: string;
  grade: string;
  date: string;
}

interface Row {
  v: View;
  /** 表格行：HTML 里已有的前 40 行直接复用，其余第一次要显示时才生成 */
  tr: HTMLTableRowElement | null;
  /** 0 = 可精确比较，1 = 有标注的参考，2 = 不可比较 */
  rank: number;
  /** 已处理：不可比较的报价没有每 GB 成本 */
  pergb: number | null;
  regions: Set<string>;
  routes: Set<string>;
  clients: Set<string>;
}

type SortKey = 'default' | 'monthly' | 'pergb' | 'gb';

const root = document.querySelector<HTMLElement>('[data-plans]');
const form = root?.querySelector<HTMLFormElement>('[data-plan-filters]');
const tbody = root?.querySelector<HTMLTableSectionElement>('[data-plan-table] tbody');

if (root && form && tbody) {
  const count = root.querySelector<HTMLElement>('[data-plan-count]');
  const empty = root.querySelector<HTMLElement>('[data-plan-empty]');
  const moreWrap = root.querySelector<HTMLElement>('[data-plan-more-wrap]');
  const moreBtn = root.querySelector<HTMLButtonElement>('[data-plan-more]');
  const PAGE = 40;
  let limit = PAGE;
  const serverRows = new Map(Array.from(tbody.rows).map((tr) => [Number(tr.dataset.i), tr] as const));

  const mk = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    e.append(...kids);
    return e;
  };
  const cell = (tag: 'td' | 'th', cls: string, label: string, ...kids: (Node | string)[]): HTMLTableCellElement => {
    const c = mk(tag, cls, ...kids);
    c.dataset.label = label;
    return c;
  };

  let grades: Record<string, { title: string; label: string }> = {};
  /** 与 pages/plans.astro 的行模板一致 */
  const buildRow = (v: View): HTMLTableRowElement => {
    const tr = mk('tr');
    Object.assign(tr.dataset, {
      i: String(v.i),
      comp: v.comp,
      period: v.period,
      monthly: v.monthly ?? '',
      pergb: v.pergb ?? '',
      gb: v.gb ?? '',
      regions: v.regions,
      routes: v.routes,
      clients: v.clients,
    });
    const link = mk('a', '', v.name);
    link.href = `/airports/${v.slug}/`;
    const head = cell('th', 'col-nowrap', '机场', link);
    head.scope = 'row';
    const plan = cell('td', '', '套餐', v.plan);
    if (v.noCoupon) plan.append(mk('span', 'cell-sub cell-sub--warn', v.noCoupon));
    if (v.note) plan.append(mk('span', 'cell-sub', v.note));
    const perGB = cell('td', 'col-num num', '每 GB 参考', v.perGBText);
    if (v.formula) perGB.title = v.formula;
    const comp = cell('td', '', '可比较性', mk('span', v.chip[0], v.chip[1]));
    if (v.reasons) comp.append(mk('span', 'cell-sub', v.reasons));
    if (v.status) comp.append(mk('span', 'cell-sub', v.status));
    const g = grades[v.grade];
    const badge = mk('span', 'grade', mk('span', 'grade__letter', v.grade), ' ', mk('span', 'visually-hidden', g?.label ?? `${v.grade} 级`));
    badge.dataset.grade = v.grade;
    badge.firstElementChild?.setAttribute('aria-hidden', 'true');
    if (g) badge.title = g.title;
    tr.append(
      head,
      plan,
      cell('td', 'col-nowrap', '周期', v.periodText),
      cell('td', 'col-num num', '标价', v.price),
      cell('td', 'col-nowrap', '流量', v.traffic),
      cell('td', 'col-num num', '月均价', v.monthlyText),
      perGB,
      comp,
      cell('td', 'text-sm col-nowrap', '来源', badge, ' ', mk('span', 'cell-sub', v.date)),
    );
    return tr;
  };
  const trOf = (r: Row): HTMLTableRowElement => (r.tr ??= buildRow(r.v));

  const words = (v: string): Set<string> => new Set(v.split(' ').filter(Boolean));
  let rows: Row[] = [];

  /** 某种排序下的行顺序（缓存；排序与筛选无关）。不可精确比较的永远在最后，其内部保持默认顺序 */
  const orders = new Map<SortKey, Row[]>();
  const orderFor = (sort: SortKey): Row[] => {
    const cached = orders.get(sort);
    if (cached) return cached;
    const key = (r: Row): number | null => (sort === 'monthly' ? r.v.monthly : sort === 'pergb' ? r.pergb : sort === 'gb' ? r.v.gb : null);
    const sorted = [...rows].sort((a, b) => {
      if (sort === 'default') return a.v.i - b.v.i;
      if (a.rank !== b.rank) return a.rank - b.rank;
      const ka = key(a);
      const kb = key(b);
      if (ka === null && kb === null) return a.v.i - b.v.i;
      if (ka === null) return 1;
      if (kb === null) return -1;
      const diff = sort === 'gb' ? kb - ka : ka - kb;
      return diff !== 0 ? diff : a.v.i - b.v.i;
    });
    orders.set(sort, sorted);
    return sorted;
  };

  const get = (name: string): string => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;
  const num = (v: string): number | null => (v === '' ? null : Number(v));
  /** 上一次放进表格的行，没变就不动 DOM */
  let shownKey = '';

  const apply = (resetLimit = true): void => {
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
      if (level === 'exact' && r.v.comp !== 'exact') return false;
      if (level === 'flagged' && r.v.comp === 'excluded') return false;
      if (period && r.v.period !== period) return false;
      if (region && !r.regions.has(region)) return false;
      if (route && !r.routes.has(route)) return false;
      if (client && !r.clients.has(client)) return false;
      // 预算与流量条件：缺少数值的报价无法判断，直接不显示（不当作 0）
      if (budget !== null && (r.v.monthly === null || r.v.monthly > budget)) return false;
      if (gb !== null && (r.v.gb === null || r.v.gb < gb)) return false;
      return true;
    };

    const hits = orderFor(sort).filter(matches);
    const page = hits.slice(0, limit);
    const key = page.map((r) => r.v.i).join(',');
    if (key !== shownKey) {
      tbody.replaceChildren(...page.map(trOf));
      shownKey = key;
    }

    if (moreWrap && moreBtn) {
      const rest = hits.length - limit;
      moreWrap.hidden = rest <= 0;
      moreBtn.textContent = `显示更多报价（还有 ${Math.max(rest, 0)} 条）`;
    }

    const filtered = !!(budget !== null || gb !== null || period || region || route || client || level !== 'all' || sort !== 'default');
    if (count) {
      const base = `符合条件 ${hits.length} / ${rows.length} 条报价，当前显示前 ${Math.min(limit, hits.length)} 条`;
      count.textContent = filtered || hits.length > limit ? `${base}${sort === 'default' ? '，按品牌固定顺序' : '，临时排序（点“恢复默认”回到固定顺序）'}` : '';
    }
    if (empty) empty.hidden = hits.length > 0;
  };

  const start = (data: { grades: typeof grades; rows: View[] }): void => {
    grades = data.grades;
    rows = data.rows.map((v) => ({
      v,
      tr: serverRows.get(v.i) ?? null,
      rank: v.comp === 'exact' ? 0 : v.comp === 'flagged' ? 1 : 2,
      pergb: v.comp === 'excluded' ? null : v.pergb,
      regions: words(v.regions),
      routes: words(v.routes),
      clients: words(v.clients),
    }));
    // HTML 里的前 40 行默认就是第一页，记下来，第一次 apply 时不必重放
    shownKey = Array.from(tbody.rows).map((tr) => tr.dataset.i).join(',');

    // 表单在 HTML 里就占好了位置（控件先禁用），数据就绪后才启用——这样启用时页面不会发生布局位移（CLS）
    for (const el of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input, select, button')) el.disabled = false;
    form.addEventListener('submit', (e) => e.preventDefault());
    // 输入数字时每敲一个键都会触发 input：等停下 150ms 再筛选，打字时不卡；下拉框（change）立即生效
    let typing = 0;
    form.addEventListener('input', (e) => {
      if ((e.target as HTMLElement).tagName !== 'INPUT') return;
      clearTimeout(typing);
      typing = window.setTimeout(() => apply(), 150);
    });
    // 下拉框：先让下拉框本身的变化画出来，再在下一个任务里重排表格（表格重排不算进这次点击的响应时间）
    form.addEventListener('change', () => {
      clearTimeout(typing);
      requestAnimationFrame(() => setTimeout(() => apply(), 0));
    });
    form.addEventListener('reset', () => setTimeout(() => apply(), 0));
    moreBtn?.addEventListener('click', () => {
      limit += PAGE;
      apply(false);
    });
    apply();

    // 浏览器空闲时分批把其余行先生成好（不放进页面），之后排序、筛选只需要换行，不用当场生成
    const w = window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
    const idle = (f: () => void): void => {
      if (w.requestIdleCallback) w.requestIdleCallback(f, { timeout: 3000 });
      else setTimeout(f, 120);
    };
    let next = 0;
    const prebuild = (): void => {
      const end = Math.min(rows.length, next + 30);
      for (; next < end; next++) trOf(rows[next]!);
      if (next < rows.length) idle(prebuild);
    };
    idle(prebuild);
  };

  fetch('/plans-rows.json', { credentials: 'omit' })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<{ grades: typeof grades; rows: View[] }>;
    })
    .then(start)
    .catch(() => {
      // 数据没加载出来：保留 HTML 里的前 40 行，筛选保持禁用，并说明原因
      if (count) count.textContent = '筛选数据没能加载出来，下面是按品牌顺序的前 40 条报价；刷新页面可以重试，每家的全部套餐也可以在各机场页面查看。';
    });
}

export {};
