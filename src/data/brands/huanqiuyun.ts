import { claim, planFactory, region, seed } from '../helpers';

const T = 't32'; // 站长最初提供的页面存档：同名云计算/CDN 公司“环球云”，与机场无关
const M = 'm32';
const G = 'tp-2026-10-20'; // 第三方评测资料（资料日期 2026-10-20），品牌名“环球梯”
const PK = 'tp-2026-09-22-huanqiuti'; // 第三方对比资料（价格核对于 2026-09-22），品牌名“环球梯”
const O = 'owner-2026-10-28';
const plan = planFactory({ brandId: 'huanqiuyun', src: G, recorded: '2026-10-20' });
const PK_NOTE = (v: string) => `另一家对比站 2026-09-22 的记录是 ${v}。`;

export default seed({
  slug: 'huanqiuyun',
  displayRank: 32,
  brandName: '环球云',
  shortName: '环球云',
  nameEn: null,
  aliases: ['环球云', '环球梯', 'huanqiuyun', 'huanqiuti', '环球云机场', '环球梯机场'],
  uploadFileNo: 32,
  summary:
    '环球云在第三方资料里的名字是“环球梯”，站长已确认是同一家。2026-10-20 的资料显示：月付三档（环球轻享 ¥21 / 140GB、环球畅游 ¥39 / 280GB、环球尊享 ¥69 / 600GB），按套餐限 3 / 5 / 10 台设备，另有年付学生套餐和两个 365 天有效的流量包；60 个节点，覆盖香港、台湾、日本、新加坡、美国，协议 VLESS。站长 Excel 另记有一档“环球微享 ¥12 / 70GB”。',
  identity: {
    status: 'owner-confirmed',
    notes: [
      '第三方资料里的品牌名是“环球梯”，站长提供的推广入口域名也含 huanqiuti。站长于 2026-10-28 确认环球云就是环球梯；本站使用“环球云”，保留“环球梯”作为别名。',
      '站长最初提供的“环球云”页面存档其实是一家同名的云计算/CDN 公司，与这家机场无关，本站不使用其中任何内容。',
      '“环球云”与“全球云（Global Cloud）”是不同品牌，本站不合并。',
    ],
  },
  plans: [
    plan('light', '环球轻享', 'monthly-tier', [{ period: 'monthly', price: 21, monthlyGB: 140, note: `限 3 台设备。${PK_NOTE('¥23 / 每月 120GB')}` }]),
    plan('travel', '环球畅游', 'monthly-tier', [{ period: 'monthly', price: 39, monthlyGB: 280, note: `限 5 台设备。${PK_NOTE('¥39 / 每月 240GB')}` }]),
    plan('premium', '环球尊享', 'monthly-tier', [{ period: 'monthly', price: 69, monthlyGB: 600, note: `限 10 台设备。${PK_NOTE('¥69 / 每月 600GB，两份资料一致')}` }]),
    plan('student', '环球学生套餐（年付）', 'annual-small', [{ period: 'annual', price: 96, monthlyGB: 60, note: `限 3 台设备，折合约 ¥8/月。${PK_NOTE('同样是 ¥96 / 每月 60GB')}` }]),
    plan('pack-80', '环球随行包', 'one-time-pack', [{ period: 'one-time', price: 99, totalGB: 80, reset: '365 天内有效，最多 5 台设备', note: '流量包有效期是 365 天，不是永久。' }]),
    plan('pack-400', '环球灵活包', 'one-time-pack', [{ period: 'one-time', price: 299, totalGB: 400, reset: '365 天内有效，最多 8 台设备', note: '流量包有效期是 365 天，不是永久。' }]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [G], { recordedAt: '2026-10-20' }),
    region('TW', '台湾', null, 'C', [G], { recordedAt: '2026-10-20' }),
    region('JP', '日本', null, 'C', [G], { recordedAt: '2026-10-20' }),
    region('SG', '新加坡', null, 'C', [G], { recordedAt: '2026-10-20' }),
    region('US', '美国', null, 'C', [G], { recordedAt: '2026-10-20' }),
  ],
  nodeCount: claim(60, 'C', [G], { recordedAt: '2026-10-20', note: '第三方资料称服务商截图显示 60 个节点，没有分地区数量。' }),
  protocols: claim(['VLESS'], 'C', [G], { recordedAt: '2026-10-20' }),
  routeTypes: claim(['iplc'], 'C', [G], { recordedAt: '2026-10-20', note: '第三方资料注明这是推广站的说法，未经独立核验。' }),
  clients: claim(['官方客户端（Windows / macOS / Android）', 'iOS：Nextin', '第三方客户端：找客服要通用订阅'], 'C', [G], { recordedAt: '2026-10-20' }),
  streaming: claim(null, 'D', [G], { note: '只有服务商 2026-09-23 的检测图：台湾、新加坡节点 Netflix 与 Disney+ 有通过记录，香港、美国节点 Disney+ 有失败记录。本站未测试。' }),
  ai: claim(null, 'D', [G], { note: '第三方资料称暂无可核验的 AI 测试；2026-09-27 有第三方测得美国出口为机房 IP。' }),
  deviceLimit: claim('按套餐限 3 / 5 / 10 台；流量包最多 5 / 8 台', 'C', [G, PK], { recordedAt: '2026-10-20' }),
  multiplier: claim(null, 'D', [G], { note: '两份第三方资料都没有写倍率。' }),
  notices: [
    {
      type: 'identity',
      severity: 'warn',
      text: '注意同名：站长最初提供的“环球云”页面存档属于一家云计算/CDN 公司，和这家机场无关。另外，t.me/huanqiuti 是一个体育博彩账号，也不是环球梯的官方频道；第三方资料给出的官方交流群是 @huanqiuti88。',
      sourceIds: [T, G],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '2026-10-20 的第三方资料：所有套餐不限速；退款条款没有公开，建议先咨询客服；2026 年 9 月上线，2026-10-17 启用了新的面板镜像域名。另有第三方 2026-09-27 测得美国节点下载约 120 Mbps（单次，本站未核验）。',
      sourceIds: [G],
    },
  ],
  conflicts: [
    {
      conflictId: 'huanqiuyun-price-versions',
      field: '月付套餐的流量',
      summary: '两份第三方资料的日期不同，环球轻享与环球畅游的价格或流量不一样。',
      variants: [
        { label: '2026-10-20：轻享 ¥21 / 140GB、畅游 ¥39 / 280GB、尊享 ¥69 / 600GB', sourceId: G, grade: 'C' },
        { label: '2026-09-22：轻享 ¥23 / 120GB、畅游 ¥39 / 240GB、尊享 ¥69 / 600GB', sourceId: PK, grade: 'C' },
        { label: '站长 Excel：环球微享 ¥12 / 70GB（两份第三方资料都没有这一档）', sourceId: 'owner-sheet', grade: 'C' },
      ],
      handling: '按日期较新的 2026-10-20 资料录入；最低价按站长 Excel 另列“环球微享”。',
    },
  ],
  editorialNotes: [
    '这条记录提醒读者：同名的企业网站并不等于同名的机场。购买前请确认推广入口、域名和服务内容是否一致。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, G, PK, O],
});
