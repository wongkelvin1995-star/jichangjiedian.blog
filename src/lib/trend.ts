/**
 * 趋势图的数据与布局。
 *
 * 规则（页面上也会写明）：只有“同一品牌、同一节点、同一预设时间窗口”下，
 * 至少 3 个不同日期、且已挂载原始证据的本站记录，才会画趋势线；
 * 不做平均、插值或平滑，同一天的多次记录各自画点；没有数据就不画。
 */
import { getBrand } from '../data/brands';
import { TEST_RECORDS, isStatEligible } from '../data/test-records';
import { classifyWindow, windowLabel } from '../data/time-windows';
import type { TestRecord, TimeWindowId } from '../data/types';

export const MIN_TREND_DAYS = 3;

export interface TrendPoint {
  date: string;
  value: number;
  testId: string;
}

export interface TrendSeries {
  key: string;
  brandSlug: string;
  brandName: string;
  nodeName: string;
  windowId: TimeWindowId;
  windowText: string;
  metric: 'downloadMbps' | 'idleLatencyMs';
  metricLabel: string;
  unit: string;
  points: TrendPoint[];
}

const METRICS = [
  { key: 'downloadMbps', label: '下载速度', unit: 'Mbps' },
  { key: 'idleLatencyMs', label: '空载延迟', unit: 'ms' },
] as const;

export function buildTrendSeries(records: readonly TestRecord[] = TEST_RECORDS): TrendSeries[] {
  const map = new Map<string, TrendSeries>();
  for (const r of records) {
    if (!isStatEligible(r) || !r.testDateTime) continue;
    const w = classifyWindow(r.testDateTime);
    if (w === 'outside' || w === 'unknown') continue;
    for (const m of METRICS) {
      const v = r[m.key];
      if (v === null) continue;
      const key = `${r.brandId}|${r.nodeDisplayName}|${w}|${m.key}`;
      let series = map.get(key);
      if (!series) {
        series = {
          key,
          brandSlug: r.brandId,
          brandName: getBrand(r.brandId)?.shortName ?? r.brandId,
          nodeName: r.nodeDisplayName,
          windowId: w,
          windowText: windowLabel(w),
          metric: m.key,
          metricLabel: m.label,
          unit: m.unit,
          points: [],
        };
        map.set(key, series);
      }
      series.points.push({ date: r.testDateTime, value: v, testId: r.testId });
    }
  }
  return [...map.values()]
    .map((s) => ({ ...s, points: [...s.points].sort((a, b) => a.date.localeCompare(b.date)) }))
    .filter((s) => new Set(s.points.map((p) => p.date.slice(0, 10))).size >= MIN_TREND_DAYS);
}

export interface TrendLayout {
  width: number;
  height: number;
  path: string;
  dots: { x: number; y: number; label: string; testId: string }[];
  yTicks: { y: number; label: string }[];
  xTicks: { x: number; label: string }[];
}

const dayNumber = (iso: string): number => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;

/** y 轴从 0 开始（不截断），x 轴按真实日期比例排布 */
export function layoutTrend(points: TrendPoint[], unit: string, width = 640, height = 240): TrendLayout {
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const days = points.map((p) => dayNumber(p.date));
  const d0 = Math.min(...days);
  const d1 = Math.max(...days);
  const span = Math.max(d1 - d0, 1);
  const vmax = Math.max(...points.map((p) => p.value), 1);
  const step = niceStep(vmax / 4);
  const top = Math.ceil(vmax / step) * step;
  const X = (d: number) => Math.round((padL + ((d - d0) / span) * innerW) * 10) / 10;
  const Y = (v: number) => Math.round((padT + innerH - (v / top) * innerH) * 10) / 10;
  const dots = points.map((p, i) => ({ x: X(days[i]!), y: Y(p.value), label: `${p.date.slice(0, 10)} ${p.date.slice(11, 16)}　${p.value} ${unit}`, testId: p.testId }));
  const yTicks: TrendLayout['yTicks'] = [];
  for (let v = 0; v <= top + 1e-9; v += step) yTicks.push({ y: Y(v), label: String(Math.round(v * 100) / 100) });
  const uniq = [...new Set(points.map((p) => p.date.slice(0, 10)))];
  const xTicks = uniq.map((d) => ({ x: X(dayNumber(d)), label: d.slice(5) }));
  return { width, height, path: dots.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`).join(' '), dots, yTicks, xTicks };
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const f = raw / 10 ** exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * 10 ** exp;
}
