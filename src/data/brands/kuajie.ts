import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't28'; // 页面存档：自称“跨界云”品牌站（页面未标注抓取日期）
const M = 'm28';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'kuajie', src: T, recorded: null });
const RESET = '页面：月流量，购买日起算';
const ANNUAL_NOTE =
  '页面写“年付 ¥xx，折合 ¥xx/月”（即月价 ×12 再按年付 8 折）；页面未单独说明年付的流量重置方式，按“月流量”口径记录，以结算页为准。';

const tier = (gb: number, monthly: number, annual: number): OfferInput[] => [
  { period: 'monthly', price: monthly, monthlyGB: gb, reset: RESET },
  { period: 'annual', price: annual, monthlyGB: gb, reset: RESET, note: ANNUAL_NOTE },
];

export default seed({
  slug: 'kuajie',
  displayRank: 15,
  brandName: '跨界',
  shortName: '跨界',
  nameEn: null,
  aliases: ['跨界', '跨界云', 'kuajie', 'KuaJie', '跨界梯子', '跨界机场'],
  uploadFileNo: 28,
  summary:
    '跨界（页面名称“跨界云”）的品牌站存档没有标注日期，列出 Lite / Leap / Soar / Infinity 四档月流量套餐（月付 ¥20–¥130，120GB–1.8TB）及对应年付价格，线路自述 IPLC、所有节点 1 倍率。页面没有列出节点数量、地区名单和传输协议，本站不据汇编资料库推算。',
  identity: {
    status: 'name-variant',
    notes: [
      '站长给定名称为“跨界”，资料页面名称为“跨界云”。本站沿用站长名称并保留别名，对应关系待核验，不与其他名称相近的服务合并。',
    ],
  },
  plans: [
    plan('lite', 'Lite', 'monthly-tier', tier(120, 20, 192)),
    plan('leap', 'Leap', 'monthly-tier', tier(330, 40, 384)),
    plan('soar', 'Soar', 'monthly-tier', tier(830, 90, 864)),
    plan('infinity', 'Infinity', 'monthly-tier', tier(1800, 130, 1248), {
      note: '页面写月流量 1.8TB，同时写“1800GB”，本站按 1800GB 记录。',
    }),
  ],
  // 品牌站存档没有地区名单；下列地区仅见于汇编资料库，故为 D 级“待核验”
  regions: [
    region('HK', '香港', null, 'D', [M], { note: '仅见于汇编资料库“香港、日本、新加坡、美国等全球主流节点”；品牌站存档未列出地区名单。' }),
    region('JP', '日本', null, 'D', [M], { note: '同上' }),
    region('SG', '新加坡', null, 'D', [M], { note: '同上' }),
    region('US', '美国', null, 'D', [M], { note: '同上' }),
  ],
  protocols: claim(null, 'D', [T, M], {
    note: '页面与汇编资料库都没有写明传输协议（汇编资料库的“官方客户端直连/客服单独生成通用配置”不是协议名称）。',
  }),
  routeTypes: claim(['iplc'], 'C', [T], { note: '页面写“IPLC 高端线路”，为服务商宣称，本站未核验。' }),
  clients: claim(
    [
      '官方客户端：Android 5.0+、iOS 12.0+、macOS 10.15+、Windows 10+',
      '第三方客户端（页面提到 Clash、小火箭、v2rayN）的订阅链接需联系在线客服单独生成',
    ],
    'C',
    [T],
  ),
  streaming: claim(['Netflix', 'Hulu', 'HBO', 'Disney+', 'DAZN'], 'C', [T], {
    note: '页面写“支持…解锁需求，实际可用性会随平台策略变化”，没有附检测截图；本站未实测。',
  }),
  ai: claim(['ChatGPT', 'Gemini', 'Claude'], 'C', [T], { note: '页面写“面向…AI 工具访问需求”，没有附检测截图；本站未实测。' }),
  deviceLimit: claim('不限设备登录数（页面标注）', 'C', [T]),
  multiplier: claim('所有节点 1 倍率，页面称不限速', 'C', [T]),
  notices: [
    {
      type: 'service-notice',
      severity: 'info',
      text: '页面公告：官方客户端登录后自动获取节点；第三方客户端订阅链接需联系在线客服单独生成，页面称“持续评估更安全的自助方案”。公告标题为“线路扩容与价格调整说明”，但正文没有写扩容范围或调整后的价格。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '品牌站存档没有标注抓取日期；页面称“年付 8 折、两年 7 折、三年 6 折”，但只列出月付与年付的具体价格，两年付、三年付价格本站不推算填入。页面另提到“重置包”，未给出价格。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [
    '页面提到新用户折扣码并称“全场 8 折”，本站不发布折扣码；表内价格均为未叠加折扣的页面标价，实付以结算页为准。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
