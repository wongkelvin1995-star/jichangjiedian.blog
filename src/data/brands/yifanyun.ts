import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't18'; // 页面存档：机场推荐与测评站“一翻云(1fly)”（页面日期 2026-10-16）
const M = 'm18';
const D = '2026-10-16';
const plan = planFactory({ brandId: 'yifanyun', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';

const tier = (gb: number, m: number, q: number, y: number): OfferInput[] => [
  { period: 'monthly', price: m, monthlyGB: gb, reset: RESET },
  { period: 'quarterly', price: q, monthlyGB: gb, reset: RESET },
  { period: 'annual', price: y, monthlyGB: gb, reset: RESET },
];

export default seed({
  slug: 'yifanyun',
  displayRank: 25,
  brandName: '一翻云 1fly',
  shortName: '一翻云',
  nameEn: '1fly',
  aliases: ['一翻云', '1fly', '一翻云VPN', '一翻云梯子', '一翻云机场', 'yifanyun'],
  uploadFileNo: 18,
  summary:
    '一翻云的页面存档（机场推荐与测评站，2026-10-16）列出一个年付版和四档周期套餐，另收录一份 2026-05-04 在上海 Azure 云端环境下的第三方历史测速摘录。页面自己声明“线路、节点、可用率和解锁信息来自机场页面公开说明，本文未作独立验证”，且线路类型只写“专线”。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“一翻云(1fly)”与站长给定名称一致；页面称“一翻云梯子”是对其订阅及节点的口语称呼。'],
  },
  plans: [
    plan('annual', '年付版', 'annual-small', [
      { period: 'annual', price: 98, monthlyGB: 60, reset: RESET, note: '页面：60GB/月，需一次支付 ¥98 年费，折合约 ¥8.17/月；页面未展示月付、季付。' },
    ]),
    plan('light', '轻享版', 'monthly-tier', tier(150, 20, 55, 168)),
    plan('comfort', '舒享版', 'monthly-tier', tier(350, 35, 98, 298)),
    plan('premium', '尊享版', 'monthly-tier', tier(600, 55, 155, 498)),
    plan('ultimate', '极致版', 'monthly-tier', [
      { period: 'monthly', price: 95, monthlyGB: 1200, reset: RESET, note: '页面写 1.2T，按 1T=1000GB 记为 1200GB。' },
      { period: 'quarterly', price: 268, monthlyGB: 1200, reset: RESET },
      { period: 'annual', price: 888, monthlyGB: 1200, reset: RESET },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D, nodeNames: ['香港19'], note: '页面写“节点覆盖香港、台湾、日本、新加坡、美国、英国及其他页面所列地区”；节点名取自 2026-05-04 测速摘录。' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D, nodeNames: ['台湾02'] }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D, nodeNames: ['日本03'] }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D, nodeNames: ['新加坡07', '新加坡04'] }),
    region('US', '美国', null, 'C', [T], { recordedAt: D, nodeNames: ['美国04'] }),
    region('GB', '英国', null, 'C', [T], { recordedAt: D, note: '页面列出英国，但没有任何该地区的测速或节点名称。' }),
  ],
  protocols: claim(null, 'D', [T, M], { note: '页面存档没有写传输协议（只写“自研客户端”和“通用订阅”）；汇编资料库的“通用订阅”不是协议名称。' }),
  routeTypes: claim(null, 'D', [T, M], {
    note: '页面只写“专线节点”“企业级专线”，没有写 IPLC / IEPL；页面还声明“不能证明当前专线类型”。',
  }),
  clients: claim(['自研客户端', '通用订阅（兼容 Clash、Sing-box、v2rayN、Shadowrocket）'], 'C', [T], { recordedAt: D }),
  streaming: claim(['Netflix', 'Disney+', 'HBO Max', 'YouTube', 'Spotify', 'Hulu', 'TikTok'], 'C', [T], {
    recordedAt: D,
    note: '页面称原生 IP 节点支持；页面另有一张流媒体解锁图，但文字摘录没有描述其内容，本站不转述。页面声明“解锁信息来自机场页面公开说明，本文未作独立验证”。',
  }),
  ai: claim(['ChatGPT', 'Copilot', 'Gemini'], 'C', [T], { recordedAt: D, note: '页面称可用，本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制在线客户端数量”，页面存档没有此项。' }),
  multiplier: claim(null, 'D', [M], { note: '页面存档没有写节点倍率；汇编资料库的“晚高峰不限速，动态链路加速”不是倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面声明：“品牌、线路、节点、可用率和解锁信息来自机场页面公开说明，本文未作独立验证”，并提醒“年付折算月价不是单月购买价”“不要仅凭最低价判断性价比”。本站的价格同样是页面标价，实付以结算页为准。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面收录的测速是 2026-05-04 在上海 Azure 云端环境（10Gbps、10 线程）的结果，页面写明它“不是家庭宽带的新实测”“不是晚高峰记录”。页面还称“晚高峰不限速”，属于服务商宣称；本站没有该品牌的分时段测试记录。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [
    '页面另列“季付 95 折 / 年付 85 折 / 2 年付 8 折 / 3 年付 7 折”，但没有列出两年付、三年付的具体价格；本站不推算填入，也不发布页面提到的优惠码。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
