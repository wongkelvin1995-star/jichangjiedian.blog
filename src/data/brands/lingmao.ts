import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't25'; // 页面存档：第三方评测页“灵猫网络(SpiritCat)”（页面日期 2026-10-16）
const M = 'm25';
const D = '2026-10-16';
const TEST = '2026-07-19'; // 页面收录的 MiaoKo 历史截图日期
const plan = planFactory({ brandId: 'lingmao', src: T, recorded: D });
const RESET = '页面：流量/月，按订单日每月自动重置；可另购加油包';

const tier = (gb: number, m: number, q: number, y: number): OfferInput[] => [
  { period: 'monthly', price: m, monthlyGB: gb, reset: RESET, note: '页面：月付有效期 30 天' },
  { period: 'quarterly', price: q, monthlyGB: gb, reset: RESET, note: '页面：季付有效期 90 天' },
  { period: 'annual', price: y, monthlyGB: gb, reset: RESET, note: '页面：年付有效期 365 天' },
];

export default seed({
  slug: 'lingmao',
  displayRank: 13,
  brandName: '灵猫',
  shortName: '灵猫',
  nameEn: 'SpiritCat',
  aliases: ['灵猫', '灵猫网络', 'SpiritCat', 'spiritcat', 'lingmao', '灵猫梯子', '灵猫机场'],
  uploadFileNo: 25,
  summary:
    '灵猫（页面名称“灵猫网络(SpiritCat)”）的页面存档（第三方评测页，2026-10-16）列出年付小包、Small、Big 三个套餐，自述 IPLC 专线与 VLESS 协议，另收录一份 2026-07-19 的第三方历史测速与解锁截图摘录。页面没有节点总数和官方地区名单。',
  identity: {
    status: 'name-variant',
    notes: ['站长给定名称为“灵猫”，资料页面名称为“灵猫网络(SpiritCat)”。本站沿用站长名称并保留别名，对应关系待核验。'],
  },
  plans: [
    plan('annual-small', '年付小包', 'annual-small', [
      {
        period: 'annual',
        price: 85,
        monthlyGB: 45,
        reset: RESET,
        note: '页面明确：年付 45GB 表示每月 45GB，并非全年共用 45GB；需一次支付全年费用，页面折合约 ¥7.08/月。页面未展示该套餐的月付、季付。',
      },
    ]),
    plan('small', 'Small', 'monthly-tier', tier(150, 25, 65, 195)),
    plan('big', 'Big', 'monthly-tier', tier(300, 45, 125, 295)),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: TEST, nodeNames: ['香港 Cloud - 01'], note: '页面没有官方地区列表；该地区出现在页面收录的 2026-07-19 测速/解锁截图摘录中。' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: TEST, nodeNames: ['台湾 Cloud - 03', '台湾 Cloud - 01'], note: '同上' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: TEST, nodeNames: ['日本 Cloud - 09', '日本 Cloud - 01'], note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: TEST, nodeNames: ['新加坡 Cloud - 01'], note: '同上' }),
    region('US', '美国', null, 'C', [T], { recordedAt: TEST, nodeNames: ['美国 Cloud - 01'], note: '同上' }),
  ],
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: D }),
  routeTypes: claim(['iplc'], 'C', [T], { recordedAt: D, note: '页面自述“主打 IPLC 专线”，页面作者未独立验证；套餐标称最大带宽 1000Mbps，页面写明这不是实际连接速度的保证。' }),
  clients: claim(['通用订阅（页面称可导入兼容 VLESS 的客户端）', 'Shadowrocket（页面称可另行了解下载账号）'], 'C', [T], { recordedAt: D }),
  streaming: claim(['Netflix', 'Hulu', 'HBO', 'Disney+', 'TikTok'], 'C', [T], {
    recordedAt: D,
    note: '套餐介绍列出上述平台。页面另收录 2026-07-19 18:18:02 的 MiaoKo 解锁图文字说明：YouTube / Netflix / Disney+ 三项检测，五个 Cloud-01 节点显示对应 US / JP / TW / HK / SG 解锁；解锁结果不能替代下载测试，也不是本站测试。',
  }),
  ai: claim(['ChatGPT', 'Gemini'], 'C', [T], {
    recordedAt: D,
    note: '页面称支持；其解锁图未列 AI 平台，页面自己写明“不能用它证明 ChatGPT 或 Gemini 可用”。本站未实测。',
  }),
  deviceLimit: claim('套餐标注“不限制客户端”（页面未写明是否限制同时在线设备数）', 'C', [T], { recordedAt: D }),
  multiplier: claim('节点 ×1（页面标注）', 'C', [T], { recordedAt: D }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面的测速与解锁截图时间为 2026-07-19，早于页面日期（2026-10-16）近三个月，且页面写明“原始提供者未记录”“不是本次重新测速或解锁实测”。本站只作第三方历史参考展示，不计入统计。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“由海外团队持续运营，团队介绍称具备三年行业经验”，并提到新人折扣码；均为服务商或页面作者宣称，本站不发布折扣码，表内价格为页面标价（未叠加折扣）。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [
    '页面写明“没有不限时套餐”，因此本站不为灵猫生成一次性流量包条目；加油包存在但页面没有给出价格。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
