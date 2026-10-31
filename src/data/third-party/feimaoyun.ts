import type { TestRecord } from '../types';
import { makeRecord } from '../test-helpers';

const T = 't07';
const PUBLISHED = '2026-10-27';
const U = 'MB（原图标注单位，未换算）';

const base = (id: string, region: string, name: string, extra: Partial<TestRecord>): TestRecord =>
  makeRecord({
    testId: `c-feimaoyun-${id}`,
    brandId: 'feimaoyun',
    nodeRegion: region,
    nodeDisplayName: name,
    recordKind: 'third-party-speed',
    sourceType: 'C',
    publishedAt: PUBLISHED,
    evidenceIds: [],
    ...extra,
  } as TestRecord);

const rowsA: Array<[string, string, string, number, number, number, number]> = [
  // id, region, name, TLS RTT, HTTPS, avg, max
  ['20260708-tw01', 'TW', '台湾 TW 01', 62, 436, 107.97, 135.94],
  ['20260708-sg01', 'SG', '新加坡 SG 01', 71, 300, 75.67, 99.09],
  ['20260708-jp01', 'JP', '日本 JP 01', 167, 695, 58.86, 103.09],
  ['20260708-us01', 'US', '美国 US 01', 183, 762, 157.57, 211.84],
  ['20260708-hk01', 'HK', '香港 HK 01', 45, 275, 147.97, 197.78],
];

const A: TestRecord[] = rowsA.map(([id, r, n, tls, https, avg, max]) =>
  base(id, r, n, {
    testDateTime: '2026-07-08T14:48:11+08:00',
    testDateText: '2026-07-08 14:48:11（CST）',
    originISP: '长沙电信 2Gbps（截图后端标注）',
    clientName: 'SpeedCentre+',
    testMethod: '第三方评测站收录的测速截图；6 线程；节点类型显示 AnyTLS',
    sampleCount: 6,
    extraMetrics: {
      tlsRttMs: { value: tls, unit: 'ms' },
      httpsLatencyMs: { value: https, unit: 'ms' },
      avgSpeed: { value: avg, unit: U },
      maxSpeed: { value: max, unit: U },
      nodeType: { value: 'AnyTLS' },
    },
    notes: '节选自第三方评测页“测速图一”。速度保留原图 MB 标注，没有换算为 Mbps，因此 downloadMbps 留空。',
    caveats: [
      '其他测速参考。',
      '与同页“测速图二”的日期、网络、线程数、节点类型不同，不能据此判断速度升降。',
      '历史 AnyTLS 记录与当前服务资料应分别核对。',
    ],
    evidenceIds: [],
  }),
);

const rowsB: Array<[string, string, string, number | null, number | null, string, string, string, string]> = [
  ['20260711-hk01', 'HK', 'ss-HK-香港BGP-IEPL01', 132, 524, '87.02MB', '118.52MB', 'FullCone', ''],
  ['20260711-tw02', 'TW', 'ss-TW-台湾BGP-IEPL02', 175, 1248, '13.43MB', '19.14MB', 'Unknown', ''],
  ['20260711-jp10', 'JP', 'ss-JP-日本BGP-IEPL10', null, null, '0.00B', '0.00B', 'Unknown', '该次未取得延迟与有效吞吐，零速原因未记录'],
  ['20260711-sg08', 'SG', 'ss-SG-新加坡BGP-IEPL08', 146, 1159, '1.60KB', '16.00KB', 'FullCone', '低速记录'],
  ['20260711-us01', 'US', 'ss-US-美国BGP-IEPL01', 265, 1045, '13.66MB', '24.95MB', 'FullCone', ''],
];

const B: TestRecord[] = rowsB.map(([id, r, n, tls, https, avg, max, udp, remark]) =>
  base(id, r, n, {
    testDateTime: '2026-07-11T21:34:44+08:00',
    testDateText: '2026-07-11 21:34:44（CST）',
    originISP: '珠海联通 9Gbps（截图环境标注）',
    clientName: '喵速（MiaoKo）',
    clientVersion: '4.7.0',
    testMethod: '第三方评测站收录的测速截图；32 线程；节点类型显示 VLESS',
    sampleCount: 32,
    connectionSuccess: null,
    extraMetrics: {
      tlsRttMs: { value: tls, unit: 'ms' },
      httpsLatencyMs: { value: https, unit: 'ms' },
      avgSpeed: { value: avg, unit: '原图标注单位' },
      maxSpeed: { value: max, unit: '原图标注单位' },
      udpNat: { value: udp },
      nodeType: { value: 'VLESS' },
    },
    notes: `节选自第三方评测页“测速图二”。${remark ? remark + '。' : ''}页面提醒：即使节点名称带 ss- 也不应据此改写协议列。`,
    caveats: [
      '其他测速参考。',
      '与“测速图一”的日期、网络、线程数、节点类型不同，不能直接比较。',
    ],
    evidenceIds: [],
  }),
);

export const feimaoyunThirdParty: TestRecord[] = [...A, ...B];
export const feimaoyunThirdPartySource = T;
