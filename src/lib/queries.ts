/**
 * 页面用的查询与汇总。所有数字都由数据层实时计算，页面不得写死。
 */
import { BRANDS } from '../data/brands';
import { MAP_POINTS, REGION_PAGES, coverageFor } from '../data/regions';
import type { Coverage } from '../data/regions';
import { getRouteType, ROUTE_TYPES } from '../data/routes';
import { AVAILABILITY_SNAPSHOTS, TEST_RECORDS } from '../data/test-records';
import type { AvailabilitySnapshot, Brand, EvidenceGrade, MapPoint, RegionClaim, RegionPage, RouteTypeId, TestRecord } from '../data/types';
import { bestGrade } from './format';

export interface RouteChip {
  id: RouteTypeId;
  label: string;
  grade: EvidenceGrade;
  /** 已有 C 级及以上来源且没有来源冲突 */
  confirmed: boolean;
}

export interface RegionBrandRow {
  brand: Brand;
  level: Exclude<Coverage, 'none'>;
  bestGrade: EvidenceGrade;
  claims: RegionClaim[];
  /** 来源中有明确节点数时的最大值；null = 未公布 */
  nodeCount: number | null;
  nodeCountGrade: EvidenceGrade | null;
  nodeNames: string[];
  routeChips: RouteChip[];
}

export interface RegionSummary {
  point: MapPoint;
  page: RegionPage;
  documented: RegionBrandRow[];
  unverified: RegionBrandRow[];
  none: Brand[];
  /** 公开资料有记录的品牌里，线路类型已有来源的统计（品牌级字段，不是地区级） */
  routeCounts: { id: RouteTypeId; label: string; confirmed: number; pending: number }[];
  siteRecords: TestRecord[];
  thirdPartyRecords: TestRecord[];
  snapshots: { snapshot: AvailabilitySnapshot; online: number; total: number }[];
}

export function routeChipsOf(brand: Brand): RouteChip[] {
  const c = brand.routeTypes;
  if (!c.value) return [];
  const confirmed = c.grade !== 'D' && !c.conflict;
  return c.value.map((id) => ({ id, label: getRouteType(id).name, grade: c.grade, confirmed }));
}

function rowFor(brand: Brand, code: string): RegionBrandRow | null {
  const cov = coverageFor(brand, code);
  if (cov.level === 'none') return null;
  const counts = cov.claims.filter((c) => c.nodeCount !== null);
  const top = counts.sort((a, b) => (b.nodeCount ?? 0) - (a.nodeCount ?? 0))[0];
  return {
    brand,
    level: cov.level,
    bestGrade: bestGrade(cov.claims.map((c) => c.grade)),
    claims: cov.claims,
    nodeCount: top?.nodeCount ?? null,
    nodeCountGrade: top?.grade ?? null,
    nodeNames: [...new Set(cov.claims.flatMap((c) => c.nodeNames ?? []))],
    routeChips: routeChipsOf(brand),
  };
}

const cache = new Map<string, RegionSummary>();

export function summarizeRegion(code: string): RegionSummary {
  const hit = cache.get(code);
  if (hit) return hit;
  const point = MAP_POINTS.find((p) => p.countryCode === code);
  if (!point) throw new Error(`queries: 未知地区代码 ${code}`);
  const page = REGION_PAGES.find((r) => r.slug === point.regionSlug)!;

  const documented: RegionBrandRow[] = [];
  const unverified: RegionBrandRow[] = [];
  const none: Brand[] = [];
  for (const b of BRANDS) {
    const row = rowFor(b, code);
    if (!row) none.push(b);
    else if (row.level === 'documented') documented.push(row);
    else unverified.push(row);
  }

  const routeCounts = ROUTE_TYPES.map((rt) => {
    let confirmed = 0;
    let pending = 0;
    for (const r of documented) {
      const chip = r.routeChips.find((c) => c.id === rt.id);
      if (!chip) continue;
      if (chip.confirmed) confirmed++;
      else pending++;
    }
    return { id: rt.id, label: rt.name, confirmed, pending };
  }).filter((r) => r.confirmed + r.pending > 0);

  const records = TEST_RECORDS.filter((r) => r.nodeRegion === code);
  const snapshots = AVAILABILITY_SNAPSHOTS.flatMap((s) => {
    const reg = s.byRegion.find((r) => r.countryCode === code);
    return reg ? [{ snapshot: s, online: reg.online, total: reg.total }] : [];
  });

  const summary: RegionSummary = {
    point,
    page,
    documented,
    unverified,
    none,
    routeCounts,
    siteRecords: records.filter((r) => r.sourceType === 'A' || r.sourceType === 'B'),
    thirdPartyRecords: records.filter((r) => r.sourceType === 'C' || r.sourceType === 'D'),
    snapshots,
  };
  cache.set(code, summary);
  return summary;
}

/** 地图点位的整体状态：任何品牌有 C 级以上记录 = documented；只有 D = unverified */
export function pointLevel(code: string): Exclude<Coverage, 'none'> | 'none' {
  const s = summarizeRegion(code);
  if (s.documented.length > 0) return 'documented';
  if (s.unverified.length > 0) return 'unverified';
  return 'none';
}

export const ALL_REGION_SUMMARIES = (): RegionSummary[] => MAP_POINTS.map((p) => summarizeRegion(p.countryCode));

/** 某个地区专题页包含的全部地区代码汇总（欧洲页含 DE/GB/FR） */
export function summarizeRegionPage(slug: string): { page: RegionPage; parts: RegionSummary[] } {
  const page = REGION_PAGES.find((r) => r.slug === slug);
  if (!page) throw new Error(`queries: 未知地区页 ${slug}`);
  return { page, parts: page.countryCodes.map(summarizeRegion) };
}

/** 页面级总体统计（首页、目录、套餐页复用） */
export function datasetStats() {
  const offers = BRANDS.reduce((n, b) => n + b.plans.reduce((m, p) => m + p.offers.length, 0), 0);
  const byStatus = new Map<string, number>();
  for (const b of BRANDS) byStatus.set(b.verificationStatus, (byStatus.get(b.verificationStatus) ?? 0) + 1);
  return {
    brands: BRANDS.length,
    plans: BRANDS.reduce((n, b) => n + b.plans.length, 0),
    offers,
    byStatus,
    conflicts: BRANDS.reduce((n, b) => n + b.conflictCount, 0),
    withSiteTests: BRANDS.filter((b) => b.siteTest.hasRecords).length,
    withThirdParty: new Set(TEST_RECORDS.filter((r) => r.sourceType === 'C' || r.sourceType === 'D').map((r) => r.brandId)).size,
    regionsDocumented: MAP_POINTS.filter((p) => pointLevel(p.countryCode) === 'documented').length,
  };
}
