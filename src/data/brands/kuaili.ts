import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't22'; // 页面存档：第三方评测页“快狸(KuaiLi)”（页面日期 2026-10-16）
const M = 'm22';
const D = '2026-10-16';
const TEST = '2026-06-27';
const plan = planFactory({ brandId: 'kuaili', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';

const tier = (gb: number, m: number, q: number, y: number): OfferInput[] => [
  { period: 'monthly', price: m, monthlyGB: gb, reset: RESET },
  { period: 'quarterly', price: q, monthlyGB: gb, reset: RESET },
  { period: 'annual', price: y, monthlyGB: gb, reset: RESET },
];

export default seed({
  slug: 'kuaili',
  displayRank: 29,
  brandName: '快狸 KuaiLi',
  shortName: '快狸',
  nameEn: 'KuaiLi',
  aliases: ['快狸', 'KuaiLi', 'kuaili', 'KuaiLi VPN', '快狸梯子', '快狸机场'],
  uploadFileNo: 22,
  summary:
    '快狸的页面存档（第三方评测页，2026-10-16）列出一个年付小套餐、一个月付小套餐和四档周期套餐。页面明确写“当前没有可用于判断实际速度的有效测速图”，只有网络拓扑图和一张流媒体解锁图；该解锁图的时间戳与结果同样出现在星岛梦页面中，归属存疑。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“快狸(KuaiLi)”与站长给定名称一致。'],
  },
  plans: [
    plan('annual-pack', '年付小套餐', 'annual-small', [
      { period: 'annual', price: 120, monthlyGB: 30, reset: RESET, note: '页面：30GB/月，需一次支付 ¥120，折合约 ¥10/月；页面未展示月付、季付。' },
    ]),
    plan('monthly-pack', '月付小套餐', 'monthly-tier', [
      { period: 'monthly', price: 15, monthlyGB: 50, reset: RESET, note: '页面：50GB/月；页面未展示季付、年付。' },
    ]),
    plan('basic', '小狸基础版', 'monthly-tier', tier(100, 22, 62, 255)),
    plan('standard', '灵狸标准版', 'monthly-tier', tier(250, 35, 103, 415)),
    plan('strong', '夜狸强化版', 'monthly-tier', tier(500, 95, 290, 1025)),
    plan('top', '天狸顶配版', 'monthly-tier', tier(1000, 180, 535, 2140)),
  ],
  regions: [
    region('JP', '日本', null, 'C', [T], { recordedAt: D, nodeNames: ['JP日本01'], note: '页面写“节点覆盖香港、台湾、日本、新加坡、美国及其他页面所列地区”；节点名取自归属存疑的解锁图摘录。' }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D, nodeNames: ['SG新加坡01'] }),
    region('US', '美国', null, 'C', [T], { recordedAt: D, nodeNames: ['US美国01'] }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D, nodeNames: ['TW台湾10'] }),
    region('HK', '香港', null, 'C', [T], { recordedAt: D, nodeNames: ['HK香港18'] }),
  ],
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: TEST, note: '来自解锁图摘录页脚“VLESS 节点”标注（该图归属存疑），不是官方协议列表。' }),
  routeTypes: claim(null, 'D', [T, M], { note: '页面只写“负载均衡、动态加速、晚高峰不限速保障”，没有写 IPLC / IEPL；汇编资料库的“动态加速专线”不是线路类型。' }),
  clients: claim(['通用订阅（兼容多种代理客户端）'], 'C', [T], { recordedAt: D }),
  streaming: claim(['Netflix', 'Disney+', 'HBO Max', 'YouTube', 'Spotify', 'Hulu', 'TikTok'], 'C', [T], {
    recordedAt: D,
    note: '页面称原生 IP 节点支持这些平台。页面的解锁图摘录里 Netflix 在日本01、香港18 为 N/A，TikTok 在日本01、台湾10、香港18 失败，台湾10 的 Netflix 与 Disney+ 显示解锁 GB；但该图的时间戳与结果同样出现在星岛梦页面，归属存疑，本站不把它当作快狸的证据。',
  }),
  ai: claim(['ChatGPT', 'Copilot', 'Gemini'], 'C', [T], { recordedAt: D, note: '页面称可用，本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制同时在线客户端数量”，页面存档没有此项。' }),
  multiplier: claim(null, 'D', [M], { note: '页面存档没有写节点倍率；汇编资料库的“动态加速负载均衡”不是倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '页面自己写明：“当前页面只有网络拓扑和流媒体解锁记录，没有有效的实际测速图，因此不能据此判断本地速度。”页面的表里只有 TLS RTT / HTTPS 延迟，不是下载速度；本站对快狸没有任何速度数据。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“负载均衡、动态加速和晚高峰不限速”，属于服务商宣称。表内季付、年付价格是页面标价，实付以结算页为准，本站不发布页面提到的优惠码。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'kuaili-shared-unlock-image',
      field: '解锁图归属',
      summary: '2026-06-27 15:11:12 的解锁图（日本01、新加坡01 的结果）同时出现在快狸与星岛梦两个页面中，结果一致，无法确定它属于哪一家。',
      variants: [
        { label: '快狸页面：历史解锁图 2026-06-27 15:11:12（五行）', sourceId: T, grade: 'C' },
        { label: '星岛梦页面：独立解锁图 2026-06-27 15:11:12（日本01、新加坡01）', sourceId: 't08', grade: 'C' },
      ],
      handling: '该解锁图不作为快狸或星岛梦任何一家的证据；解锁行记录降为 D 级并保留“归属存疑”说明。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
