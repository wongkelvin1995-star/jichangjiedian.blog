/**
 * 便宜机场与性价比机场的排序规则（/plans/cheapest/ 和首页共用，保证两处数字一致）。
 * 只用 OFFER_ROWS 里“可精确比较”的报价；冲突、待核验、咨询报价不参与。只比价格，不是质量排名。
 */
import { OFFER_ROWS } from '../data/plan-calc';
import type { OfferRow } from '../data/plan-calc';

const exactRows = (): OfferRow[] => OFFER_ROWS.filter((r) => r.comparability === 'exact');

/** 每家只取一条：月付最低的一档（同价取流量大的），按月付价格从低到高 */
export function lowestMonthlyByBrand(): OfferRow[] {
  const best = new Map<string, OfferRow>();
  for (const r of exactRows()) {
    if (r.period !== 'monthly' || r.priceCNY === null) continue;
    const cur = best.get(r.brandSlug);
    if (!cur || r.priceCNY < cur.priceCNY! || (r.priceCNY === cur.priceCNY && (r.monthlyGB ?? 0) > (cur.monthlyGB ?? 0))) best.set(r.brandSlug, r);
  }
  return [...best.values()].sort((a, z) => a.priceCNY! - z.priceCNY! || (z.monthlyGB ?? 0) - (a.monthlyGB ?? 0) || a.displayRank - z.displayRank);
}

/** 每家只取一条：任何付款周期里每 GB 成本最低的报价，按每 GB 成本从低到高 */
export function lowestPerGBByBrand(): OfferRow[] {
  const best = new Map<string, OfferRow>();
  for (const r of exactRows()) {
    if (r.perGBCNY === null) continue;
    const cur = best.get(r.brandSlug);
    if (!cur || r.perGBCNY < cur.perGBCNY!) best.set(r.brandSlug, r);
  }
  return [...best.values()].sort((a, z) => a.perGBCNY! - z.perGBCNY! || a.displayRank - z.displayRank);
}
