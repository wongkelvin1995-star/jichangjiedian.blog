/**
 * 34 家机场的横向统计：每家的最低价、每 GB 成本、最大月流量、地区数等在全部品牌里的相对位置。
 * 品牌页的“适合谁 / 不太适合谁 / 一句话概括”只根据这里算出的相对位置下判断，
 * 不再对每家都写同一套“有香港节点、有美国节点”的话。所有数字都由数据算出，不手写。
 */
import { BRANDS } from '../data/brands';
import { SHEET_LOWEST } from '../data/owner-sheet-prices';
import { BILLING_MONTHS } from '../data/types';
import type { BillingPeriod, Brand, Plan, PlanOffer } from '../data/types';

export interface LowestTier {
  name: string;
  price: number;
  gb: number;
  perGB: number;
  /** 最低价报价是否带来源日期（null = 资料没有日期） */
  dated: boolean;
}

export interface AnnualSmall {
  name: string;
  price: number;
  monthlyGB: number;
  perMonth: number;
  perGB: number;
}

export interface PackInfo {
  name: string;
  price: number;
  gb: number;
  perGB: number;
  rule: string | null;
}

export interface CustomInfo {
  name: string;
  price: number | null;
  gb: number | null;
  note: string | null;
}

export interface BrandFacts {
  slug: string;
  low: LowestTier | null;
  /** 月付档（不含定制）的档位数、价格区间、最大月流量 */
  tiers: { count: number; min: number; max: number } | null;
  biggest: { name: string; price: number; gb: number; perGB: number } | null;
  /** 月付档里每 GB 最便宜的一档（可能不是最低价档） */
  bestValue: { name: string; price: number; gb: number; perGB: number } | null;
  annual: AnnualSmall | null;
  packs: PackInfo[];
  custom: CustomInfo | null;
  student: string | null;
  /** 有来源的付款周期（月、季、半年、年、两年、三年） */
  periods: BillingPeriod[];
  regionCount: number;
  premium: boolean;
  deviceUnlimited: boolean;
  deviceLimited: boolean;
}

const round2 = (x: number) => Math.round(x * 100) / 100;
const sourced = (o: PlanOffer) => o.status === 'sourced' && o.priceCNY !== null;

export function brandFacts(b: Brand): BrandFacts {
  const monthly = b.plans.flatMap((p) =>
    p.category === 'custom'
      ? []
      : p.offers
          .filter((o) => o.billingPeriod === 'monthly' && sourced(o) && o.monthlyTrafficGB !== null)
          .map((o) => ({ plan: p, offer: o, name: p.name, price: o.priceCNY!, gb: o.monthlyTrafficGB! })),
  );
  const s = SHEET_LOWEST[b.slug];
  const lowHit = s ? monthly.find((m) => m.price === s.price && m.gb === s.monthlyGB) : undefined;
  const lowFallback = [...monthly].sort((a, z) => a.price - z.price)[0];
  const lowSrc = lowHit ?? (s ? null : lowFallback);
  const low: LowestTier | null = s
    ? { name: lowHit?.name ?? s.name, price: s.price, gb: s.monthlyGB, perGB: round2(s.price / s.monthlyGB), dated: lowHit?.offer.sourceRecordedAt !== null && lowHit !== undefined }
    : lowSrc
      ? { name: lowSrc.name, price: lowSrc.price, gb: lowSrc.gb, perGB: round2(lowSrc.price / lowSrc.gb), dated: lowSrc.offer.sourceRecordedAt !== null }
      : null;

  const names = new Set(monthly.map((m) => m.name));
  if (low) names.add(low.name);
  const prices = [...monthly.map((m) => m.price), ...(low ? [low.price] : [])];
  const tiers = prices.length ? { count: names.size, min: Math.min(...prices), max: Math.max(...prices) } : null;
  const big = [...monthly].sort((a, z) => z.gb - a.gb)[0];
  const biggest = big && (!low || big.gb > low.gb) ? { name: big.name, price: big.price, gb: big.gb, perGB: round2(big.price / big.gb) } : null;
  const bv = [...monthly].sort((a, z) => a.price / a.gb - z.price / z.gb)[0];
  const bestValue = bv ? { name: bv.name, price: bv.price, gb: bv.gb, perGB: round2(bv.price / bv.gb) } : null;

  const annualPlan = b.plans.find((p) => p.category === 'annual-small' && p.offers.some((o) => o.billingPeriod === 'annual' && sourced(o) && o.monthlyTrafficGB !== null));
  const ao = annualPlan?.offers.find((o) => o.billingPeriod === 'annual' && sourced(o));
  const annual: AnnualSmall | null = annualPlan && ao ? { name: annualPlan.name, price: ao.priceCNY!, monthlyGB: ao.monthlyTrafficGB!, perMonth: round2(ao.priceCNY! / 12), perGB: round2(ao.priceCNY! / (ao.monthlyTrafficGB! * 12)) } : null;

  const packs: PackInfo[] = b.plans
    .filter((p) => p.category === 'one-time-pack')
    .flatMap((p) =>
      p.offers
        .filter((o) => sourced(o) && o.totalTrafficGB !== null)
        .map((o) => ({ name: p.name, price: o.priceCNY!, gb: o.totalTrafficGB!, perGB: round2(o.priceCNY! / o.totalTrafficGB!), rule: o.trafficResetRule ?? o.note ?? null })),
    )
    .sort((a, z) => a.price - z.price);

  const customPlan: Plan | undefined = b.plans.find((p) => p.category === 'custom' && p.offers.some((o) => o.status === 'sourced'));
  const co = customPlan?.offers.find((o) => o.status === 'sourced');
  const custom: CustomInfo | null = customPlan && co ? { name: customPlan.name, price: co.priceCNY, gb: co.monthlyTrafficGB, note: co.note ?? customPlan.note ?? null } : null;

  const studentPlan = b.plans.find((p) => /学生|高校/.test(p.name) && p.offers.some(sourced));
  const periods = [...new Set(b.plans.filter((p) => p.category !== 'custom').flatMap((p) => p.offers.filter(sourced).map((o) => o.billingPeriod)))].filter((p) => BILLING_MONTHS[p] !== null);

  const routeIds = (b.routeTypes.value ?? []) as string[];
  const premium = b.routeTypes.grade !== 'D' && !b.routeTypes.conflict && routeIds.some((r) => r === 'iplc' || r === 'iepl');
  const dv = b.deviceLimit.grade !== 'D' ? b.deviceLimit.value : null;
  return {
    slug: b.slug,
    low,
    tiers,
    biggest,
    bestValue,
    annual,
    packs,
    custom,
    student: studentPlan?.name ?? null,
    periods,
    regionCount: b.regions.filter((r) => r.grade !== 'D').length,
    premium,
    deviceUnlimited: !!dv && /不限/.test(dv) && !/限 \d|限\d|\d 台|\d台/.test(dv),
    deviceLimited: !!dv && /限 \d|限\d|\d 台|\d台/.test(dv),
  };
}

export interface Rank {
  /** 1 = 最优（价格最低 / 流量最大 / 地区最多）；并列时取并列组的最好名次 */
  rank: number;
  of: number;
  tied: boolean;
  /** 前 1/3 */
  top: boolean;
  /** 后 1/3 */
  bottom: boolean;
}

export interface CrossStats {
  facts: Record<string, BrandFacts>;
  /** 34 家最低月付价格的中位数（由 SHEET_LOWEST 算出） */
  medianLowest: number;
  medianPerGB: number;
  medianBiggestGB: number;
  medianRegions: number;
  /** 各特征在 34 家中出现的次数，用来排“最有区分度”的理由 */
  traitCount: Record<string, number>;
  rankLowest: (slug: string) => Rank | null;
  rankPerGB: (slug: string) => Rank | null;
  rankBiggest: (slug: string) => Rank | null;
  rankRegions: (slug: string) => Rank | null;
}

const median = (xs: number[]): number => {
  const a = [...xs].sort((x, y) => x - y);
  if (!a.length) return 0;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2;
};

function ranker(values: { slug: string; v: number }[], asc: boolean): (slug: string) => Rank | null {
  const sorted = [...values].sort((a, b) => (asc ? a.v - b.v : b.v - a.v));
  const of = sorted.length;
  return (slug) => {
    const i = sorted.findIndex((x) => x.slug === slug);
    if (i < 0) return null;
    const v = sorted[i]!.v;
    const better = sorted.filter((x) => (asc ? x.v < v : x.v > v)).length;
    const tiedN = sorted.filter((x) => x.v === v).length;
    // 并列时按“并列组的中位名次”判断是否进入前/后 1/3，避免一大群同价的品牌都算“前 1/3”
    const mid = better + (tiedN + 1) / 2;
    return { rank: better + 1, of, tied: tiedN > 1, top: mid <= of / 3, bottom: mid > (of * 2) / 3 };
  };
}

let cache: CrossStats | null = null;

export function crossStats(): CrossStats {
  if (cache) return cache;
  const facts: Record<string, BrandFacts> = {};
  for (const b of BRANDS) facts[b.slug] = brandFacts(b);
  const all = Object.values(facts);
  const lows = all.filter((f) => f.low).map((f) => ({ slug: f.slug, v: f.low!.price }));
  const per = all.filter((f) => f.low).map((f) => ({ slug: f.slug, v: f.low!.perGB }));
  const bigs = all.map((f) => ({ slug: f.slug, v: Math.max(f.biggest?.gb ?? 0, f.low?.gb ?? 0) })).filter((x) => x.v > 0);
  const regs = all.map((f) => ({ slug: f.slug, v: f.regionCount })).filter((x) => x.v > 0);
  const traitCount: Record<string, number> = {};
  const bump = (k: string) => (traitCount[k] = (traitCount[k] ?? 0) + 1);
  const rl = ranker(lows, true);
  const rp = ranker(per, true);
  const rb = ranker(bigs, false);
  const rr = ranker(regs, false);
  for (const f of all) {
    if (rl(f.slug)?.top) bump('cheap');
    if (rp(f.slug)?.top) bump('perGB');
    if (rb(f.slug)?.top) bump('big');
    if (rr(f.slug)?.top) bump('regions');
    if (f.annual) bump('annual');
    if (f.packs.length) bump('pack');
    if (f.custom) bump('custom');
    if (f.student) bump('student');
    if (f.premium) bump('premium');
    if (f.deviceUnlimited) bump('device');
    if (f.periods.some((p) => p === 'biennial' || p === 'triennial')) bump('longCycle');
  }
  cache = {
    facts,
    medianLowest: median(Object.values(SHEET_LOWEST).map((s) => s.price)),
    medianPerGB: median(per.map((x) => x.v)),
    medianBiggestGB: median(bigs.map((x) => x.v)),
    medianRegions: median(regs.map((x) => x.v)),
    traitCount,
    rankLowest: rl,
    rankPerGB: rp,
    rankBiggest: rb,
    rankRegions: rr,
  };
  return cache;
}
