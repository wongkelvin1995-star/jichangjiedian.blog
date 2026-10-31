/**
 * 站内搜索的匹配核心：纯函数，不依赖 DOM 和 Astro。
 * 浏览器里的搜索框（src/scripts/search.ts）、/search/ 页面和 scripts/validate-search.ts 共用这一份代码，
 * 因此“测试通过”和“用户实际看到的结果”是同一套逻辑。
 *
 * 匹配规则（面向中文）：
 *  - 统一小写，去掉空白与常见标点后做子串匹配，所以“飞 v”“FLYV”“flyv”都能找到飞V；
 *  - 查询里用空格分隔的多个词需要同时命中（“新加坡 测速”）；
 *  - 多个词时，除了“每个词都命中”，还会把它们连起来当作一个词再查一次（“飞 v”→“飞v”），两种结果合并；
 *  - 1–2 位的英文字母/数字（hk、us、v2）太容易在别的词里碰巧出现（south korea 里的 “hk”），
 *    所以它们只按“完全一致”或“词头匹配”计分，不做“包含”匹配；
 *  - 优先级：主题词完全一致 > 标题完全一致 > 检索词完全一致 > 标题开头 > 检索词开头 > 标题包含 > 检索词包含 > 覆盖记录 > 简介包含。
 *    “主题词”是人工指定的术语→页面对应（src/data/search-terms.ts），比文章关键词里碰巧出现的词更可靠。
 *  - “覆盖记录”（c）只给机场条目使用：公开资料（来源等级 A–C）里有某个地区的节点、或某种线路类型的记录时，
 *    搜“新加坡”“IPLC”就能同时找到这些机场；只有 D 级（待核验）的记录不计入。命中时结果会注明是哪条记录、最高来源等级，
 *    避免读者把“公开资料里有记录”误读成“已实测可用”。
 */

export type SearchKind = 'brand' | 'region' | 'route' | 'article' | 'guide' | 'page';

export interface SearchEntry {
  /** 类型 */
  k: SearchKind;
  /** 标题 */
  t: string;
  /** 站内链接 */
  u: string;
  /** 一句话简介 */
  d: string;
  /** 额外检索词：简称、英文名、别名、关键词 */
  s: string[];
  /** 主题词：人工指定“这个词应该直接带到这个页面”，命中时优先于普通检索词 */
  p?: string[];
  /** 覆盖记录（仅机场条目）：[显示名, 最高来源等级 A/B/C, ...匹配词] */
  c?: CoverTuple[];
}

export type CoverTuple = [label: string, grade: string, ...keys: string[]];

export const KIND_LABEL: Record<SearchKind, string> = {
  brand: '机场',
  region: '节点地区',
  route: '线路术语',
  article: '研究文章',
  guide: '客户端教程',
  page: '栏目页面',
};

/** 结果分组显示的顺序 */
export const KIND_ORDER: readonly SearchKind[] = ['brand', 'region', 'route', 'article', 'guide', 'page'];

/** 同分时的类型偏好：先机场、地区，再线路、文章、教程 */
const KIND_BONUS: Record<SearchKind, number> = { brand: 8, region: 7, route: 6, article: 4, guide: 3, page: 2 };

const STRIP = /[\s　·・•_\-–—()（）[\]【】《》“”"'‘’,，.。:：;；!！?？/\\|+&]+/g;

export const normalize = (s: string): string => s.toLowerCase().replace(STRIP, '');

/** 把查询拆成需要同时命中的词（按空白分词，再逐个规范化） */
export const queryTokens = (q: string): string[] =>
  q
    .trim()
    .split(/[\s　]+/)
    .map(normalize)
    .filter(Boolean);

export interface CoverItem {
  label: string;
  grade: string;
  keys: string[];
}

export interface Prepared {
  entry: SearchEntry;
  order: number;
  title: string;
  keys: string[];
  primary: string[];
  cover: CoverItem[];
  desc: string;
}

export const prepare = (entries: readonly SearchEntry[]): Prepared[] =>
  entries.map((entry, order) => ({
    entry,
    order,
    title: normalize(entry.t),
    keys: entry.s.map(normalize).filter(Boolean),
    primary: (entry.p ?? []).map(normalize).filter(Boolean),
    cover: (entry.c ?? []).map(([label, grade, ...keys]) => ({ label, grade, keys: keys.map(normalize).filter(Boolean) })),
    desc: normalize(entry.d),
  }));

/** 1–2 位纯英文/数字：只做完全一致和词头匹配 */
const isWeak = (tok: string): boolean => /^[a-z0-9]{1,2}$/.test(tok);

interface TokenScore {
  score: number;
  /** 这个词是靠“覆盖记录”命中的 */
  cover?: CoverItem;
}
const NO_MATCH: TokenScore = { score: 0 };

function scoreToken(p: Prepared, tok: string): TokenScore {
  if (p.primary.includes(tok)) return { score: 130 };
  if (p.title === tok) return { score: 120 };
  if (p.keys.includes(tok)) return { score: 100 };
  if (p.title.startsWith(tok)) return { score: 80 };
  if (p.keys.some((k) => k.startsWith(tok)) || p.primary.some((k) => k.startsWith(tok))) return { score: 70 };
  // 覆盖记录完全一致：1–2 位的缩写（hk、jp、us）也允许，因为它们是人工登记的地区代码
  const exactCover = p.cover.find((c) => c.keys.includes(tok));
  if (isWeak(tok)) return exactCover ? { score: 48, cover: exactCover } : NO_MATCH;
  if (p.title.includes(tok)) return { score: 60 };
  if (p.keys.some((k) => k.includes(tok)) || p.primary.some((k) => k.includes(tok))) return { score: 50 };
  if (exactCover) return { score: 48, cover: exactCover };
  const startCover = p.cover.find((c) => c.keys.some((k) => k.startsWith(tok)));
  if (startCover) return { score: 42, cover: startCover };
  const inCover = p.cover.find((c) => c.keys.some((k) => k.includes(tok)));
  if (inCover) return { score: 38, cover: inCover };
  if (p.desc.includes(tok)) return { score: 20 };
  return NO_MATCH;
}

function scoreAll(p: Prepared, tokens: readonly string[]): { total: number; via: CoverItem[] } {
  let total = 0;
  const via: CoverItem[] = [];
  for (const t of tokens) {
    const s = scoreToken(p, t);
    if (s.score === 0) return { total: 0, via: [] };
    total += s.score;
    if (s.cover && !via.includes(s.cover)) via.push(s.cover);
  }
  return { total, via };
}

export interface Hit {
  entry: SearchEntry;
  score: number;
  /** 这条结果是因为哪些“覆盖记录”命中的（只有机场条目会有） */
  via?: { label: string; grade: string }[];
}

/** 搜索：所有词都命中才算命中；按得分、类型偏好、原始顺序排序 */
export function runSearch(data: readonly Prepared[], query: string, limit = Infinity): Hit[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const joined = tokens.length > 1 ? [tokens.join('')] : null;
  const hits: (Hit & { order: number })[] = [];
  for (const p of data) {
    const each = scoreAll(p, tokens);
    // 连起来的写法命中时略微加分：它说明用户很可能就是这个意思
    const phrase = joined ? scoreAll(p, joined) : { total: 0, via: [] as CoverItem[] };
    const usePhrase = phrase.total > 0 && phrase.total + 10 > each.total;
    const best = usePhrase ? { total: phrase.total + 10, via: phrase.via } : each;
    if (best.total > 0) {
      const hit: Hit & { order: number } = { entry: p.entry, score: best.total + KIND_BONUS[p.entry.k], order: p.order };
      if (best.via.length) hit.via = best.via.map(({ label, grade }) => ({ label, grade }));
      hits.push(hit);
    }
  }
  hits.sort((a, b) => b.score - a.score || a.order - b.order);
  return (Number.isFinite(limit) ? hits.slice(0, limit) : hits).map(({ order: _order, ...hit }) => hit);
}

/** 按类型分组：最高分更高的组排在前面（搜“新加坡”时地区页在前、机场在后；搜“灵动”时机场在前）；同分按 KIND_ORDER；组内保持得分顺序 */
export function groupHits(hits: readonly Hit[]): { kind: SearchKind; hits: Hit[] }[] {
  const out: { kind: SearchKind; hits: Hit[]; best: number }[] = [];
  for (const kind of KIND_ORDER) {
    const g = hits.filter((h) => h.entry.k === kind);
    if (g.length) out.push({ kind, hits: g, best: Math.max(...g.map((h) => h.score)) });
  }
  out.sort((a, b) => b.best - a.best || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  return out.map(({ kind, hits: h }) => ({ kind, hits: h }));
}

/** 结果行的简介：因“覆盖记录”命中的机场，注明是哪条记录和最高来源等级 */
export function hitDescription(h: Hit): string {
  if (!h.via || h.via.length === 0) return h.entry.d;
  const note = h.via.map((v) => `提供${v.label}`).join('、');
  return `${h.entry.d}｜${note}`;
}
