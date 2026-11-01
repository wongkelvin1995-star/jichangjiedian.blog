/**
 * 测试记录总表。
 *
 * 数据分两类，页面上必须分开展示：
 *  - 本站测试记录（sourceType A）：目前只有灵动云；较早的两条（第一次新加坡测速、10-24 YouTube）原始截图已不保留，isVerified = false，
 *    2026-10-28 起有原始截图的记录 isVerified = true（页面上的数量都从这里算，不写死）；
 *  - 第三方历史参考（sourceType C/D）：来自第三方评测页摘录，速度保留原图单位（MB/KB/B），不换算成 Mbps。
 *
 * 绝不为没有测量值的字段补 0，也不生成任何随机数据。
 */
import { classifyWindow } from './time-windows';
import type { AvailabilitySnapshot, EvidenceFile, TestRecord, TimeWindowId } from './types';
import { LDY_AVAILABILITY, LDY_EVIDENCE, LDY_RECORDS } from './reports/lingdongyun-sg-2026-10';
import { LDY_HK_EVIDENCE, LDY_HK_PEAK, LDY_HK_YOUTUBE, LDY_US_EVIDENCE, LDY_US_PEAK } from './reports/lingdongyun-peak-2026-10-28';
import { LDY_SG1031_EVIDENCE, LDY_AVAILABILITY_1031, LDY_SG1031_SPEED, LDY_SG1031_YOUTUBE } from './reports/lingdongyun-sg-2026-10-31';
import { breezenetThirdParty } from './third-party/breezenet';
import { feimaoyunThirdParty } from './third-party/feimaoyun';
import { fireflyThirdParty } from './third-party/firefly';
import { kexinyunThirdParty } from './third-party/kexinyun';
import { kuailiThirdParty } from './third-party/kuaili';
import { lingmaoThirdParty } from './third-party/lingmao';
import { wavenetThirdParty } from './third-party/wavenet';
import { wuyouThirdParty } from './third-party/wuyou';
import { xingdaomengThirdParty } from './third-party/xingdaomeng';
import { yifanyunThirdParty } from './third-party/yifanyun';
import { yunjieyunThirdParty } from './third-party/yunjieyun';

export const SITE_TEST_RECORDS: readonly TestRecord[] = [...LDY_RECORDS, LDY_HK_PEAK, LDY_HK_YOUTUBE, LDY_US_PEAK, LDY_SG1031_SPEED, LDY_SG1031_YOUTUBE];

const ALL_THIRD_PARTY: readonly TestRecord[] = [
  ...breezenetThirdParty,
  ...feimaoyunThirdParty,
  ...fireflyThirdParty,
  ...kexinyunThirdParty,
  ...kuailiThirdParty,
  ...lingmaoThirdParty,
  ...wavenetThirdParty,
  ...wuyouThirdParty,
  ...xingdaomengThirdParty,
  ...yifanyunThirdParty,
  ...yunjieyunThirdParty,
];

const MEASURE_KEYS = ['tlsRttMs', 'httpsLatencyMs', 'avgSpeed', 'maxSpeed', 'netflix', 'disneyPlus', 'tiktok', 'openai'] as const;

/** 记录里是否真有测量值（延迟、速度、解锁结果等）。只有页面营销文字的行不算测试记录。 */
export const hasMeasurement = (r: TestRecord): boolean =>
  r.downloadMbps !== null ||
  r.uploadMbps !== null ||
  r.idleLatencyMs !== null ||
  r.youtubeBufferSeconds !== null ||
  MEASURE_KEYS.some((k) => {
    const v = r.extraMetrics?.[k]?.value;
    return v !== null && v !== undefined;
  });

/** 第三方历史参考：只含有测量值的行；仅有页面文字描述的行单独放在 CLAIM_ONLY_RECORDS，不计入测试记录 */
export const THIRD_PARTY_RECORDS: readonly TestRecord[] = ALL_THIRD_PARTY.filter(hasMeasurement);
export const CLAIM_ONLY_RECORDS: readonly TestRecord[] = ALL_THIRD_PARTY.filter((r) => !hasMeasurement(r));

export const TEST_RECORDS: readonly TestRecord[] = [...SITE_TEST_RECORDS, ...THIRD_PARTY_RECORDS];
export const AVAILABILITY_SNAPSHOTS: readonly AvailabilitySnapshot[] = [LDY_AVAILABILITY, LDY_AVAILABILITY_1031];
export const EVIDENCE_FILES: readonly EvidenceFile[] = [...LDY_EVIDENCE, ...LDY_HK_EVIDENCE, ...LDY_US_EVIDENCE, ...LDY_SG1031_EVIDENCE];

// 注册时即检查 testId 唯一，避免页面锚点冲突
{
  const seen = new Set<string>();
  for (const r of [...TEST_RECORDS, ...CLAIM_ONLY_RECORDS]) {
    if (seen.has(r.testId)) throw new Error(`test-records: 重复的 testId ${r.testId}`);
    seen.add(r.testId);
  }
}

export const recordsForBrand = (brandId: string): TestRecord[] => TEST_RECORDS.filter((r) => r.brandId === brandId);
export const claimOnlyForBrand = (brandId: string): TestRecord[] => CLAIM_ONLY_RECORDS.filter((r) => r.brandId === brandId);
export const snapshotsForBrand = (brandId: string): AvailabilitySnapshot[] =>
  AVAILABILITY_SNAPSHOTS.filter((s) => s.brandId === brandId);
export const evidenceForBrand = (brandId: string): EvidenceFile[] => EVIDENCE_FILES.filter((e) => e.brandId === brandId);

const dateOf = (iso: string | null): string | null => (iso ? iso.slice(0, 10) : null);

/** 本站测试摘要：是否有本站记录、原图是否齐全、最近一次带日期的本站观察 */
export function siteTestSummary(brandId: string): {
  hasRecords: boolean;
  originalEvidenceComplete: boolean;
  lastTestDate: string | null;
} {
  const recs = SITE_TEST_RECORDS.filter((r) => r.brandId === brandId);
  const snaps = AVAILABILITY_SNAPSHOTS.filter((s) => s.brandId === brandId && s.sourceType === 'A');
  const hasRecords = recs.length + snaps.length > 0;
  const files = EVIDENCE_FILES.filter((e) => e.brandId === brandId && e.isOriginal);
  const originalEvidenceComplete = hasRecords && recs.every((r) => r.isVerified) && files.every((f) => !f.expected);
  const dates = [...recs.map((r) => dateOf(r.testDateTime)), ...snaps.map((s) => dateOf(s.checkedFrom))].filter(
    (d): d is string => d !== null,
  );
  dates.sort();
  return { hasRecords, originalEvidenceComplete, lastTestDate: dates.length ? dates[dates.length - 1]! : null };
}

/**
 * 能否进入分时段统计：必须是本站测试、带完整日期时间、落在预设窗口内、有可用于统计的数值，
 * 并且原始截图或日志已挂载核验（isVerified）。
 * D 级或无来源的记录、第三方原图单位记录、没有数值的记录、没有原图的记录一律不进入统计。
 */
export function isStatEligible(r: TestRecord): boolean {
  if (r.sourceType !== 'A' && r.sourceType !== 'B') return false;
  if (!r.isVerified) return false;
  if (!r.testDateTime) return false;
  const w = classifyWindow(r.testDateTime);
  if (w === 'outside' || w === 'unknown') return false;
  return r.downloadMbps !== null || r.idleLatencyMs !== null || r.uploadMbps !== null;
}

export const recordsInWindow = (w: TimeWindowId): TestRecord[] => TEST_RECORDS.filter((r) => r.timeWindow === w);

/** 一个简单计数，供“测试档案”首屏的真实统计使用（不是性能评分） */
export const TEST_COUNTS = {
  siteRecords: SITE_TEST_RECORDS.length,
  snapshots: AVAILABILITY_SNAPSHOTS.length,
  thirdPartyRows: THIRD_PARTY_RECORDS.length,
  claimOnlyRows: CLAIM_ONLY_RECORDS.length,
  thirdPartyBrands: new Set(THIRD_PARTY_RECORDS.map((r) => r.brandId)).size,
  siteBrands: new Set([...SITE_TEST_RECORDS.map((r) => r.brandId), ...AVAILABILITY_SNAPSHOTS.map((s) => s.brandId)]).size,
  statEligible: TEST_RECORDS.filter(isStatEligible).length,
} as const;
