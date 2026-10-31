/**
 * 灵动云 2026-10-28 晚高峰实测：香港、美国（新加坡那次在 lingdongyun-sg-2026-10.ts，页面一起展示）。
 *
 * 香港（站长提供三张原图）：
 *  - 测速截图：没有时钟；出口中国香港（Private Customer，AS32167），测速节点 HKG；
 *  - 网站连通性截图：同一页面，右下角系统时钟 2026-10-28 21:43；
 *  - YouTube Stats for nerds：截图内 Date 字段 2026-10-28 21:45:51 GMT+0800。
 *
 * 美国（站长提供两张原图）：
 *  - 测速截图：右下角系统时钟 2026-10-28 21:41；出口美国 Draper（Komi LLC，AS401243），测速节点 SLC（盐湖城）。
 *  - 网站连通性截图：没有时钟，站长 21:30 发来，测速截图是之后“重新测速”的结果，所以两者不是同一次测试。
 */
import { makeRecord } from '../test-helpers';
import type { EvidenceFile, TestRecord } from '../types';
import type { ReachabilityRow } from './lingdongyun-sg-2026-10';

export const LDY_PEAK_PAGE_PATH = '/airports/lingdongyun/peak-2026-10-28/';
export const LDY_PEAK_PAGE_TITLE = '灵动云晚高峰三地实测：香港、新加坡、美国节点速度与网站连通性';
export const LDY_PEAK_PAGE_PUBLISHED = '2026-10-28';
export const LDY_PEAK_PAGE_MODIFIED = '2026-10-31';

export const LDY_HK_EVIDENCE: EvidenceFile[] = [
  {
    evidenceId: 'ldy-hk-peak-speedtest-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰香港节点网页测速原图（2026-10-28）',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/hk-peak-speedtest-2026-10-28.png',
    expected: true,
    description: '出口 IP 在中国香港（Private Customer，AS32167），测速节点 HKG；含下载、上传、延迟、抖动和三条曲线。截图本身没有时钟。',
    capturedAtText: '截图内没有时钟；同一页面的连通性截图显示 2026-10-28 21:43',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-hk-peak-reachability-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰香港节点网站连通性原图（2026-10-28 21:43）',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/hk-peak-reachability-2026-10-28.png',
    expected: true,
    description: '同一个测速页下方的 15 个网站连通性（每个网站连 4 次取中位数），右下角系统时钟 2026-10-28 21:43。',
    capturedAtText: '2026-10-28 21:43（截图里的电脑系统时钟）',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-hk-peak-youtube-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰香港节点 YouTube「Stats for nerds」原图（2026-10-28 21:45:51）',
    kind: 'youtube-stats-screenshot',
    publicPath: '/evidence/lingdongyun/hk-peak-youtube-2026-10-28.png',
    expected: true,
    description: '720p 播放：Connection Speed 5061 Kbps、Buffer Health 47.28 秒、掉帧 13/750；截图内 Date 为 2026-10-28 21:45:51 GMT+0800。',
    capturedAtText: '2026-10-28 21:45:51（中国标准时间，截图内 Date 字段）',
    isOriginal: true,
  },
];

export const LDY_US_EVIDENCE: EvidenceFile[] = [
  {
    evidenceId: 'ldy-us-peak-speedtest-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰美国节点网页测速原图（2026-10-28 21:41）',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/us-peak-speedtest-2026-10-28.png',
    expected: true,
    description: '出口 IP 在美国 Draper（Komi LLC，AS401243），测速节点 SLC（盐湖城）；含下载、上传、延迟、抖动和三条曲线，右下角系统时钟 2026-10-28 21:41。',
    capturedAtText: '2026-10-28 21:41（截图里的电脑系统时钟）',
    isOriginal: true,
  },
  {
    evidenceId: 'ldy-us-peak-reachability-20261028',
    brandId: 'lingdongyun',
    title: '晚高峰美国节点网站连通性原图（2026-10-28 晚）',
    kind: 'speedtest-screenshot',
    publicPath: '/evidence/lingdongyun/us-peak-reachability-2026-10-28.png',
    expected: true,
    description: '15 个网站连通性（每个网站连 4 次取中位数）。截图没有时钟，站长在 2026-10-28 21:30 发来。',
    capturedAtText: '截图没有时钟；站长 2026-10-28 21:30 提供',
    isOriginal: true,
  },
];

export const LDY_US_PEAK: TestRecord = makeRecord({
  testId: 'a-lingdongyun-us-speedtest-20261028-peak',
  brandId: 'lingdongyun',
  nodeRegion: 'US',
  nodeDisplayName: '美国节点（截图未显示具体编号）',
  recordKind: 'speedtest',
  originISP: '中国联通（站长自述）',
  sourceType: 'A',
  publishedAt: '2026-10-28',
  testDateTime: '2026-10-28T21:41:00+08:00',
  testDateText: '2026-10-28 21:41（北京时间，截图里的系统时钟）',
  testServer: 'Cloudflare（测速节点 SLC 盐湖城）',
  testMethod: '网页测速：下载 50MB、上传 15MB（本次共用 34MB 流量）；代理检查显示出口在美国，测速流量经过代理',
  downloadMbps: 7.07,
  uploadMbps: 9.06,
  idleLatencyMs: 101,
  loadedDownloadLatencyMs: 248,
  loadedUploadLatencyMs: 438,
  jitterMs: 22.5,
  packetLossPercent: null,
  sampleCount: 1,
  evidenceIds: ['ldy-us-peak-speedtest-20261028'],
  extraMetrics: {
    pageDetectedNetwork: { value: 'Komi LLC (AS401243)，Draper' },
    downloadPeakMbps: { value: 9.01, unit: 'Mbps（下载曲线峰值）' },
    uploadPeakMbps: { value: 24.1, unit: 'Mbps（上传曲线峰值）' },
    latencyPeakMs: { value: 199, unit: 'ms（延迟曲线最高点）' },
  },
  notes:
    '晚高峰单次测速：下载 7.07 Mbps、上传 9.06 Mbps，空载延迟 101 ms；下载时延迟升到 248 ms，上传时升到 438 ms；抖动 22.5 ms。丢包率浏览器无法测（需要 UDP），记为“未测得”。',
  caveats: [
    '单次测试，只能说明这一晚这一刻的状态；要判断美国节点晚高峰是否稳定，需要连续多天在同一时段重复测试。',
    '截图没有显示具体是哪个美国节点，本地宽带运营商为站长自述的中国联通（截图上看不到），带宽没有记录。',
    '测速页给出的“使用场景评分”（网页与 AI 对话优秀、高清视频一般、视频会议良好、在线游戏一般）评分规则不公开，本站不采用。',
  ],
  isVerified: true,
});

/** 美国节点网站连通性（原图转录；截图没有时钟，不是与测速同一次） */
export const LDY_US_REACHABILITY: ReachabilityRow[] = [
  { site: 'Google', status: 'slow', ms: 244, label: '较慢' },
  { site: 'YouTube', status: 'slow', ms: 248, label: '较慢' },
  { site: 'ChatGPT', status: 'veryslow', ms: 343, label: '很慢' },
  { site: 'Claude', status: 'timeout', ms: null, label: '超时或无法连接' },
  { site: 'Gemini', status: 'slow', ms: 268, label: '较慢' },
  { site: 'GitHub', status: 'slow', ms: 278, label: '较慢' },
  { site: 'Telegram', status: 'veryslow', ms: 358, label: '很慢' },
  { site: 'Netflix', status: 'slow', ms: 272, label: '较慢' },
  { site: 'Disney+', status: 'slow', ms: 235, label: '较慢' },
  { site: 'Spotify', status: 'slow', ms: 297, label: '较慢' },
  { site: 'TikTok', status: 'slow', ms: 233, label: '较慢' },
  { site: 'X', status: 'slow', ms: 246, label: '较慢' },
  { site: 'Steam', status: 'veryslow', ms: 304, label: '很慢' },
  { site: 'Cloudflare', status: 'slow', ms: 218, label: '较慢' },
  { site: 'Wikipedia', status: 'slow', ms: 274, label: '较慢' },
];


export const LDY_HK_PEAK: TestRecord = makeRecord({
  testId: 'a-lingdongyun-hk-speedtest-20261028-peak',
  brandId: 'lingdongyun',
  nodeRegion: 'HK',
  nodeDisplayName: '香港节点（截图未显示具体编号）',
  recordKind: 'speedtest',
  originISP: '中国联通（站长自述）',
  sourceType: 'A',
  publishedAt: '2026-10-28',
  testDateTime: '2026-10-28T21:43:00+08:00',
  testDateText: '2026-10-28 约 21:43（北京时间，取自同一页面连通性截图里的系统时钟）',
  testServer: 'Cloudflare（测速节点 HKG 香港）',
  testMethod: '网页测速：下载 50MB、上传 15MB（本次共用 44MB 流量）；代理检查显示出口在中国香港，测速流量经过代理',
  downloadMbps: 10.8,
  uploadMbps: 16,
  idleLatencyMs: 84.1,
  loadedDownloadLatencyMs: 237,
  loadedUploadLatencyMs: 407,
  jitterMs: 6.25,
  packetLossPercent: null,
  sampleCount: 1,
  evidenceIds: ['ldy-hk-peak-speedtest-20261028', 'ldy-hk-peak-reachability-20261028'],
  extraMetrics: {
    pageDetectedNetwork: { value: 'Private Customer (AS32167)，Hong Kong' },
    downloadPeakMbps: { value: 14.3, unit: 'Mbps（下载曲线峰值）' },
    uploadPeakMbps: { value: 25.4, unit: 'Mbps（上传曲线峰值）' },
    latencyPeakMs: { value: 97.8, unit: 'ms（延迟曲线最高点）' },
  },
  notes:
    '晚高峰单次测速：下载 10.8 Mbps、上传 16.0 Mbps，空载延迟 84.1 ms；下载时延迟升到 237 ms，上传时升到 407 ms；抖动 6.25 ms。丢包率浏览器无法测（需要 UDP），记为“未测得”。',
  caveats: [
    '测速截图本身没有时钟；时间取自同一页面下方连通性截图里的系统时钟（21:43），测速完成时间应在这之前不久，仍在 20:00–23:00 晚高峰窗口内。',
    '单次测试，只能说明这一晚这一刻的状态；截图没有显示是哪一个香港节点，本地宽带运营商为站长自述的中国联通（截图上看不到），带宽没有记录。',
  ],
  isVerified: true,
});

export const LDY_HK_YOUTUBE: TestRecord = makeRecord({
  testId: 'a-lingdongyun-hk-youtube-20261028-peak',
  brandId: 'lingdongyun',
  nodeRegion: 'HK',
  nodeDisplayName: '香港节点（截图未显示具体编号）',
  recordKind: 'youtube',
  originISP: '中国联通（站长自述）',
  sourceType: 'A',
  publishedAt: '2026-10-28',
  testDateTime: '2026-10-28T21:45:51+08:00',
  testDateText: '2026-10-28 21:45:51（中国标准时间 GMT+0800，截图内 Date 字段）',
  testMethod: 'YouTube 播放器「Stats for nerds」截图（香港节点）',
  youtubeQuality: '1280×720@25（Current Res 与 Optimal Res 相同）',
  youtubeBufferSeconds: 47.28,
  sampleCount: 1,
  evidenceIds: ['ldy-hk-peak-youtube-20261028'],
  extraMetrics: {
    connectionSpeedKbps: { value: 5061, unit: 'Kbps（播放器估算的连接速度）' },
    droppedFrames: { value: '13 / 750' },
    viewport: { value: '1337×752' },
    codecs: { value: 'av01.0.05M.08 (398) / opus (251)' },
  },
  notes:
    '晚高峰 720p 播放观察：Buffer Health 47.28 秒，掉帧 13/750（约 1.7%），Connection Speed 5061 Kbps（约 5.1 Mbps）。截图时 Network Activity 为 0 KB，说明缓冲已经足够、播放器暂时没有在下载。',
  caveats: [
    'YouTube 的 Date 字段是电脑的系统时间和时区（GMT+0800），能证明这次观察的时间；但它不能单独证明测试者所在的地点。',
    '只观察了一段视频；Connection Speed 是播放器自己的估算，比同一时段网页测速的 10.8 Mbps 低，两者方法不同，不能直接比较。',
  ],
  isVerified: true,
});

/** 香港节点网站连通性（2026-10-28 21:43，原图转录） */
export const LDY_HK_REACHABILITY: ReachabilityRow[] = [
  { site: 'Google', status: 'ok', ms: 87, label: '可连接' },
  { site: 'YouTube', status: 'ok', ms: 79, label: '可连接' },
  { site: 'ChatGPT', status: 'ok', ms: 74, label: '可连接' },
  { site: 'Claude', status: 'timeout', ms: null, label: '超时或无法连接' },
  { site: 'Gemini', status: 'ok', ms: 120, label: '可连接' },
  { site: 'GitHub', status: 'ok', ms: 96, label: '可连接' },
  { site: 'Telegram', status: 'veryslow', ms: 390, label: '很慢' },
  { site: 'Netflix', status: 'slow', ms: 292, label: '较慢' },
  { site: 'Disney+', status: 'ok', ms: 84, label: '可连接' },
  { site: 'Spotify', status: 'ok', ms: 70, label: '可连接' },
  { site: 'TikTok', status: 'ok', ms: 68, label: '可连接' },
  { site: 'X', status: 'slow', ms: 223, label: '较慢' },
  { site: 'Steam', status: 'slow', ms: 232, label: '较慢' },
  { site: 'Cloudflare', status: 'ok', ms: 107, label: '可连接' },
  { site: 'Wikipedia', status: 'veryslow', ms: 304, label: '很慢' },
];
