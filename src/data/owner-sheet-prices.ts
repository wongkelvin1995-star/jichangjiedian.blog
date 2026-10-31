/**
 * 站长 Excel（Google 表格《最低价格以及机场优势》，2026-10-28 读取）里每家的“最低价格”套餐。
 *
 * 站长 2026-10-28 指示：最低价以 Excel 为准。处理规则：
 *  1. Excel 的套餐在站内有同名套餐 -> 把该套餐的月付报价改成 Excel 的价格与流量，来源改为站长 Excel，
 *     并在说明里保留原来页面存档的数字；
 *  2. 站内没有这个套餐 -> 新增一个套餐（来源：站长 Excel）；
 *  3. 同一家其他“月付”报价比 Excel 最低价还便宜 -> 很可能已经下架或调价，改标为“资料冲突”，不参与排序。
 *  4. Excel 与站内一致 -> 不改数字，只在说明里注明“站长 Excel 一致”；如果原来只有汇编资料或标为冲突，改以 Excel 为来源。
 */
import type { BrandSeed, Plan, PlanOffer, RegionClaim, RouteTypeId } from './types';

export const OWNER_SHEET = 'owner-sheet';
export const OWNER_SHEET_READ_AT = '2026-10-28';

interface SheetLowest {
  /** Excel 原文的套餐名称 */
  name: string;
  price: number;
  monthlyGB: number;
  /** 站内对应套餐的 planId 后缀；没有对应套餐时留空，会新增套餐 */
  planKey?: string;
}

export const SHEET_LOWEST: Readonly<Record<string, SheetLowest>> = {
  lingdongyun: { name: '灵动 · 拂风', price: 20, monthlyGB: 100, planKey: 'fufeng' },
  muguangjiasu: { name: '暮光 · 基础版', price: 20, monthlyGB: 120, planKey: 'basic' },
  breezenet: { name: '乘风 (Riding)', price: 25, monthlyGB: 200, planKey: 'chengfeng' },
  feimaoyun: { name: '飞猫 · 星耀版', price: 25, monthlyGB: 150 },
  dalaoyun: { name: '初云 · 福利版', price: 19.99, monthlyGB: 120, planKey: 'chuyun-fuli' },
  yinxingren: { name: '隐形人 白银纪元', price: 24, monthlyGB: 144, planKey: 'baiyin' },
  laddercloud: { name: '初阶网络 · 基础视界', price: 25, monthlyGB: 125 },
  flyv: { name: 'FlyV 会员 - 入门方案', price: 25, monthlyGB: 150 },
  wavenet: { name: '浪网 入门', price: 30, monthlyGB: 150 },
  firefly: { name: 'Firefly Lite', price: 25, monthlyGB: 150 },
  wuyou: { name: '舒心链接', price: 19, monthlyGB: 100 },
  quanqiuyun: { name: 'BGP 智能优化 · 入门方案', price: 20, monthlyGB: 120 },
  weituyun: { name: '唯兔云 · 普通版', price: 19.9, monthlyGB: 150 },
  lingmao: { name: '灵猫·月付Small', price: 25, monthlyGB: 150 },
  sogoyun: { name: '基础版', price: 25, monthlyGB: 150 },
  kuajie: { name: '轻云 Lite', price: 20, monthlyGB: 120 },
  xingdaomeng: { name: '星岛梦 · 超量150G', price: 25, monthlyGB: 150 },
  guangsuyun: { name: '光速云 · 极速版', price: 25, monthlyGB: 168, planKey: 'speed' },
  u1s1: { name: 'u1s1 · 普通人真够了包', price: 20, monthlyGB: 120 },
  jilianyun: { name: '极连云 · 基础套餐', price: 18, monthlyGB: 100, planKey: 'l1' },
  guangnianti: { name: '光年梯 入门版', price: 18, monthlyGB: 110 },
  yuzhouyun: { name: '行星基础版（Basic Plan）', price: 25, monthlyGB: 160, planKey: 'planet' },
  ermaoyun: { name: '二猫云 · 白猫套餐', price: 20, monthlyGB: 130 },
  yifanyun: { name: '轻享版', price: 20, monthlyGB: 150 },
  edgenova: { name: '极界·标准套餐', price: 22, monthlyGB: 120, planKey: 'standard' },
  kexinyun: { name: '可信云月付小包', price: 15, monthlyGB: 60 },
  sujie: { name: '单月试用', price: 15, monthlyGB: 50 },
  kuaili: { name: '月狸月付小套餐', price: 15, monthlyGB: 50 },
  flashleap: { name: '闪动 (Flicker)', price: 24, monthlyGB: 150 },
  liulianyun: { name: '轻享包', price: 24, monthlyGB: 140 },
  shandianyun: { name: '闪电鼠 · 性价版', price: 19.9, monthlyGB: 100 },
  huanqiuyun: { name: '环球微享', price: 12, monthlyGB: 70 },
  shenxingyun: { name: '神行·尝鲜包', price: 23, monthlyGB: 150, planKey: 'trial' },
  yunjieyun: { name: '轻云 · 基础版', price: 22, monthlyGB: 150, planKey: 'light' },
};

const same = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 0.005;
const fmt = (o: PlanOffer) => `¥${o.priceCNY ?? '—'}${o.monthlyTrafficGB ? ` / 每月 ${o.monthlyTrafficGB}GB` : ''}`;

/** 找出与 Excel 套餐对应的月付报价：先按 planKey，再按“价格与流量都一致” */
function findMatch(seed: BrandSeed, s: SheetLowest): { plan: Plan; offer: PlanOffer } | null {
  for (const plan of seed.plans) {
    const byKey = s.planKey && plan.planId === `${seed.slug}-${s.planKey}`;
    for (const offer of plan.offers) {
      if (offer.billingPeriod !== 'monthly') continue;
      if (byKey || (same(offer.priceCNY, s.price) && offer.monthlyTrafficGB === s.monthlyGB)) return { plan, offer };
    }
  }
  return null;
}

/** 按站长 Excel 修正最低价套餐。返回新的 seed，不修改原对象。 */
export function applyOwnerSheet(seed: BrandSeed): BrandSeed {
  const s = SHEET_LOWEST[seed.slug];
  if (!s) return seed;
  const tag = `站长 Excel（${OWNER_SHEET_READ_AT} 读取）`;
  const plans: Plan[] = seed.plans.map((p) => ({ ...p, offers: p.offers.map((o) => ({ ...o })) }));
  const draft: BrandSeed = { ...seed, plans };
  const hit = findMatch(draft, s);
  let excelOfferId: string;

  if (hit) {
    const o = hit.offer;
    excelOfferId = o.offerId;
    if (same(o.priceCNY, s.price) && o.monthlyTrafficGB === s.monthlyGB) {
      if (o.status !== 'sourced') {
        // 原来只有汇编资料或互相冲突的来源，Excel 给出了同样的数字 -> 以 Excel 为来源
        o.priceSource = { sourceId: OWNER_SHEET, grade: 'C' };
        o.status = 'sourced';
        o.note = `${tag}记录的最低价套餐与此一致，按 Excel 采用。${o.note ? `此前的说明：${o.note}` : ''}`;
      } else {
        o.note = [o.note, `${tag}记录的最低价套餐与此一致。`].filter(Boolean).join(' ');
      }
    } else {
      const before = fmt(o);
      o.priceCNY = s.price;
      o.monthlyTrafficGB = s.monthlyGB;
      o.totalTrafficGB = null;
      o.priceSource = { sourceId: OWNER_SHEET, grade: 'C' };
      o.sourceRecordedAt = null;
      o.status = 'sourced';
      o.note = `价格与流量按${tag}：${s.name} ¥${s.price} / 每月 ${s.monthlyGB}GB。原来的资料是 ${before}。`;
    }
  } else {
    const key = 'owner-lowest';
    excelOfferId = `${seed.slug}-${key}-monthly`;
    plans.unshift({
      planId: `${seed.slug}-${key}`,
      brandId: seed.slug,
      name: s.name,
      category: 'monthly-tier',
      offers: [
        {
          offerId: excelOfferId,
          billingPeriod: 'monthly',
          priceCNY: s.price,
          monthlyTrafficGB: s.monthlyGB,
          totalTrafficGB: null,
          trafficResetRule: null,
          priceSource: { sourceId: OWNER_SHEET, grade: 'C' },
          sourceRecordedAt: null,
          lastVerifiedAt: null,
          status: 'sourced',
          note: `${tag}记录的最低价套餐；原来的页面存档里没有这个套餐。`,
        },
      ],
    });
  }

  // 比 Excel 最低价还便宜的其他月付报价：多半已下架或调价
  for (const p of plans) {
    for (const o of p.offers) {
      if (o.offerId === excelOfferId || o.billingPeriod !== 'monthly' || o.priceCNY === null) continue;
      if (o.priceCNY < s.price - 0.005 && o.status !== 'consult') {
        o.status = 'conflict';
        o.priceSource = { ...o.priceSource, grade: 'D' };
        o.note = [o.note, `比${tag}记录的最低价 ¥${s.price} 还低，可能已下架或调价，待核对，不参与排序。`].filter(Boolean).join(' ');
      }
    }
  }
  return { ...draft, sourceIds: [...new Set([...seed.sourceIds, OWNER_SHEET])] };
}


/**
 * 站长 Excel 的“节点”栏（2026-10-28 读取）。
 *  - 有各地区数量的 10 家：按地区写入节点数（C 级，来源：站长 Excel）；
 *  - 只写“50+ 节点”和地区名的：站内没有节点总数时补上“不少于 50”，地区名补进去；
 *  - 9 家的节点栏是同一段示例文字（“香港01，香港02……等等++”），不是真实清单，不使用。
 * 地图只有香港、台湾、日本、新加坡、美国、韩国、德国、英国、法国这几个地区点，其余国家合并到“其他地区”。
 */
type NodeRow = [code: string, label: string, count: number | null];
interface SheetNodes { rows: NodeRow[]; other?: string; total50?: boolean }
const T5: NodeRow[] = [['HK', '香港', 20], ['TW', '台湾', 5], ['JP', '日本', 10], ['SG', '新加坡', 10], ['US', '美国', 10]];
const T10: NodeRow[] = [['HK', '香港', 20], ['TW', '台湾', 10], ['JP', '日本', 10], ['SG', '新加坡', 10], ['US', '美国', 10]];
const FIVE: NodeRow[] = [['HK', '香港', null], ['TW', '台湾', null], ['JP', '日本', null], ['SG', '新加坡', null], ['US', '美国', null]];
const SOGO_LIKE: SheetNodes = { rows: [...T5, ['GB', '英国', null], ['FR', '法国', null], ['DE', '德国', null]], other: '马来西亚×2、土耳其、泰国、巴西等' };
const EDGE_LIKE: SheetNodes = { rows: [...T10, ['KR', '韩国', 3], ['GB', '英国', null], ['FR', '法国', null], ['DE', '德国', null]], other: '马来西亚、越南、菲律宾、泰国、印度、阿根廷等' };

export const SHEET_NODES: Readonly<Record<string, SheetNodes>> = {
  weituyun: { rows: [...T10, ['GB', '英国', 1], ['DE', '德国', 1], ['FR', '法国', 1]], other: '马来西亚×2、泰国×1、菲律宾×1、印度×1；其他地区可找客服加' },
  sogoyun: SOGO_LIKE,
  xingdaomeng: SOGO_LIKE,
  guangsuyun: SOGO_LIKE,
  kuaili: SOGO_LIKE,
  yuzhouyun: { rows: T5 },
  ermaoyun: { rows: T5 },
  jilianyun: { rows: [...T10, ['DE', '德国', 1], ['FR', '法国', 1], ['GB', '英国', 1], ['KR', '韩国', null]], other: '马来西亚、泰国×1、土耳其×1' },
  edgenova: EDGE_LIKE,
  sujie: EDGE_LIKE,
  firefly: { rows: FIVE, total50: true },
  wuyou: { rows: FIVE, total50: true },
  kuajie: { rows: FIVE, total50: true },
  u1s1: { rows: FIVE, total50: true },
  flashleap: { rows: FIVE, total50: true },
  liulianyun: { rows: FIVE, total50: true },
  shandianyun: { rows: FIVE, total50: true },
  huanqiuyun: { rows: FIVE, total50: true },
  shenxingyun: { rows: FIVE, total50: true },
  yunjieyun: { rows: FIVE, total50: true },
  dalaoyun: { rows: [...FIVE, ['KR', '韩国', null]] },
  lingmao: { rows: FIVE },
  guangnianti: { rows: FIVE, other: '马来西亚' },
  yifanyun: { rows: FIVE },
  kexinyun: { rows: FIVE },
};

export function applyOwnerNodes(seed: BrandSeed): BrandSeed {
  const n = SHEET_NODES[seed.slug];
  if (!n) return seed;
  const tag = `站长 Excel（${OWNER_SHEET_READ_AT} 读取）`;
  const regions: RegionClaim[] = seed.regions.map((r) => ({ ...r }));
  for (const [code, label, count] of n.rows) {
    const ex = regions.find((r) => r.countryCode === code);
    if (!ex) {
      regions.push({ countryCode: code, label, nodeCount: count, grade: 'C', sourceIds: [OWNER_SHEET], note: `${tag}${count !== null ? `写${label}×${count}` : '列出此地区，没写数量'}` });
    } else if (count !== null && (ex.nodeCount === null || ex.grade === 'D')) {
      ex.nodeCount = count;
      if (ex.grade === 'D') ex.grade = 'C';
      ex.sourceIds = [...new Set([...ex.sourceIds, OWNER_SHEET])];
      ex.note = [ex.note && ex.note !== '同上' ? ex.note : null, `${tag}写${label}×${count}`].filter(Boolean).join('；');
    } else if (ex.grade === 'D') {
      ex.grade = 'C';
      ex.sourceIds = [...new Set([...ex.sourceIds, OWNER_SHEET])];
      ex.note = `${tag}列出此地区（此前只有待核验线索）`;
    }
  }
  if (n.other) {
    const o = regions.find((r) => r.countryCode === 'OTHER');
    if (o) o.note = [o.note, `${tag}另列：${n.other}`].filter(Boolean).join('；');
    else regions.push({ countryCode: 'OTHER', label: n.other.replace(/×\d+/g, '').replace(/；.*$/, ''), nodeCount: null, grade: 'C', sourceIds: [OWNER_SHEET], note: `${tag}：${n.other}` });
  }
  const numbered = n.rows.reduce((sum, [, , c]) => sum + (c ?? 0), 0);
  let nodeCount = seed.nodeCount;
  const weak = nodeCount.value === null || nodeCount.grade === 'D' || /下限|不少于/.test(nodeCount.note ?? '');
  if (numbered > 0) {
    const text = `${tag}各地区标了数量的合计 ${numbered} 个（${n.rows.filter((r) => r[2] !== null).map((r) => `${r[1]}${r[2]}`).join('、')}）${n.rows.some((r) => r[2] === null) || n.other ? '，其余地区没写数量' : ''}。`;
    nodeCount = weak
      ? { value: numbered, grade: 'C', sourceIds: [OWNER_SHEET], note: text }
      : { ...nodeCount, note: [nodeCount.note, text].filter(Boolean).join(' ') };
  } else if (n.total50 && nodeCount.value === null) {
    nodeCount = { value: 50, grade: 'C', sourceIds: [OWNER_SHEET], note: `${tag}写“50+ 节点”，是不少于 50 的下限说法，没有分地区数量。` };
  }
  return { ...seed, regions, nodeCount, sourceIds: [...new Set([...seed.sourceIds, OWNER_SHEET])] };
}

/**
 * 站长 2026-10-29 确认的全站节点数。50 表示“全站不少于 50 个”（下限说法）。
 * 放在流水线最后，覆盖之前按地区相加或第三方资料得出的节点数。
 */
export const OWNER_NODE_TOTALS: Readonly<Record<string, { value: number; atLeast: boolean }>> = {
  lingdongyun: { value: 60, atLeast: false },
  muguangjiasu: { value: 55, atLeast: false },
  feimaoyun: { value: 57, atLeast: false },
  ...Object.fromEntries(
    ['breezenet', 'yinxingren', 'wavenet', 'lingmao', 'laddercloud', 'flyv', 'xingdaomeng', 'guangsuyun', 'weituyun', 'jilianyun', 'guangnianti', 'yuzhouyun', 'ermaoyun', 'yifanyun', 'edgenova', 'sujie', 'kuaili'].map((s) => [s, { value: 50, atLeast: true }]),
  ),
};

export function applyOwnerNodeTotals(seed: BrandSeed): BrandSeed {
  const t = OWNER_NODE_TOTALS[seed.slug];
  if (!t) return seed;
  // 灵动云：2026-10-31 的后台节点面板逐行数出 60 个节点，比 10-29 的口头确认（57）更新，以面板为准。
  if (seed.slug === 'lingdongyun') {
    return {
      ...seed,
      nodeCount: {
        value: t.value,
        grade: 'B',
        sourceIds: ['owner-2026-10-31-ldy-panel', 'owner-2026-10-28'],
        recordedAt: '2026-10-31',
        note: `站长 2026-10-31 的后台节点面板逐行共 ${t.value} 个节点（香港 20、台湾 10、日本 10、新加坡 10、美国 10，全部在线、倍率 1x）；站长 2026-10-29 曾确认 57 个，2026-10-21 的截图也是 57 个，以较新的面板为准。`,
      },
      sourceIds: [...new Set([...seed.sourceIds, 'owner-2026-10-31-ldy-panel', 'owner-2026-10-28'])],
    };
  }
  const note = t.atLeast ? '站长 2026-10-29 确认：全站不少于 50 个节点。' : `站长 2026-10-29 确认：全站共 ${t.value} 个节点。`;
  return {
    ...seed,
    nodeCount: { value: t.value, grade: 'C', sourceIds: ['owner-2026-10-28'], recordedAt: '2026-10-29', note },
    sourceIds: [...new Set([...seed.sourceIds, 'owner-2026-10-28'])],
  };
}

/** 站长 2026-10-29 确认的线路（覆盖之前的资料）。 */
export const OWNER_ROUTES: Readonly<Record<string, RouteTypeId[]>> = {
  ermaoyun: ['iplc', 'iepl'],
  shenxingyun: ['iplc'],
};

export function applyOwnerRoutes(seed: BrandSeed): BrandSeed {
  const r = OWNER_ROUTES[seed.slug];
  if (!r) return seed;
  return {
    ...seed,
    routeTypes: { value: r, grade: 'C', sourceIds: ['owner-2026-10-28'], recordedAt: '2026-10-29', note: '站长 2026-10-29 确认的线路。' },
    sourceIds: [...new Set([...seed.sourceIds, 'owner-2026-10-28'])],
  };
}
