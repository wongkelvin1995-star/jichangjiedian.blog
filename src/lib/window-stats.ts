/**
 * 分时段统计：只做归类与计数，不做任何插值、平均或估算。
 * 没有记录的窗口就是空的——页面显示“该时间段暂无本站可核验测试记录。”
 */
import { TIME_WINDOWS, classifyWindow } from '../data/time-windows';
import type { TimeWindowDef } from '../data/time-windows';
import { AVAILABILITY_SNAPSHOTS, TEST_RECORDS, isStatEligible } from '../data/test-records';
import type { AvailabilitySnapshot, TestRecord } from '../data/types';

export interface WindowRow {
  def: TimeWindowDef;
  /** 可进入统计的本站速度记录（有日期、落在窗口内、有数值） */
  speedRecords: TestRecord[];
  /** 其他本站观察（例如 YouTube 播放观察）落在该窗口 */
  otherSiteRecords: TestRecord[];
  snapshots: AvailabilitySnapshot[];
  /** 其他测速参考：时间标注在该窗口内的行 */
  thirdParty: TestRecord[];
}

const isSite = (r: TestRecord) => r.sourceType === 'A' || r.sourceType === 'B';
const isThird = (r: TestRecord) => r.sourceType === 'C' || r.sourceType === 'D';

export function windowRows(): WindowRow[] {
  return TIME_WINDOWS.map((def) => {
    const inWin = TEST_RECORDS.filter((r) => r.timeWindow === def.id);
    return {
      def,
      speedRecords: inWin.filter((r) => isSite(r) && isStatEligible(r)),
      otherSiteRecords: inWin.filter((r) => isSite(r) && !isStatEligible(r)),
      snapshots: AVAILABILITY_SNAPSHOTS.filter((s) => classifyWindow(s.checkedFrom) === def.id),
      thirdParty: inWin.filter(isThird),
    };
  });
}

export interface LooseRecords {
  /** 有时间但落在预设窗口之外 */
  outside: { site: TestRecord[]; third: TestRecord[]; snapshots: AvailabilitySnapshot[] };
  /** 完全没有日期时间 */
  undated: { site: TestRecord[]; third: TestRecord[] };
}

export function looseRecords(): LooseRecords {
  return {
    outside: {
      site: TEST_RECORDS.filter((r) => r.timeWindow === 'outside' && isSite(r)),
      third: TEST_RECORDS.filter((r) => r.timeWindow === 'outside' && isThird(r)),
      snapshots: AVAILABILITY_SNAPSHOTS.filter((s) => classifyWindow(s.checkedFrom) === 'outside'),
    },
    undated: {
      site: TEST_RECORDS.filter((r) => r.timeWindow === 'unknown' && isSite(r)),
      third: TEST_RECORDS.filter((r) => r.timeWindow === 'unknown' && isThird(r)),
    },
  };
}

/** 时间带上的标记点：时间（小时，含小数）与类型 */
export interface BandMarker {
  hour: number;
  kind: 'ok' | 'info' | 'ring';
  label: string;
  when: string;
}

const hourOf = (iso: string): number => {
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};
const hhmm = (iso: string): string => iso.slice(11, 16);

export function bandMarkers(includeThirdParty: boolean): BandMarker[] {
  const out: BandMarker[] = [];
  for (const s of AVAILABILITY_SNAPSHOTS) {
    if (!s.checkedFrom) continue;
    out.push({
      hour: hourOf(s.checkedFrom),
      kind: 'ok',
      label: `节点在线快照 ${s.onlineNodes}/${s.totalNodes}`,
      when: `${s.checkedFrom.slice(0, 10)} ${hhmm(s.checkedFrom)}`,
    });
  }
  for (const r of TEST_RECORDS.filter((x) => isSite(x) && x.testDateTime)) {
    out.push({
      hour: hourOf(r.testDateTime!),
      kind: 'info',
      label: r.recordKind === 'youtube' ? 'YouTube 播放观察' : '本站测速',
      when: `${r.testDateTime!.slice(0, 10)} ${hhmm(r.testDateTime!)}`,
    });
  }
  if (includeThirdParty) {
    const seen = new Set<string>();
    for (const r of TEST_RECORDS.filter((x) => isThird(x) && x.testDateTime)) {
      const key = `${r.brandId}|${r.testDateTime}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ hour: hourOf(r.testDateTime!), kind: 'ring', label: '其他测速参考', when: `${r.testDateTime!.slice(0, 10)} ${hhmm(r.testDateTime!)}` });
    }
  }
  return out;
}
