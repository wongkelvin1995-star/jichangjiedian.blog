/**
 * 构建站内搜索索引。数据全部来自与目录、地区页、文章相同的数据源，不另外维护一份。
 * 索引只含站内链接和公开的资料文字，不含任何推广链接。
 */
import { BRANDS } from '../data/brands';
import { SHEET_LOWEST } from '../data/owner-sheet-prices';
import { MAP_POINTS, REGION_PAGES, coverageFor, getMapPoint } from '../data/regions';
import { LDY_REPORT_PATH } from '../data/reports/lingdongyun-sg-2026-10';
import { LDY_PEAK_PAGE_PATH } from '../data/reports/lingdongyun-peak-2026-10-28';
import { ROUTE_TYPES, getRouteType } from '../data/routes';
import { SEARCH_TERMS } from '../data/search-terms';
import type { Brand, EvidenceGrade } from '../data/types';
import { loadPosts } from './content';
import { bestGrade } from './format';
import { BRAND_COUNT } from './site';
import { routeChipsOf } from './queries';
import type { CoverTuple, SearchEntry } from './search-core';

const firstSentence = (s: string): string => {
  const i = s.indexOf('。');
  return i === -1 ? s : s.slice(0, i + 1);
};

/** 固定栏目页面：标题、简介与别名 */
const PAGES: readonly SearchEntry[] = [
  { k: 'page', t: '全球节点地图', u: '/#global-map', d: '按地区查看哪些机场在公开资料里有记录；航线为地区关系示意。', s: ['地图', '节点地图', '航线', '全球', '地区分布', '世界地图'] },
  { k: 'page', t: `${BRAND_COUNT}家机场目录`, u: '/airports/', d: '固定编辑顺序的机场资料目录，不是排名。', s: ['机场', '机场目录', '34家', '品牌', '目录', '全部机场'] },
  { k: 'page', t: '灵动云新加坡节点测速报告', u: LDY_REPORT_PATH, d: '新加坡节点晚高峰复测、此前一次测速、YouTube 播放观察和节点在线记录，分别说明能证明什么。', s: ['灵动云', '新加坡节点测速', '测速报告', '晚高峰', '57节点', 'YouTube 720p'] },
  { k: 'page', t: '灵动云晚高峰三地实测', u: LDY_PEAK_PAGE_PATH, d: '2026-10-28 晚高峰香港、新加坡、美国节点的网页测速、网站连通性与 YouTube 观察。', s: ['灵动云', '香港节点测速', '美国节点测速', '美国节点延迟', '晚高峰测速', '三地对比'] },
  { k: 'page', t: '分时段节点测试', u: '/time-tests/', d: '早间、午间、晚间、晚高峰、深夜五个时间窗口的测试记录与空窗口。', s: ['测速', '时间段', '测试记录', '分时段', '趋势', '晚高峰'] },
  { k: 'page', t: '节点地区', u: '/regions/', d: '香港、日本、新加坡、中国台湾、美国、韩国、欧洲等地区专题。', s: ['地区', '节点地区', '地区专题', '国家'] },
  { k: 'page', t: '线路知识', u: '/routes/', d: 'IPLC、IEPL、BGP、CN2、中转、直连等线路术语，以及资料里的来源情况。', s: ['线路', '线路类型', '术语', '线路知识'] },
  { k: 'page', t: '套餐对比', u: '/plans/', d: '按预算、流量、周期筛选并换算月均价与每 GB 参考成本。', s: ['套餐', '价格', '对比', '年付', '月付', '便宜', '流量', '预算', '性价比'] },
  { k: 'page', t: '客户端教程', u: '/guides/', d: '客户端与测试方法教程。', s: ['教程', '客户端', '怎么用', '教程列表'] },
  { k: 'page', t: '研究文章', u: '/articles/', d: '原创研究文章：测速指标、线路知识、地区对比与测试方法。', s: ['文章', '研究', '文章列表'] },
  { k: 'page', t: '测试方法', u: '/testing-methodology/', d: '时间窗口、记录字段、证据等级和统计规则。', s: ['方法', '测试规则', '时间窗口', '统计规则', '怎么测'] },
  { k: 'page', t: '测试档案', u: '/test-records/', d: '全部测试记录与证据状态；CSV 不含订阅链接、令牌等敏感信息。', s: ['档案', '记录', '测试记录', 'CSV', '数据下载'] },
  { k: 'page', t: '资料来源', u: '/sources/', d: '来源登记与证据等级 A / B / C / D 的含义。', s: ['来源', '证据等级', '资料来源', '等级'] },
  { k: 'page', t: '关于本站', u: '/about/', d: '本站是什么、怎么整理资料、不做什么。', s: ['关于', '本站', '联系', '站长'] },
  { k: 'page', t: '合作推广声明', u: '/affiliate-disclosure/', d: '站内购买入口是推广链接，本站可能获得佣金；推广关系不作为评价依据。', s: ['推广', '联盟', '佣金', '广告', 'affiliate', '购买入口'] },
  { k: 'page', t: '隐私政策', u: '/privacy/', d: '本站不使用 Cookie 和本地存储，搜索在浏览器内完成。', s: ['隐私', 'Cookie', '个人信息'] },
];

/** 个别地区的常见写法（规范化后会去掉空格、转小写，所以 “Hong Kong” 不必再写一遍 “hongkong”） */
const COVER_ALIASES: Record<string, string[]> = { TW: ['台湾', '台湾节点'], US: ['usa'], GB: ['uk'] };

/**
 * 机场的“覆盖记录”：公开资料（来源等级 A–C）里有哪些地区、哪些线路类型的记录。
 * 与地区专题页、地图使用同一套判断（coverageFor / routeChipsOf），只有 D 级（待核验）的记录不计入。
 * 这只表示“公开资料里有记录”，不表示本站实测可用；搜索结果会把来源等级一并显示。
 */
function coverOf(brand: Brand): CoverTuple[] {
  const out: CoverTuple[] = [];
  for (const page of REGION_PAGES) {
    const grades: EvidenceGrade[] = [];
    for (const code of page.countryCodes) {
      const cov = coverageFor(brand, code);
      if (cov.level !== 'documented') continue;
      const point = getMapPoint(code);
      if (!point) continue;
      const g = bestGrade(cov.claims.filter((c) => c.grade !== 'D').map((c) => c.grade));
      grades.push(g);
      out.push([point.name, g, point.name, `${point.name}节点`, point.nameEn, code, ...(COVER_ALIASES[code] ?? [])]);
    }
    // 多国家的地区页（欧洲）：任何一个国家有记录，也算“欧洲有记录”
    if (grades.length > 0 && page.countryCodes.length > 1) out.push([page.name, bestGrade(grades), page.name, `${page.name}节点`, page.nameEn]);
  }
  for (const chip of routeChipsOf(brand)) {
    if (chip.grade === 'D') continue;
    const rt = getRouteType(chip.id);
    out.push([rt.name, chip.grade, rt.name, rt.slug]);
  }
  return out;
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = [];

  for (const b of BRANDS) {
    const cover = coverOf(b);
    entries.push({
      k: 'brand',
      t: b.brandName,
      u: `/airports/${b.slug}/`,
      d: [SHEET_LOWEST[b.slug] ? `月付低至 ¥${SHEET_LOWEST[b.slug]!.price}` : '', b.nodeCount.value !== null ? `${b.nodeCount.value}${/不少于|下限|50\+/.test(b.nodeCount.note ?? '') ? '+' : ''} 个节点` : '', b.slug === 'lingdongyun' ? '本站主推' : ''].filter(Boolean).join('｜'),
      s: [b.shortName, b.nameEn ?? '', b.slug, ...b.aliases].filter(Boolean),
      ...(cover.length ? { c: cover } : {}),
    });
  }

  for (const r of REGION_PAGES) {
    const points = MAP_POINTS.filter((p) => r.countryCodes.includes(p.countryCode));
    entries.push({
      k: 'region',
      t: r.fullName,
      u: `/regions/${r.slug}/`,
      d: firstSentence(r.intro),
      s: [r.name, r.nameEn, ...r.searchTerms, ...r.countryCodes, ...points.flatMap((p) => [p.name, p.nameEn])],
    });
  }

  for (const rt of ROUTE_TYPES) {
    const inner = rt.fullName.match(/（(.+?)）/)?.[1];
    const routeTitle = rt.fullName.toLowerCase().includes(rt.name.toLowerCase()) ? rt.fullName : `${rt.name}（${inner ?? rt.fullName}）`;
    entries.push({
      k: 'route',
      t: routeTitle,
      u: `/routes/#${rt.slug}`,
      d: firstSentence(rt.short),
      s: [rt.name, rt.fullName, ...rt.aliases],
    });
  }

  for (const p of await loadPosts()) {
    entries.push({
      k: p.kind === 'articles' ? 'article' : 'guide',
      t: p.title,
      u: p.href,
      d: p.description,
      s: [...p.keywords, p.category],
    });
  }

  entries.push(...PAGES);

  // 同一个链接只保留一行；别名并入已有条目
  const byUrl = new Map<string, SearchEntry>();
  for (const e of entries) {
    const hit = byUrl.get(e.u);
    if (hit) hit.s.push(e.t, ...e.s);
    else byUrl.set(e.u, { ...e, s: [...e.s] });
  }
  for (const term of SEARCH_TERMS) {
    const target = byUrl.get(term.url);
    if (!target) throw new Error(`搜索别名“${term.label}”指向了不存在的条目：${term.url}`);
    target.p = [...(target.p ?? []), ...term.aliases];
  }

  // 去重、去空
  const clean = (xs: string[]): string[] => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];
  return [...byUrl.values()].map((e) => {
    const out: SearchEntry = { ...e, s: clean(e.s) };
    if (e.p?.length) out.p = clean(e.p);
    else delete out.p;
    return out;
  });
}
