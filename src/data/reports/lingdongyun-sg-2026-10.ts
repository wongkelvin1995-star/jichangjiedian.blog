/**
 * 灵动云新加坡节点测速专题的结构化数据。
 *
 * 数据来源：站长整理图 img-ldy-report（这三份原始截图已不保留，对应记录 isVerified = false）；
 * 2026-10-28 站长另外提供了晚高峰复测的两张原图，这条记录已核验。
 * 三类证据的时间互不相同，站内任何页面都不得把它们写成同一次连续测试：
 *   - 新加坡测速：截图没有可见日期；
 *   - 节点在线：2026-10-21 18:57:32–18:58:30（北京时间）；
 *   - YouTube Stats for nerds：2026-10-24 23:04:55（中国标准时间，已超出预设“晚高峰”窗口 4 分钟）。
 */
import { makeRecord } from '../test-helpers';
import type { AvailabilitySnapshot, EvidenceFile, TestRecord } from '../types';

export const LDY_REPORT_SLUG = 'singapore-speedtest-2026-10';
export const LDY_REPORT_PATH = `/airports/lingdongyun/${LDY_REPORT_SLUG}/`;
export const LDY_REPORT_TITLE = '灵动云新加坡节点测速报告：两次晚间复测与YouTube播放记录';
export const LDY_REPORT_PUBLISHED = '2026-10-27';
export const LDY_REPORT_MODIFIED = '2026-11-01';

const IMG = 'img-ldy-report';

/** 三份原始截图（尚未挂载）+ 一张站长整理图 */
export const LDY_EVIDENCE: EvidenceFile[] = [
  {
    evidenceId: 'ldy-composite-report',
    brandId: 'lingdongyun',
    title: '站长数据整理图：新加坡节点测速、节点在线与 YouTube 播放核验',
    kind: 'composite-image',
    publicPath: '/evidence/lingdongyun/ldy-sg-summary-2026-10.png',
    expected: false,
    description: '站长把三份不同时间的截图整理在一张图里。它是整理图，不是原始证据；数字以原始截图为准。',
    capturedAtText: null,
    isOriginal: false,
  },
  {
    evidenceId: 'ldy-sg-speedtest-original',
    brandId: 'lingdongyun',
    title: '新加坡节点网页测速原始截图',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/sg-speedtest-original.png',
    expected: true,
    description: '含下载、上传、空载延迟、抖动、下载/上传时延迟与网站连通性数据。截图没有可见日期。',
    capturedAtText: '无可见日期',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-node-status-original',
    brandId: 'lingdongyun',
    title: '节点状态原始截图（57 个节点）',
    kind: 'node-status-screenshot',
    publicPath: '/evidence/lingdongyun/node-status-2026-10-21.png',
    expected: true,
    description: '各地区节点在线数与流量倍率。',
    capturedAtText: '2026-10-21 18:57:32–18:58:30（北京时间）',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-youtube-stats-original',
    brandId: 'lingdongyun',
    title: 'YouTube「Stats for nerds」原始截图',
    kind: 'youtube-stats-screenshot',
    publicPath: '/evidence/lingdongyun/youtube-stats-2026-10-24.png',
    expected: true,
    description: '含 Current/Optimal Res、Connection Speed、Buffer Health 与截图内的日期时间。',
    capturedAtText: '2026-10-24 23:04:55（中国标准时间）',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-plan-chuanyun-20261028',
    brandId: 'lingdongyun',
    title: '灵动·穿云套餐详情截图（服务商面板，2026-10-28 提供）',
    kind: 'plan-screenshot',
    publicPath: '/evidence/lingdongyun/plan-chuanyun-2026-10-28.png',
    expected: true,
    description: '¥99/年、70GB、不限速、不限设备；订阅详情写：70GB/月高速流量（全节点 x1，晚高峰不限速）、购买日起每 30 天刷新、全 IPLC 专线（单节点峰值最高 2.5Gbps）、原生 IP，以及各地区节点数量。',
    capturedAtText: '截图没有时间；站长 2026-10-28 提供',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-sg-peak-speedtest-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰新加坡节点网页测速原图（2026-10-28）',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/sg-peak-speedtest-2026-10-28.png',
    expected: true,
    description: '站长晚高峰实测截图：出口 IP 在新加坡（AUK HomeFiber，AS9664），下载 50MB、上传 15MB，共消耗 49MB；含下载、上传、空载延迟、抖动、下载/上传时延迟和三条曲线。截图本身没有时钟。',
    capturedAtText: '截图内没有时钟；同一次测速的连通性截图显示 2026-10-28 21:26',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-sg-peak-reachability-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰新加坡节点网站连通性原图（2026-10-28 21:26）',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/sg-peak-reachability-2026-10-28.png',
    expected: true,
    description: '同一个测速页下方的 15 个网站连通性（每个网站连 4 次取中位数），截图底部的系统时钟显示 2026-10-28 21:26。',
    capturedAtText: '2026-10-28 21:26（截图里的电脑系统时钟）',
    isOriginal: true,
  },
];

const MISSING_ORIGINALS =
  '原始截图已不保留到本站，当前只有站长整理图，因此本记录标记为“未核验”（不是“已核验”）。';

/** 新加坡测速（整理图无可见时刻；日期 2026-10-28 由站长补充） */
export const LDY_SPEEDTEST: TestRecord = makeRecord({
  testId: 'a-lingdongyun-sg-speedtest-undated',
  brandId: 'lingdongyun',
  nodeRegion: 'SG',
  nodeDisplayName: '新加坡节点（截图未显示具体编号）',
  recordKind: 'speedtest',
  sourceType: 'A',
  publishedAt: '2026-10-27',
  // 站长 2026-10-31 补充：测试日期 2026-10-28、测试地区广东（深圳 / 广州 / 东莞）。整理图本身没有可见日期和时刻，
  // 所以 testDateTime 保持 null（不进入分时段统计），日期只作为站长说明记录；原始截图挂载后再按截图上的时钟补齐。
  testDateTime: null,
  testDateText: '2026-10-28（站长 2026-10-31 补充的日期；整理图上没有可见时刻）',
  originCountry: 'CN',
  originCity: '广东（深圳 / 广州 / 东莞，站长提供，未写明具体是哪一处）',
  originISP: '中国联通（站长自述）',
  testMethod: '网页测速工具（整理图未注明工具名称）；整理图说明：出口在新加坡，测速流量经代理访问外部网络',
  downloadMbps: 21.2,
  uploadMbps: 1.52,
  idleLatencyMs: 118,
  loadedDownloadLatencyMs: 208,
  loadedUploadLatencyMs: 233,
  jitterMs: 80.9,
  packetLossPercent: null,
  sampleCount: 1,
  evidenceIds: ['ldy-composite-report', 'ldy-sg-speedtest-original'],
  extraMetrics: {
    pageDetectedNetwork: { value: 'AUK HomeFiber (AS9664)' },
  },
  notes:
    '单次测速。整理图显示测速页识别的网络/ASN 为 AUK HomeFiber (AS9664)；由于测速流量经代理访问外部网络，这更可能是出口侧信息，本站未能核验，也不把它当作本地宽带。丢包率网页工具未能测出，记为“未测得”，没有写成 0%。',
  caveats: [
    '单次测试结果，不能代表长期表现，也不能代表晚高峰。',
    '测试日期 2026-10-28 与测试地区（广东：深圳 / 广州 / 东莞）由站长在 2026-10-31 补充说明；整理图上没有可见时刻，因此不进入任何分时段统计。',
    '具体是新加坡 8 个节点中的哪一个，整理图没有显示。',
    MISSING_ORIGINALS,
  ],
  isVerified: false,
});

/** YouTube Stats for nerds（2026-10-24 23:04:55，已超出预设晚高峰窗口） */
export const LDY_YOUTUBE: TestRecord = makeRecord({
  testId: 'a-lingdongyun-sg-youtube-20261024',
  brandId: 'lingdongyun',
  nodeRegion: 'SG',
  nodeDisplayName: '新加坡节点（截图未显示具体编号）',
  recordKind: 'youtube',
  sourceType: 'A',
  publishedAt: '2026-10-27',
  originCountry: 'CN',
  originCity: '广东（站长自述，未写明具体城市）',
  originISP: '中国联通（站长自述）',
  testDateTime: '2026-10-24T23:04:55+08:00',
  testDateText: '2026-10-24 23:04:55（中国标准时间 GMT+0800）',
  testMethod: 'YouTube 播放器「Stats for nerds」截图（新加坡节点）',
  youtubeQuality: '1280×720@25（Current Res 与 Optimal Res 相同）',
  youtubeBufferSeconds: 80.84,
  sampleCount: 1,
  evidenceIds: ['ldy-composite-report', 'ldy-youtube-stats-original'],
  extraMetrics: {
    connectionSpeedKbps: { value: 21182, unit: 'Kbps（播放器估算的连接速度）' },
    networkActivityKB: { value: 208, unit: 'KB' },
    droppedFrames: { value: '0 / 1718' },
    viewport: { value: '1337×752' },
    codecs: { value: 'av01.0.05M.08 (398) / opus (251)' },
  },
  notes:
    'Buffer Health 80.84 秒、掉帧 0/1718，是一次 720p 播放观察，不是 4K 测试，也不是长时间连续观察。Connection Speed 与同专题测速页的 21.2 Mbps 数值接近，但两次观察时间不同、方法不同，不能互相印证。',
  caveats: [
    '23:04:55 在预设“晚高峰”窗口（20:00–23:00）结束 4 分钟之后，因此不计入晚高峰统计。',
    '只观察了一段视频的播放状态，不能推出其他视频、其他时间或其他节点的表现。',
    MISSING_ORIGINALS,
  ],
  isVerified: false,
});

/** 晚高峰复测（2026-10-28，站长提供两张原图） */
export const LDY_PEAK: TestRecord = makeRecord({
  testId: 'a-lingdongyun-sg-speedtest-20261028-peak',
  brandId: 'lingdongyun',
  nodeRegion: 'SG',
  nodeDisplayName: '新加坡节点（截图未显示具体编号）',
  recordKind: 'speedtest',
  sourceType: 'A',
  publishedAt: '2026-10-28',
  testDateTime: '2026-10-28T21:26:00+08:00',
  testDateText: '2026-10-28 约 21:26（北京时间，取自同一次测速的连通性截图里的系统时钟）',
  originISP: '中国联通（站长自述）',
  originCountry: null,
  testServer: 'Cloudflare（测速节点 SIN 新加坡）',
  testMethod: '网页测速：下载 50MB、上传 15MB（共消耗 49MB 流量）；页面的代理检查显示出口在新加坡，测速流量经过代理',
  downloadMbps: 13.2,
  uploadMbps: 18.7,
  idleLatencyMs: 63.8,
  loadedDownloadLatencyMs: 167,
  loadedUploadLatencyMs: 579,
  jitterMs: 18,
  packetLossPercent: null,
  sampleCount: 1,
  evidenceIds: ['ldy-sg-peak-speedtest-20261028', 'ldy-sg-peak-reachability-20261028'],
  extraMetrics: {
    pageDetectedNetwork: { value: 'AUK HomeFiber (AS9664)' },
    downloadPeakMbps: { value: 16.5, unit: 'Mbps（下载曲线峰值）' },
    uploadPeakMbps: { value: 26.7, unit: 'Mbps（上传曲线峰值）' },
    latencyPeakMs: { value: 125, unit: 'ms（延迟曲线最高点）' },
  },
  notes:
    '晚高峰单次测速：下载 13.2 Mbps、上传 18.7 Mbps，空载延迟 63.8 ms；下载时延迟升到 167 ms，上传时升到 579 ms；抖动 18.0 ms。丢包率浏览器无法测（需要 UDP），记为“未测得”。出口网络与 2026-10 前一次新加坡测速相同（AUK HomeFiber，AS9664）。',
  caveats: [
    '测速截图本身没有时钟；时间取自同一页面下方连通性截图里的系统时钟（21:26），测速完成时间应在这之前不久，仍在 20:00–23:00 晚高峰窗口内。',
    '单次测试，只能说明这一晚这一刻的状态；要判断晚高峰是否稳定，需要连续多天在同一时段重复测试。',
    '截图没有显示具体是哪个新加坡节点，本地宽带运营商为站长自述的中国联通（截图上看不到），带宽没有记录。',
  ],
  isVerified: true,
});

export const LDY_RECORDS: TestRecord[] = [LDY_SPEEDTEST, LDY_YOUTUBE, LDY_PEAK];

/** 节点在线快照（2026-10-21） */
export const LDY_AVAILABILITY: AvailabilitySnapshot = {
  snapshotId: 'a-lingdongyun-nodes-20261021',
  brandId: 'lingdongyun',
  checkedFrom: '2026-10-21T18:57:32+08:00',
  checkedTo: '2026-10-21T18:58:30+08:00',
  timezone: 'Asia/Shanghai',
  totalNodes: 57,
  onlineNodes: 57,
  byRegion: [
    { countryCode: 'HK', label: '香港', online: 20, total: 20 },
    { countryCode: 'JP', label: '日本', online: 9, total: 9 },
    { countryCode: 'SG', label: '新加坡', online: 8, total: 8 },
    { countryCode: 'TW', label: '台湾', online: 10, total: 10 },
    { countryCode: 'US', label: '美国', online: 10, total: 10 },
  ],
  trafficMultiplier: '全部 1x',
  sourceType: 'A',
  evidenceIds: ['ldy-composite-report', 'ldy-node-status-original'],
  caveats: [
    '这是控制面板在一个时间点显示的节点在线状态，不等于速度、延迟或长期可用率。',
    '“57/57”指截图中出现的节点全部在线，不代表服务商的全部节点。',
    MISSING_ORIGINALS,
  ],
};

export type ReachStatus = 'ok' | 'slow' | 'veryslow' | 'timeout';
export interface ReachabilityRow {
  site: string;
  status: ReachStatus;
  /** 毫秒；超时为 null */
  ms: number | null;
  /** 整理图上的原文标签 */
  label: string;
}

/** 新加坡节点网站连通性（来自测速截图，整理图转录）。连通性不等于解锁、也不等于可正常使用 */
export const LDY_REACHABILITY: ReachabilityRow[] = [
  { site: 'Google', status: 'ok', ms: 25, label: '可连接' },
  { site: 'YouTube', status: 'ok', ms: 25, label: '可连接' },
  { site: 'ChatGPT', status: 'ok', ms: 101, label: '可连接' },
  { site: 'Claude', status: 'timeout', ms: null, label: '超时或无法连接' },
  { site: 'Gemini', status: 'ok', ms: 96, label: '可连接' },
  { site: 'GitHub', status: 'ok', ms: 28, label: '可连接' },
  { site: 'Telegram', status: 'slow', ms: 201, label: '较慢' },
  { site: 'Netflix', status: 'slow', ms: 271, label: '较慢' },
  { site: 'Disney+', status: 'ok', ms: 57, label: '可连接' },
  { site: 'Spotify', status: 'ok', ms: 127, label: '可连接' },
  { site: 'TikTok', status: 'ok', ms: 46, label: '可连接' },
  { site: 'X', status: 'slow', ms: 311, label: '较慢' },
  { site: 'Steam', status: 'slow', ms: 250, label: '较慢' },
  { site: 'Cloudflare', status: 'ok', ms: 49, label: '可连接' },
  { site: 'Wikipedia', status: 'slow', ms: 222, label: '较慢' },
];

/** 由原始数字直接计算的派生指标（页面展示时同时写出算法） */
const s = LDY_SPEEDTEST;
const down = s.downloadMbps!;
const up = s.uploadMbps!;
const idle = s.idleLatencyMs!;
const ld = s.loadedDownloadLatencyMs!;
const lu = s.loadedUploadLatencyMs!;
const jit = s.jitterMs!;
const r1 = (x: number) => Math.round(x * 10) / 10;

export const LDY_DERIVED = {
  downloadToUploadRatio: r1(down / up), // 21.2 / 1.52
  downloadLatencyIncreaseMs: ld - idle, // 208 - 118
  downloadLatencyIncreasePct: r1(((ld - idle) / idle) * 100),
  uploadLatencyIncreaseMs: lu - idle, // 233 - 118
  uploadLatencyIncreasePct: r1(((lu - idle) / idle) * 100),
  jitterToIdlePct: r1((jit / idle) * 100),
  youtubeBufferMinutes: r1(80.84 / 60),
  /** 整理图所有来源及其时间，供页面逐项写明 */
  timeline: [
    { key: 'nodes', label: '节点在线核验', when: '2026-10-21 18:57:32–18:58:30（北京时间）', window: '晚间 18:00–20:00' },
    { key: 'speed', label: '新加坡网页测速', when: '截图没有可见日期', window: '无法归入任何时段' },
    { key: 'youtube', label: 'YouTube Stats for nerds', when: '2026-10-24 23:04:55（中国标准时间）', window: '预设窗口之外（晚高峰结束后 4 分钟）' },
    { key: 'peak', label: '晚高峰复测：网页测速 + 网站连通性', when: '2026-10-28 约 21:26（北京时间）', window: '晚高峰 20:00–23:00' },
  ],
  source: IMG,
} as const;


/** 晚高峰复测的网站连通性（2026-10-28 21:26，原图转录；每个网站连 4 次取中位数） */
export const LDY_PEAK_REACHABILITY: ReachabilityRow[] = [
  { site: 'Google', status: 'ok', ms: 83, label: '可连接' },
  { site: 'YouTube', status: 'ok', ms: 79, label: '可连接' },
  { site: 'ChatGPT', status: 'ok', ms: 97, label: '可连接' },
  { site: 'Claude', status: 'timeout', ms: null, label: '超时或无法连接' },
  { site: 'Gemini', status: 'ok', ms: 92, label: '可连接' },
  { site: 'GitHub', status: 'ok', ms: 92, label: '可连接' },
  { site: 'Telegram', status: 'slow', ms: 188, label: '较慢' },
  { site: 'Netflix', status: 'veryslow', ms: 346, label: '很慢' },
  { site: 'Disney+', status: 'ok', ms: 112, label: '可连接' },
  { site: 'Spotify', status: 'ok', ms: 118, label: '可连接' },
  { site: 'TikTok', status: 'ok', ms: 37, label: '可连接' },
  { site: 'X', status: 'slow', ms: 199, label: '较慢' },
  { site: 'Steam', status: 'slow', ms: 286, label: '较慢' },
  { site: 'Cloudflare', status: 'ok', ms: 58, label: '可连接' },
  { site: 'Wikipedia', status: 'slow', ms: 269, label: '较慢' },
];
