/** 测试记录的展示辅助：保留原图单位、缺失值显示为“—”，绝不换算或补 0。 */
import { getBrand } from '../data/brands';
import { RECORD_KIND_LABEL } from '../data/labels';
import { countryName, getMapPoint } from '../data/regions';
import { AVAILABILITY_SNAPSHOTS, SITE_TEST_RECORDS, THIRD_PARTY_RECORDS } from '../data/test-records';
import { classifyWindow, describeOutside, windowLabel } from '../data/time-windows';
import type { AvailabilitySnapshot, Brand, EvidenceGrade, TestRecord, TimeWindowId } from '../data/types';
import { fmtDateTime } from './format';

/** 读取 extraMetrics 里的一项并按“原图写法”显示：数值 + 原标单位；null/缺失 = null */
export function metricText(r: TestRecord, key: string): string | null {
  const m = r.extraMetrics?.[key];
  if (!m || m.value === null || m.value === undefined) return null;
  const unit = m.unit ? m.unit.split('（')[0]! : '';
  if (typeof m.value === 'number') return unit === 'ms' ? `${m.value} ms` : `${m.value}${unit}`;
  return String(m.value);
}

export interface RecordGroup {
  key: string;
  /** 页面锚点：品牌 + 测试日期 + 类型，同组内唯一 */
  id: string;
  brand: Brand;
  kind: TestRecord['recordKind'];
  grade: TestRecord['sourceType'];
  dateText: string | null;
  isp: string | null;
  client: string | null;
  clientVersion: string | null;
  threads: number | null;
  method: string | null;
  caveats: string[];
  rows: TestRecord[];
}

/** 把同一品牌、同一次第三方测试的多行记录归并成一组（保持品牌编辑顺序） */
export function groupRecords(records: readonly TestRecord[]): RecordGroup[] {
  const map = new Map<string, RecordGroup>();
  for (const r of records) {
    const brand = getBrand(r.brandId);
    if (!brand) continue;
    const key = `${r.brandId}|${r.testDateText ?? '无日期'}|${r.recordKind}|${r.clientName ?? ''}`;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        id: '',
        brand,
        kind: r.recordKind,
        grade: r.sourceType,
        dateText: r.testDateText,
        isp: r.originISP,
        client: r.clientName,
        clientVersion: r.clientVersion,
        threads: r.sampleCount,
        method: r.testMethod,
        caveats: r.caveats,
        rows: [],
      };
      map.set(key, g);
    }
    g.rows.push(r);
  }
  const groups = [...map.values()].sort((a, b) => a.brand.displayRank - b.brand.displayRank);
  const used = new Set<string>();
  for (const g of groups) {
    const digits = /(\d{4})-(\d{2})-(\d{2})/.exec(g.dateText ?? '');
    const base = `${g.brand.slug}-${digits ? digits[1]! + digits[2]! + digits[3]! : 'nodate'}-${g.kind === 'third-party-unlock' ? 'unlock' : 'speed'}`;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    g.id = id;
  }
  return groups;
}

export type WindowKey = TimeWindowId | 'outside' | 'unknown';

/** 一条记录属于哪个预设窗口，以及页面上怎么说。没有日期的记录绝不归入任何窗口（页面自述的时段只作说明）。 */
export function windowOfRecord(r: TestRecord): { id: WindowKey; text: string } {
  const id = classifyWindow(r.testDateTime);
  if (id === 'unknown') {
    const claimed = r.claimedWindow ?? null;
    return { id, text: claimed ? `没有日期（页面自述：${windowLabel(claimed)}，不计入统计）` : '没有日期' };
  }
  if (id === 'outside') return { id, text: describeOutside(r.testDateTime) };
  return { id, text: windowLabel(id) };
}

/** “记录浏览器”里的一行：一次本站测试、一次节点在线快照，或一组其他测速参考 */
export interface BrowserRow {
  anchor: string;
  brandSlug: string;
  brandName: string;
  kindLabel: string;
  grade: EvidenceGrade;
  timeText: string;
  windowId: WindowKey;
  windowText: string;
  regionCodes: string[];
  regionText: string;
  countText: string;
  status: string;
  tone: 'pending' | 'third' | 'claim';
  /** 小写、去空格的检索串：品牌名/别名/英文名 + 节点名 + 地区中英文与代码 */
  search: string;
}

const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, '');
function searchOf(brand: Brand | undefined, codes: string[], nodeNames: string[]): string {
  const regionWords = codes.flatMap((c) => [countryName(c), getMapPoint(c)?.nameEn ?? '', c]);
  return norm([brand?.brandName ?? '', brand?.shortName ?? '', brand?.nameEn ?? '', ...(brand?.aliases ?? []), ...nodeNames, ...regionWords].join(' '));
}

const regionLine = (codes: string[]): string => codes.map((c) => countryName(c)).join('、');

export function snapshotRow(s: AvailabilitySnapshot): BrowserRow {
  const brand = getBrand(s.brandId);
  const id = classifyWindow(s.checkedFrom);
  const codes = s.byRegion.map((r) => r.countryCode);
  return {
    anchor: s.snapshotId,
    brandSlug: s.brandId,
    brandName: brand?.shortName ?? s.brandId,
    kindLabel: '节点在线快照',
    grade: s.sourceType,
    timeText: fmtDateTime(s.checkedFrom),
    windowId: id,
    windowText: id === 'outside' ? describeOutside(s.checkedFrom) : windowLabel(id),
    regionCodes: codes,
    regionText: regionLine(codes),
    countText: `${s.onlineNodes}/${s.totalNodes} 个节点显示在线`,
    status: '站长实测',
    tone: 'pending',
    search: searchOf(brand, codes, s.byRegion.map((r) => r.label)),
  };
}

export function siteRecordRow(r: TestRecord): BrowserRow {
  const brand = getBrand(r.brandId);
  const w = windowOfRecord(r);
  return {
    anchor: r.testId,
    brandSlug: r.brandId,
    brandName: brand?.shortName ?? r.brandId,
    kindLabel: RECORD_KIND_LABEL[r.recordKind],
    grade: r.sourceType,
    timeText: r.testDateTime ? fmtDateTime(r.testDateTime) : (r.testDateText ?? '没有日期'),
    windowId: w.id,
    windowText: w.text,
    regionCodes: [r.nodeRegion],
    regionText: countryName(r.nodeRegion),
    countText: '1 次观察',
    status: r.isVerified ? '附测速原图' : '站长实测',
    tone: r.isVerified ? 'third' : 'pending',
    search: searchOf(brand, [r.nodeRegion], [r.nodeDisplayName]),
  };
}

export function groupRow(g: RecordGroup): BrowserRow {
  const first = g.rows[0]!;
  const w = windowOfRecord(first);
  const codes = [...new Set(g.rows.map((r) => r.nodeRegion))];
  return {
    anchor: g.id,
    brandSlug: g.brand.slug,
    brandName: g.brand.shortName,
    kindLabel: RECORD_KIND_LABEL[g.kind],
    grade: g.grade,
    timeText: g.dateText ?? '日期未标注',
    windowId: w.id,
    windowText: w.text,
    regionCodes: codes,
    regionText: regionLine(codes),
    countText: `${g.rows.length} 个节点行`,
    status: g.grade === 'D' ? '待核验线索，无原图' : '第三方页面摘录，非本站测试',
    tone: g.grade === 'D' ? 'claim' : 'third',
    search: searchOf(g.brand, codes, g.rows.map((r) => r.nodeDisplayName)),
  };
}

/** 全部记录的统一清单：本站记录、节点在线快照在前，其他测速参考按品牌固定顺序在后 */
export function browserRows(): BrowserRow[] {
  return [
    ...SITE_TEST_RECORDS.map(siteRecordRow),
    ...AVAILABILITY_SNAPSHOTS.map(snapshotRow),
    ...groupRecords(THIRD_PARTY_RECORDS).map(groupRow),
  ];
}
