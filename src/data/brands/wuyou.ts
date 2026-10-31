import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't24'; // 页面存档：第三方评测页“无忧链接(WuYou)”（页面日期 2026-10-16）
const M = 'm24';
const D = '2026-10-16';
const plan = planFactory({ brandId: 'wuyou', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';

const tier = (gb: number, m: number | null, q: number | null, y: number | null): OfferInput[] => {
  const out: OfferInput[] = [];
  if (m != null) out.push({ period: 'monthly', price: m, monthlyGB: gb, reset: RESET });
  if (q != null) out.push({ period: 'quarterly', price: q, monthlyGB: gb, reset: RESET });
  if (y != null) out.push({ period: 'annual', price: y, monthlyGB: gb, reset: RESET });
  return out;
};

export default seed({
  slug: 'wuyou',
  displayRank: 10,
  brandName: '无忧',
  shortName: '无忧',
  nameEn: 'WuYou',
  aliases: ['无忧', 'wuyou', 'WuYou', '无忧链接', '无忧机场'],
  uploadFileNo: 24,
  summary:
    '页面存档（第三方评测页，2026-10-16）用的名称是“无忧链接(WuYou)”，站长已确认就是“无忧”。资料包含五档周期套餐价格、一次性 100GB 流量包，以及一份带日期和测试环境的第三方历史测速摘录。',
  identity: {
    status: 'owner-confirmed',
    notes: [
      '资料页面和汇编资料库使用的名称是“无忧链接(WuYou)”。站长于 2026-10-28 确认两者是同一服务；本站使用“无忧”，并保留“无忧链接”作为别名。',
      '无忧只作为一家品牌计数。',
    ],
  },
  plans: [
    plan('mini', 'MINI链接', 'annual-small', [{ period: 'annual', price: 79, monthlyGB: 40, reset: RESET, note: '页面明确：按月提供 40GB，但需一次支付 ¥79 年费；不支持 6.8 折码。' }]),
    plan('shuxin', '舒心链接', 'monthly-tier', tier(100, 19, 51, 182)),
    plan('shengxin', '省心链接', 'monthly-tier', tier(200, 33, 89, 316)),
    plan('suixin', '随心链接', 'monthly-tier', tier(500, 77, 207, 739)),
    plan('wangyou', '忘忧链接', 'monthly-tier', tier(1000, 117, 315, 1123)),
    plan('pack-100', '不限时链接（一次性）', 'one-time-pack', [{ period: 'one-time', price: 108, totalGB: 100, reset: '页面：固定 100GB 总量，不按月重置' }]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D }),
    region('US', '美国', null, 'C', [T], { recordedAt: D }),
    region('OTHER', '其他东南亚、欧美地区（页面未列国家）', null, 'C', [T], { recordedAt: D, note: '页面只写“其他东南亚、欧美地区”，不在地图上标记具体国家。' }),
  ],
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: D }),
  routeTypes: claim(['iplc'], 'C', [T], { recordedAt: D, note: '页面自述“据机场介绍，采用 IPLC 专线”，页面作者未独立验证。' }),
  clients: claim(['Clash Meta / Mihomo', 'Shadowrocket', 'sing-box', 'v2rayN'], 'C', [T], { recordedAt: D }),
  streaming: claim(['Netflix', 'Disney+', 'YouTube', 'TikTok'], 'C', [T], {
    recordedAt: D,
    note: '页面称支持；其 2026-07-18 解锁图显示香港 HKG-01 的 YouTube 为“送中(CN)”，Netflix/Disney+ 解锁 HK；新加坡 SIN-02 三项解锁 SG。解锁结果不能替代下载测试。',
  }),
  ai: claim(['ChatGPT', 'Gemini'], 'C', [T], { recordedAt: D, note: '页面称支持，本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制在线客户端数量”，页面存档没有此项。' }),
  multiplier: claim('套餐节点均为 1 倍率（页面标注）', 'C', [T], { recordedAt: D }),
  notices: [
    {
      type: 'service-notice',
      severity: 'info',
      text: '页面写开业时间为 2025 年、由海外团队运营，并称“据机场说明，不记录日志且不屏蔽 BT 下载”，均为服务商宣称。',
      sourceIds: [T],
    },
  ],
  conflicts: [
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
