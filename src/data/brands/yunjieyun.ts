import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't34'; // 页面存档：机场推荐与测评站“云界线(YunJieXian)”（页面日期 2026-10-16）
const M = 'm34';
const D = '2026-10-16';
const TEST = '2026-09-23';
const plan = planFactory({ brandId: 'yunjieyun', src: T, recorded: D });
const RESET = '页面：流量/月，常规周期套餐每月重置一次，可付费重置';
const LIST = '页面：下表均为使用优惠码前的标价，各付款周期价格为该周期总额。';

/** 六个付款周期都有页面数据的档位 */
const sixPeriods = (gb: number, p: [number, number, number, number, number, number]): OfferInput[] => [
  { period: 'monthly', price: p[0], monthlyGB: gb, reset: RESET, note: LIST },
  { period: 'quarterly', price: p[1], monthlyGB: gb, reset: RESET, note: LIST },
  { period: 'semiannual', price: p[2], monthlyGB: gb, reset: RESET, note: LIST },
  { period: 'annual', price: p[3], monthlyGB: gb, reset: RESET, note: LIST },
  { period: 'biennial', price: p[4], monthlyGB: gb, reset: RESET, note: LIST },
  { period: 'triennial', price: p[5], monthlyGB: gb, reset: RESET, note: LIST },
];

export default seed({
  slug: 'yunjieyun',
  displayRank: 34,
  brandName: '云界云',
  shortName: '云界云',
  nameEn: 'YunJieXian',
  aliases: ['云界云', '云界线', 'YunJieXian', 'yunjiexian', 'yunjieyun', '云界线梯子', '云界云机场'],
  uploadFileNo: 34,
  summary:
    '站长提供的“云界云”页面存档，页面名称是“云界线(YunJieXian)”（机场推荐与测评站，2026-10-16）：一个年付小包、三档带六个付款周期价格的套餐，以及两档不限时流量包，并收录一份 2026-09-23 的第三方历史测速摘录，其中台湾 09 速度为 0.00B。站长已确认“云界云”就是页面里的“云界线”。',
  identity: {
    status: 'owner-confirmed',
    notes: [
      '资料页面使用的名称是“云界线(YunJieXian)”，推广入口域名也含 yunjiexian。站长于 2026-10-28 确认两者是同一服务；本站使用“云界云”，并保留“云界线”作为别名。',
    ],
  },
  plans: [
    plan('annual-pack', '云界年付小包', 'annual-small', [
      {
        period: 'annual',
        price: 96,
        monthlyGB: 60,
        reset: '页面：年付小包注明每 30 天自动重置',
        note: '页面：需一次支付 ¥96，折合 ¥8/月，不代表可以按该价格单月购买；套餐说明标注 IPLC 专线、最高 2.5Gbps、全站 ×1 倍率（均为套餐标注）。页面未展示其他付款周期。',
      },
    ]),
    plan('light', '轻云·基础版', 'monthly-tier', sixPeriods(150, [25, 72, 138, 240, 450, 630])),
    plan('advanced', '凌云·进阶版', 'monthly-tier', sixPeriods(300, [45, 129, 246, 432, 810, 1134])),
    plan('senior', '高级版', 'monthly-tier', sixPeriods(600, [75, 216, 414, 720, 1350, 1890])),
    plan('pack-80', '闲云·随心包', 'one-time-pack', [
      { period: 'one-time', price: 99, totalGB: 80, reset: '页面：80GB 是一次购买的总流量，不是每月额度；不限时，用完为止，不设到期重置' },
    ]),
    plan('pack-200', '悠云·长享包', 'one-time-pack', [
      { period: 'one-time', price: 199, totalGB: 200, reset: '页面：200GB 是一次购买的总流量，不是每月额度；不限时，用完为止，不设到期重置' },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: TEST, nodeNames: ['香港01｜维港'], note: '页面没有官方地区列表；该地区出现在页面收录的 2026-09-23 测速摘录中。' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: TEST, nodeNames: ['台湾09｜花莲'], note: '同上；该行速度为 0.00B。' }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: TEST, nodeNames: ['新加坡01｜滨海湾'], note: '同上' }),
    region('US', '美国', null, 'C', [T], { recordedAt: TEST, nodeNames: ['美国01｜洛杉矶'], note: '同上' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: TEST, nodeNames: ['日本04｜横滨'], note: '同上' }),
  ],
  protocols: claim(null, 'D', [T, M], { note: '页面只写“支持通用订阅，使用时需匹配订阅格式与节点协议”，没有协议名称；汇编资料库的“通用订阅协议”不是协议名称。' }),
  routeTypes: claim(['iplc'], 'C', [T], { recordedAt: D, note: '页面写“年付小包的套餐说明标注 IPLC 专线及最高 2.5Gbps 带宽；这是套餐标注”，其他套餐未写线路类型。' }),
  clients: claim(['通用订阅（可导入兼容的第三方客户端）'], 'C', [T], { recordedAt: D, note: '页面指向客户端教程汇总；汇编资料库列出的具体客户端不见于页面。' }),
  streaming: claim(null, 'D', [M], { note: '页面写明“此截图未提供流媒体与 AI 解锁检测”；汇编资料库的清单无页面依据。' }),
  ai: claim(null, 'D', [M], { note: '同上' }),
  deviceLimit: claim('套餐标注不限制设备数量（页面标注）', 'C', [T], { recordedAt: D }),
  multiplier: claim('年付小包标注全站 ×1 倍率；其他套餐未写', 'C', [T], { recordedAt: D }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面收录的测速是 2026-09-23 16:16:53 的历史截图摘录：台湾 09 速度为 0.00B（延迟为“-”），日本 04 的平均速度是 644.80KB（不是 MB），页面写明“此截图未提供流媒体与 AI 解锁检测”。页面声明“品牌、线路、节点、可用率和解锁信息来自机场页面公开说明，本文未作独立验证”。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面提到专属折扣码（6.5 折）；本站不发布折扣码，表内价格均为页面标价（使用优惠码前），是否适用以及叠加条件以结算页为准。',
      sourceIds: [T],
    },
  ],
  conflicts: [
  ],
  editorialNotes: [
    '本品牌是目前资料里付款周期最完整的一家（月付到三年付共六个周期），适合用来演示“折合每月”和“每 GB”的计算口径；演示时仍以页面标价为准，并注明数据日期。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
