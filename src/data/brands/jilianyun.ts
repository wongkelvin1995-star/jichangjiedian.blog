import { claim, planFactory, region, seed } from '../helpers';

const T = 't12'; // 页面存档：自称“极连云”品牌站（页脚版权 2025，页面未标注抓取日期）
const M = 'm12';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'jilianyun', src: T, recorded: null });
const RESET = '页面：每月流量（页面未写明重置日规则）';
const DISCOUNT = '页面：折扣优惠“1年付8折、2年付7折、3年付6折”，只写了折扣比例，没有列出年付/两年付/三年付的具体价格，本站不推算。';

export default seed({
  slug: 'jilianyun',
  displayRank: 21,
  brandName: '极连云',
  shortName: '极连云',
  nameEn: null,
  aliases: ['极连云', 'jilianyun', '极连云加速', '极连云节点', '极连云机场'],
  uploadFileNo: 12,
  summary:
    '极连云的品牌站存档没有标注日期，以“企业级网络加速”定位，列出四档月付套餐（¥15.5–¥120.5/月，100GB–1000GB）、一个 1000GB 一次性永久流量包（¥680）和按需定制的 L6。页面没有写传输协议、流媒体或 AI 解锁清单；“99.9% 服务可用性”“4.9/5 基于 5256 条评价”无法核验。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“极连云”与站长给定名称一致。页面定位企业用户（跨境电商、外贸、跨国公司）。'],
  },
  plans: [
    plan('l1', 'L1 Basic（基础套餐）', 'monthly-tier', [{ period: 'monthly', price: 15.5, monthlyGB: 100, reset: RESET, note: DISCOUNT }]),
    plan('l2', 'L2 Pro（进阶套餐）', 'monthly-tier', [{ period: 'monthly', price: 30.5, monthlyGB: 200, reset: RESET, note: DISCOUNT }]),
    plan('l3', 'L3 Ultra（高速专线套餐）', 'monthly-tier', [{ period: 'monthly', price: 65.5, monthlyGB: 500, reset: RESET, note: DISCOUNT }]),
    plan('l4', 'L4 Max（顶级旗舰套餐）', 'monthly-tier', [{ period: 'monthly', price: 120.5, monthlyGB: 1000, reset: RESET, note: DISCOUNT }]),
    plan('l5', 'L5（永久大包）', 'one-time-pack', [
      {
        period: 'one-time',
        price: 680,
        totalGB: 1000,
        reset: '页面：一次性 1000GB，无限时长，购买后不自动重置',
        note: '页面：手动重置费用 ¥612（原价 90%）；本套餐不适用年付折扣。',
      },
    ]),
    plan('l6', 'L6（企业级定制套餐）', 'custom', [
      { period: 'custom', price: null, reset: '页面：每月 500G 起/可定制', status: 'consult', note: '页面写“定制价格”，无公开价格；需联系定制。' },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“覆盖香港、日本、新加坡、美国等地区”，是服务商宣称的地区范围，未附节点名单。' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
  ],
  nodeCount: claim(80, 'C', [T], { note: '页面写“80+ 全球节点”，是“不少于 80”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(null, 'D', [T, M], { note: '页面存档没有写传输协议；汇编资料库的“Trojan / VLESS / Shadowsocks”不见于页面。' }),
  routeTypes: claim(['iplc'], 'C', [T], { note: '页面写“全 IPLC 专线接入，最大 2.5Gbps 速率”，为服务商宣称，本站未核验；2.5Gbps 是标称上限。' }),
  clients: claim(['Windows', 'macOS', 'iOS', 'Android'], 'C', [T], { note: '来自页面 FAQ“支持 Windows、macOS、iOS、Android 等主流平台”。' }),
  streaming: claim(null, 'D', [M], { note: '页面只写“原生 IP 支持企业级应用”，没有列出流媒体平台；汇编资料库的 Netflix / YouTube / TikTok 不见于页面。' }),
  ai: claim(null, 'D', [M], { note: '页面没有列出 AI 服务；汇编资料库写 ChatGPT，页面存档不支持。' }),
  deviceLimit: claim('不限制同时使用的客户端数量（页面标注）', 'C', [T]),
  multiplier: claim('所有节点 x1 倍率（页面标注）', 'C', [T]),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期。页面的“99.9% 服务可用性”“4.9 / 5.0 基于 5256 条评价”“24/7 客服”没有统计方法、来源或日期，用户评价的昵称与套餐名也无法验证，本站一律不采用。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“晚高峰不限速”，属于服务商宣称；本站没有该品牌的分时段测试记录。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [
    '汇编资料库把四档月付套餐命名为 L1–L4 并与页面一致；资料库的套餐表已核对，价格与流量与页面存档相符。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
