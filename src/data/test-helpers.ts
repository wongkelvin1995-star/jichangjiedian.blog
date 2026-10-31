import type { TestRecord } from './types';
import { classifyWindow } from './time-windows';

type Required =
  | 'testId'
  | 'brandId'
  | 'nodeRegion'
  | 'nodeDisplayName'
  | 'recordKind'
  | 'sourceType'
  | 'notes'
  | 'publishedAt';

/** 构造测试记录：所有未提供的测量值都是 null（未测得），绝不写 0 */
export function makeRecord(r: Partial<TestRecord> & Pick<TestRecord, Required>): TestRecord {
  const testDateTime = r.testDateTime ?? null;
  return {
    nodeId: null,
    testDateTime,
    testDateText: null,
    timezone: 'Asia/Shanghai',
    timeWindow: classifyWindow(testDateTime),
    originCountry: null,
    originCity: null,
    originISP: null,
    clientName: null,
    clientVersion: null,
    deviceType: null,
    testServer: null,
    testMethod: null,
    downloadMbps: null,
    uploadMbps: null,
    idleLatencyMs: null,
    loadedDownloadLatencyMs: null,
    loadedUploadLatencyMs: null,
    jitterMs: null,
    packetLossPercent: null,
    connectionSuccess: null,
    testDurationSeconds: null,
    sampleCount: null,
    youtubeQuality: null,
    youtubeBufferSeconds: null,
    screenshotPath: null,
    rawLogPath: null,
    isVerified: false,
    evidenceIds: [],
    caveats: [],
    ...r,
  };
}
