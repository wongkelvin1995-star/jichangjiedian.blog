/**
 * 灵动云 2026-10-31 晚间新加坡节点复测（站长提供五张原图）。
 *  - YouTube「Stats for nerds」：截图内 Date 字段 2026-10-31 20:41:07 GMT+0800；
 *  - Cloudflare 网页测速：节点 SIN（新加坡），截图任务栏时钟 2026-10-31 21:30（只保留时钟，其余任务栏内容已遮挡）；
 *  - IP 探针：出口在新加坡，AS9664（SOUTHEAST ASIA TELECOM(SG)）；该截图显示完整 IP，按站内规则不发布；
 *  - 网站连通性：两张截图，都没有时钟，数值互不相同，不是同一次，本站只作证据附上，不转录成表。
 * 测速时间取截图时钟 21:30：它证明截图在 21:30 拍下，测速本身不晚于这个时间。
 */
import { makeRecord } from '../test-helpers';
import type { AvailabilitySnapshot, EvidenceFile, TestRecord } from '../types';

const B = '/evidence/lingdongyun';
export const LDY_SG1031_EVIDENCE: EvidenceFile[] = [
  { evidenceId: 'ldy-sg-1031-speedtest', brandId: 'lingdongyun', title: '新加坡节点网页测速原图（2026-10-31 晚）', kind: 'speedtest-screenshot', publicPath: `${B}/sg-peak-speedtest-2026-10-31.png`, expected: true, description: 'Cloudflare 测速，节点 SIN 新加坡；下载 13.31 Mb/s、上传 4.02 Mb/s、延迟 135 ms、抖动 18.27 ms，满载延迟下载 271.1 ms、上传 137.8 ms。出口 IP 已遮挡，任务栏只保留右下角时钟（21:30，2026/10/31）。', capturedAtText: '截图任务栏时钟 2026-10-31 21:30（中国标准时间）', isOriginal: true },
  { evidenceId: 'ldy-sg-1031-youtube', brandId: 'lingdongyun', title: '新加坡节点 YouTube「Stats for nerds」原图（2026-10-31 20:41:07）', kind: 'youtube-stats-screenshot', publicPath: `${B}/sg-peak-youtube-2026-10-31.png`, expected: true, description: 'Current Res 854×480@24，Optimal Res 1280×720@24；Connection Speed 4851 Kbps，Buffer Health 66.14 秒，掉帧 0/1112；截图内 Date 为 2026-10-31 20:41:07 GMT+0800。', capturedAtText: '2026-10-31 20:41:07（中国标准时间，截图内 Date 字段）', isOriginal: true },
  { evidenceId: 'ldy-sg-1031-reach-a', brandId: 'lingdongyun', title: '新加坡节点网站连通性原图 A（2026-10-31 晚，无时钟）', kind: 'speedtest-screenshot', publicPath: `${B}/sg-peak-reachability-a-2026-10-31.png`, expected: true, description: '14 个网站的连通性：多数显示“可用”，延迟约 16–366 ms，Netflix 366 ms、HBO Max 228 ms 为橙色。与截图 B 不是同一次。', capturedAtText: '截图内没有时钟', isOriginal: true },
  { evidenceId: 'ldy-sg-1031-reach-b', brandId: 'lingdongyun', title: '新加坡节点网站连通性原图 B（2026-10-31 晚，无时钟）', kind: 'speedtest-screenshot', publicPath: `${B}/sg-peak-reachability-b-2026-10-31.png`, expected: true, description: '同样 14 个网站，数值与 A 不同（Google 138 ms、YouTube 152 ms、Claude 174 ms、ChatGPT 158 ms、Netflix 350 ms、Disney+ 188 ms）。是另一次连通性测试。', capturedAtText: '截图内没有时钟', isOriginal: true },
];

export const LDY_SG1031_SPEED: TestRecord = makeRecord({
  testId: 'a-lingdongyun-sg-speedtest-20261031',
  brandId: 'lingdongyun',
  nodeRegion: 'SG',
  nodeDisplayName: '新加坡节点（截图未显示节点编号）',
  recordKind: 'speedtest',
  originCountry: 'CN',
  originCity: '广东（站长自述，未写明具体城市）',
  originISP: '中国联通（站长自述）',
  sourceType: 'A',
  publishedAt: '2026-10-31',
  testDateTime: '2026-10-31T21:30:00+08:00',
  testDateText: '2026-10-31 21:30（截图任务栏时钟；测速完成时间不晚于此刻）',
  testServer: 'Cloudflare（测速节点 SIN 新加坡）',
  testMethod: '网页测速：下载 50MB、上传 15MB；出口 IP 探针显示在新加坡（AS9664；完整 IP 与探针截图按站内规则不发布）',
  downloadMbps: 13.31,
  uploadMbps: 4.02,
  idleLatencyMs: 135,
  loadedDownloadLatencyMs: 271.1,
  loadedUploadLatencyMs: 137.8,
  jitterMs: 18.27,
  packetLossPercent: null,
  sampleCount: 1,
  evidenceIds: ['ldy-sg-1031-speedtest'],
  notes: '单次网页测速：下载 13.31 Mbps、上传 4.02 Mbps，延迟 135 ms，抖动 18.27 ms；满载延迟下载时 271.1 ms、上传时 137.8 ms。测速页给出的“在线视频、在线游戏、视频会议”质量分均为“差”，评分规则不公开，本站不采用。丢包率浏览器无法测，记为“未测得”。',
  caveats: [
    '21:30 是截图时电脑的系统时钟，能证明截图时间；测速页保留着上一次的结果，具体测速时刻只能说“不晚于 21:30”。图中任务栏的其他内容已遮挡。',
    '单次测试，只代表那一刻；测试者的宽带运营商是站长自述的中国联通（截图上看不到），所在地为站长自述的广东，本地带宽没有记录。',
  ],
  isVerified: true,
});

export const LDY_SG1031_YOUTUBE: TestRecord = makeRecord({
  testId: 'a-lingdongyun-sg-youtube-20261031',
  brandId: 'lingdongyun',
  nodeRegion: 'SG',
  nodeDisplayName: '新加坡节点',
  recordKind: 'youtube',
  originCountry: 'CN',
  originCity: '广东（站长自述，未写明具体城市）',
  originISP: '中国联通（站长自述）',
  sourceType: 'A',
  publishedAt: '2026-10-31',
  testDateTime: '2026-10-31T20:41:07+08:00',
  testDateText: '2026-10-31 20:41:07（中国标准时间 GMT+0800，截图内 Date 字段）',
  testMethod: 'YouTube 播放器「Stats for nerds」截图（新加坡节点）',
  youtubeQuality: '854×480@24（Current Res；Optimal Res 为 1280×720@24）',
  youtubeBufferSeconds: 66.14,
  sampleCount: 1,
  evidenceIds: ['ldy-sg-1031-youtube'],
  extraMetrics: {
    connectionSpeedKbps: { value: 4851, unit: 'Kbps（播放器估算的连接速度）' },
    droppedFrames: { value: '0 / 1112' },
    viewport: { value: '1331×749' },
    codecs: { value: 'av01.0.04M.08 (397) / opus (251)' },
  },
  notes: '晚间播放观察：Buffer Health 66.14 秒，掉帧 0/1112，Connection Speed 4851 Kbps（约 4.9 Mbps）。当前分辨率 854×480，低于播放器认为的最优 1280×720，说明这一刻播放器选择了较低画质。Network Activity 为 0 KB，缓冲充足、暂时没有下载。',
  caveats: [
    'Date 字段是电脑的系统时间和时区，能证明观察时间，不能单独证明测试者所在地点。',
    '只观察了一段视频；Connection Speed 是播放器自己的估算，与网页测速方法不同，不能直接比较。',
  ],
  isVerified: true,
});

/** 节点在线快照（2026-10-31）：站长提供的后台节点面板截图 4 张，逐行转录；原图含后台面板，按站长要求不公开 */
export const LDY_AVAILABILITY_1031: AvailabilitySnapshot = {
  snapshotId: 'a-lingdongyun-nodes-20261031',
  brandId: 'lingdongyun',
  checkedFrom: '2026-10-31T21:37:33+08:00',
  checkedTo: '2026-10-31T21:38:25+08:00',
  timezone: 'Asia/Shanghai',
  totalNodes: 60,
  onlineNodes: 60,
  byRegion: [
    { countryCode: 'HK', label: '香港', online: 20, total: 20 },
    { countryCode: 'TW', label: '台湾', online: 10, total: 10 },
    { countryCode: 'JP', label: '日本', online: 10, total: 10 },
    { countryCode: 'SG', label: '新加坡', online: 10, total: 10 },
    { countryCode: 'US', label: '美国', online: 10, total: 10 },
  ],
  trafficMultiplier: '全部 1x',
  sourceType: 'A',
  evidenceIds: [],
  caveats: [
    '这是后台面板在一个时间点显示的节点在线状态，不等于速度、延迟或长期可用率。',
    '60 个节点（编号 1–60）逐行核对：香港 20、台湾 10、日本 10、新加坡 10、美国 10，“最后检查”时间都在 21:37–21:38 之间，倍率都是 1x；面板里没有韩国等其他地区的节点。',
    '原图含后台面板，按站长要求不公开，页面只转录各地区在线数；没有原图可供读者自行核对，所以这一条只说明站长看到的面板状态。',
  ],
};
