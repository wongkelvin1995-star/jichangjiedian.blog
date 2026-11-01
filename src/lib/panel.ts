/**
 * 节点面板快照（站长后台截图逐行转录）与品牌资料里“地区”字段的对照。
 *
 * 品牌资料的地区大多来自服务商说明；有面板快照的品牌（目前只有灵动云），
 * “多少个节点、在哪些地区”以最新一次面板为准，面板里没有、只在服务商说明里出现的地区单独列出并注明。
 * 这样就不会把“面板 60 个节点”和“服务商说明列了 10 个地区”混成一句“60 个节点、10 个地区”。
 */
import { snapshotsForBrand } from '../data/test-records';
import type { AvailabilitySnapshot, Brand } from '../data/types';

export interface PanelCoverage {
  snapshot: AvailabilitySnapshot;
  /** 2026-10-31 */
  date: string;
  /** 10 月 31 日 */
  dateText: string;
  regions: { code: string; label: string; total: number; online: number }[];
  /** 资料（服务商说明）里列出、但最新面板里没有的地区名，按资料顺序；“其他地区”一项拆成单个国家 */
  claimOnly: string[];
}

/** 品牌最新一次节点面板快照；没有快照返回 null */
export function latestPanel(brandId: string): AvailabilitySnapshot | null {
  return [...snapshotsForBrand(brandId)].sort((a, b) => b.checkedFrom.localeCompare(a.checkedFrom))[0] ?? null;
}

const dateTextOf = (iso: string): string => `${Number(iso.slice(5, 7))} 月 ${Number(iso.slice(8, 10))} 日`;

export function panelCoverage(b: Brand): PanelCoverage | null {
  const snap = latestPanel(b.slug);
  if (!snap) return null;
  const inPanel = new Set(snap.byRegion.map((r) => r.countryCode));
  const claimOnly = b.regions
    .filter((r) => r.grade !== 'D' && !inPanel.has(r.countryCode))
    .flatMap((r) => (r.countryCode === 'OTHER' ? r.label.split('、') : [r.label]));
  return {
    snapshot: snap,
    date: snap.checkedFrom.slice(0, 10),
    dateText: dateTextOf(snap.checkedFrom),
    regions: snap.byRegion.map((r) => ({ code: r.countryCode, label: r.label, total: r.total, online: r.online })),
    claimOnly,
  };
}

/** 这个品牌有面板快照、而最新面板里没有这个地区时，返回快照日期（YYYY-MM-DD）；否则 null */
export function panelGapDate(brandId: string, code: string): string | null {
  const snap = latestPanel(brandId);
  if (!snap || snap.byRegion.some((r) => r.countryCode === code)) return null;
  return snap.checkedFrom.slice(0, 10);
}

/** “韩国、德国、法国、英国等地区”：最多列 n 个，多出的用“等” */
export const listShort = (names: string[], n = 4): string => `${names.slice(0, n).join('、')}${names.length > n ? '等' : ''}`;
