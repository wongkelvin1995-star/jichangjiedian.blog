/**
 * 套餐比较的计算层。
 *
 * 算法（页面上同时写明）：
 *  - 月均价 = 付款周期总价 ÷ 周期月数（一次性流量包、定制套餐没有周期，不计算）；
 *  - 周期内总流量：来源明确“每月重置”的额度 × 周期月数；来源明确是“总量/一次性”的额度直接取总量；
 *  - 每 GB 参考成本 = 付款周期总价 ÷ 周期内总流量；
 *  - 只有“有页面来源、无冲突、价格与流量都明确”的报价参与精确排序（exact）；
 *    品牌对应关系待核验的记录只在用户主动勾选时参与（flagged）；
 *    冲突、仅见于汇编资料、咨询报价、流量未知、演示站等一律不参与（excluded）并写明原因。
 *  - 本表只比较价格与流量，不是品牌质量排名；套餐与测速不共用排名。
 */
import { BRANDS } from './brands';
import { BILLING_MONTHS } from './types';
import type { BillingPeriod, Brand, EvidenceGrade, IdentityStatus, OfferStatus, PlanCategory, VerificationStatus } from './types';

export type Comparability = 'exact' | 'flagged' | 'excluded';

export interface OfferRow {
  offerId: string;
  brandSlug: string;
  brandName: string;
  shortName: string;
  displayRank: number;
  planId: string;
  planName: string;
  category: PlanCategory;
  period: BillingPeriod;
  months: number | null;
  priceCNY: number | null;
  monthlyEquivalentCNY: number | null;
  monthlyGB: number | null;
  totalGBInPeriod: number | null;
  /** 折合平均每月额度（总量 ÷ 月数）；monthlyGB 已知时等于 monthlyGB */
  monthlyGBApprox: number | null;
  perGBCNY: number | null;
  /** 每 GB 成本的算式，供页面直接展示 */
  perGBFormula: string | null;
  resetRule: string | null;
  status: OfferStatus;
  grade: EvidenceGrade;
  sourceId: string;
  /** 来源页面自带日期；没有则 null（页面显示“页面未标注日期”） */
  dataDate: string | null;
  identity: IdentityStatus;
  verification: VerificationStatus;
  comparability: Comparability;
  reasons: string[];
  note: string | null;
  /** 该品牌资料里有记录（A/B/C）的地区代码，用于地区筛选 */
  regionCodes: string[];
  routeTypes: string[];
  routeTypesConfirmed: boolean;
  clients: string[];
}

const round = (x: number, d: number) => {
  const k = 10 ** d;
  return Math.round(x * k) / k;
};
const fmtGB = (gb: number) => `${gb}GB`;

function buildRow(brand: Brand, planIdx: number, offerIdx: number): OfferRow {
  const plan = brand.plans[planIdx]!;
  const o = plan.offers[offerIdx]!;
  const months = BILLING_MONTHS[o.billingPeriod];
  const reasons: string[] = [];

  const monthlyEquivalentCNY = o.priceCNY !== null && months !== null ? round(o.priceCNY / months, 2) : null;

  let totalGBInPeriod: number | null = null;
  let monthlyGBApprox: number | null = null;
  let formulaTraffic: string | null = null;
  if (o.monthlyTrafficGB !== null && months !== null) {
    totalGBInPeriod = o.monthlyTrafficGB * months;
    monthlyGBApprox = o.monthlyTrafficGB;
    formulaTraffic = months === 1 ? fmtGB(o.monthlyTrafficGB) : `${fmtGB(o.monthlyTrafficGB)}/月 × ${months} 个月 = ${fmtGB(totalGBInPeriod)}`;
  } else if (o.totalTrafficGB !== null) {
    totalGBInPeriod = o.totalTrafficGB;
    monthlyGBApprox = months !== null ? round(o.totalTrafficGB / months, 1) : null;
    formulaTraffic = `总量 ${fmtGB(o.totalTrafficGB)}`;
  }

  const perGBCNY = o.priceCNY !== null && totalGBInPeriod !== null && totalGBInPeriod > 0 ? round(o.priceCNY / totalGBInPeriod, 3) : null;
  const perGBFormula =
    perGBCNY !== null && formulaTraffic !== null ? `¥${o.priceCNY} ÷ (${formulaTraffic}) ≈ ¥${perGBCNY}/GB` : null;

  // ---- 可比较性
  let comparability: Comparability = 'exact';
  if (o.status === 'conflict') reasons.push('来源之间不一致，不参与精确排序');
  if (o.status === 'compiled-only') reasons.push('仅见于汇编资料，待核验');
  if (o.status === 'consult') reasons.push(o.priceCNY === null ? '咨询报价，没有公开价格' : '咨询报价：页面注明需联系服务商确认，不作为确定价格');
  if (o.priceCNY === null) reasons.push('没有公开价格');
  if (o.monthlyTrafficGB === null && o.totalTrafficGB === null) reasons.push('流量未知');
  if (o.priceCNY !== null && perGBCNY === null && o.billingPeriod === 'custom') reasons.push('定制周期，无法折算每 GB');
  if (brand.identity.status === 'demo-site') reasons.push('资料来自静态演示站');
  if (brand.identity.status === 'name-collision') reasons.push('品牌归属待验证（资料指向同名主体）');
  if (brand.identity.status === 'data-incomplete') reasons.push('资料文件不完整');
  if (reasons.length > 0 || perGBCNY === null) {
    comparability = 'excluded';
    if (reasons.length === 0) reasons.push('价格或流量缺失');
  } else if (brand.identity.status === 'mapping-pending') {
    comparability = 'flagged';
    reasons.push('品牌对应关系待核验，仅在勾选“包含待核验品牌”时参与');
  }

  const regionCodes = [...new Set(brand.regions.filter((r) => r.grade !== 'D' && r.countryCode !== 'OTHER').map((r) => r.countryCode))];
  const rt = brand.routeTypes;
  return {
    offerId: o.offerId,
    brandSlug: brand.slug,
    brandName: brand.brandName,
    shortName: brand.shortName,
    displayRank: brand.displayRank,
    planId: plan.planId,
    planName: plan.name,
    category: plan.category,
    period: o.billingPeriod,
    months,
    priceCNY: o.priceCNY,
    monthlyEquivalentCNY,
    monthlyGB: o.monthlyTrafficGB,
    totalGBInPeriod,
    monthlyGBApprox,
    perGBCNY,
    perGBFormula,
    resetRule: o.trafficResetRule,
    status: o.status,
    grade: o.priceSource.grade,
    sourceId: o.priceSource.sourceId,
    dataDate: o.sourceRecordedAt,
    identity: brand.identity.status,
    verification: brand.verificationStatus,
    comparability,
    reasons,
    note: o.note ?? null,
    regionCodes,
    routeTypes: rt.value ?? [],
    routeTypesConfirmed: rt.value !== null && rt.grade !== 'D' && !rt.conflict,
    clients: brand.clients.value ?? [],
  };
}

/** 全部报价（按品牌固定顺序 → 套餐顺序 → 周期顺序），默认顺序不是排名 */
export const OFFER_ROWS: readonly OfferRow[] = BRANDS.flatMap((b) =>
  b.plans.flatMap((p, pi) => p.offers.map((_, oi) => buildRow(b, pi, oi))),
);

export const OFFER_STATS = {
  total: OFFER_ROWS.length,
  exact: OFFER_ROWS.filter((r) => r.comparability === 'exact').length,
  flagged: OFFER_ROWS.filter((r) => r.comparability === 'flagged').length,
  excluded: OFFER_ROWS.filter((r) => r.comparability === 'excluded').length,
} as const;

export const PLAN_METHOD_TEXT = [
  '月均价 = 付款周期总价 ÷ 周期月数；一次性流量包与定制套餐没有周期，不计算月均价。',
  '周期内总流量：来源明确“每月重置”的额度 × 周期月数；来源明确是“总量/一次性”的额度直接取总量。',
  '每 GB 参考成本 = 付款周期总价 ÷ 周期内总流量，只在价格与流量都明确、且没有来源冲突时给出。',
  '所有价格都是页面标价（未叠加优惠码）；各家优惠码见品牌页，折扣幅度与实付以服务商结算页为准。',
  '本表只比较价格与流量，不是品牌质量或速度排名；套餐比较与测速不共用排名。',
] as const;
