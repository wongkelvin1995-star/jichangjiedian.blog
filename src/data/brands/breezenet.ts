import { claim, planFactory, region, seed } from '../helpers';

const T = 't23'; // 站长最初上传的存档：70 字节，只有页面标题
const M = 'm23'; // 汇编资料
const G = 'tp-2026-10-20-breezenet'; // 第三方评测页（页面写“最后核验更新 2026-10-20”）
const O = 'owner-2026-10-28'; // 站长给出的节点清单
const S = 'owner-sheet'; // 站长 Excel
const PRICING = 'owner-2026-10-31-pricing'; // 站长 2026-10-31 说明：清风 ¥99；清风/信风/长风不可使用优惠码
const plan = planFactory({ brandId: 'breezenet', src: G, recorded: '2026-10-20' });
const ALL_PERIODS = '评测页写可选月付、季付、半年付、年付、两年付、三年付，但只给出月付价格；其他周期的价格本站不推算。';

export default seed({
  slug: 'breezenet',
  displayRank: 3,
  brandName: '微风网络 Breezenet',
  shortName: '微风网络',
  nameEn: 'Breezenet',
  aliases: ['微风', '微风网络', '微风机场', 'breeze', 'breezenet', 'Breezenet', 'weifeng'],
  uploadFileNo: 23,
  summary:
    '微风网络主打 IPLC 专线和 VLESS 协议，用自家客户端连接（不提供订阅链接）。站长给出的节点共 53 个：香港 14、日本 10（另有 4 个日本直连）、新加坡 10、美国 10、台湾 5。套餐有月付的乘风、破风、御风三档，年付的清风小包，以及两个不限时流量包。价格主要来自一家第三方评测站 2026-10-20 的记录，其中清风年付按站长 2026-10-31 的说明改为 ¥99。清风和两个流量包不能使用优惠码；购买前请以官网结算页为准。',
  identity: {
    status: 'name-confirmed',
    notes: [
      '站长最初上传的页面存档只有一行标题（70 字节），提取文件为空。2026-10-28 站长另外提供了一个第三方评测页链接和节点清单，本页资料以这两份为主。',
      '评测页的链接都经过该站的跳转页，没有写出微风网络自己的域名；本站的“前往官网”按钮使用站长提供的推广入口。',
    ],
  },
  plans: [
    plan('qingfeng', '清风（年付小包）', 'annual-small', [
      {
        period: 'annual',
        price: 99,
        monthlyGB: 100,
        reset: '评测页：每月 100GB，只能按年购买',
        src: PRICING,
        recorded: '2026-10-31',
        note: '年付总价 ¥99，折合每月约 ¥8.25（站长 2026-10-31 说明）。第三方评测页 2026-10-20 写的是 ¥137，见“来源冲突”。',
      },
    ]),
    plan('chengfeng', '乘风', 'monthly-tier', [
      { period: 'monthly', price: 25, monthlyGB: 200, reset: '评测页：每月 200GB', note: `站长 Excel 记录的最低价套餐也是乘风 ¥25/月 200GB，两者一致。${ALL_PERIODS}` },
    ]),
    plan('pofeng', '破风', 'monthly-tier', [
      { period: 'monthly', price: 55, monthlyGB: 500, reset: '评测页：每月 500GB', note: `汇编资料写 ¥57，见“来源冲突”。${ALL_PERIODS}` },
    ]),
    plan('yufeng', '御风', 'monthly-tier', [
      { period: 'monthly', price: 125, monthlyGB: 1200, reset: '评测页：每月 1200GB', note: `汇编资料写 ¥127，见“来源冲突”。${ALL_PERIODS}` },
    ]),
    plan('xinfeng', '信风（不限时流量包）', 'one-time-pack', [
      { period: 'one-time', price: 200, totalGB: 270, reset: '评测页：不限使用时间，用完为止', note: '评测页另一处说明：流量包只给当期增加流量，不会延长主套餐的有效期。两种说法以官网为准。' },
    ]),
    plan('changfeng', '长风（不限时流量包）', 'one-time-pack', [
      { period: 'one-time', price: 370, totalGB: 570, reset: '评测页：不限使用时间，用完为止' },
    ]),
  ],
  regions: [
    region('HK', '香港', 14, 'C', [O], { recordedAt: '2026-10-28', nodeNames: ['香港1', '香港2', '香港14'], note: '站长清单：香港 1–14' }),
    region('JP', '日本', 14, 'C', [O], { recordedAt: '2026-10-28', nodeNames: ['日本1', '日本10', '日本直连01', '日本直连04'], note: '站长清单：日本 1–10，另有日本直连 01–04' }),
    region('SG', '新加坡', 10, 'C', [O], { recordedAt: '2026-10-28', nodeNames: ['新加坡1', '新加坡10'], note: '站长清单：新加坡 1–10' }),
    region('US', '美国', 10, 'C', [O], { recordedAt: '2026-10-28', nodeNames: ['美国1', '美国10'], note: '站长清单：美国 1–10' }),
    region('TW', '台湾', 5, 'C', [O], { recordedAt: '2026-10-28', nodeNames: ['台湾01', '台湾05'], note: '站长清单：台湾 01–05' }),
  ],
  nodeCount: claim(53, 'C', [O], { recordedAt: '2026-10-28', note: '按站长清单相加：香港 14 + 日本 10 + 日本直连 4 + 新加坡 10 + 美国 10 + 台湾 5。评测页写“约 60 个专线节点”，并提到德国节点，站长清单里没有德国。' }),
  protocols: claim(['VLESS'], 'C', [G]),
  routeTypes: claim(['iplc', 'direct'], 'C', [G, O], { note: '评测页与站长 Excel 都写“全 IPLC 专线”；站长清单另有 4 个日本直连节点。' }),
  clients: claim(['Windows 10 及以上', 'macOS 10.15 及以上', 'Android 5.0 及以上', 'iOS 15 及以上（通过 Nextin 登录）'], 'C', [G], {
    note: '只能用微风网络自己的客户端，不提供订阅链接；评测页称客户端基于 Clash Meta 内核。iOS 需要从海外区 App Store 下载 Nextin。',
  }),
  streaming: claim(['Netflix', 'Disney+', 'HBO Max', 'TikTok'], 'C', [G], { note: '服务商宣称，评测页提醒不同节点结果不同；本站未测试。' }),
  ai: claim(['ChatGPT', 'Claude', 'Gemini'], 'C', [G], { note: '服务商宣称；评测页的测试只是“能连上”，不是解锁检测。' }),
  deviceLimit: claim('不限制同时在线设备数，所有设备共用同一份流量', 'C', [G, S]),
  multiplier: claim(null, 'D', [G], { note: '评测页只写“常规节点倍率”，没有给出数字。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '本页价格和功能来自一家第三方评测站（2026-10-20），该站的“已核验”标记是它自己的说法。评测页没有写退款规则、自动续费规则和客服联系方式，买年付或流量包之前请先在官网确认。',
      sourceIds: [G],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '站长 2026-10-31 说明：清风（年付小包，¥99）、信风（¥200 / 270GB）、长风（¥370 / 570GB）都不能使用优惠码。乘风、破风、御风是否可用，本站没有资料，请在官网结算页确认。',
      sourceIds: [PRICING],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '付款方式（评测页）：支付宝、微信支付、USDT（TRC20）。注册需要邮箱验证。',
      sourceIds: [G],
    },
  ],
  conflicts: [
    {
      conflictId: 'breezenet-price-variants',
      field: '破风、御风价格',
      summary: '第三方评测页与汇编资料的月付价格差 ¥2。',
      variants: [
        { label: '第三方评测页（2026-10-20）：破风 ¥55、御风 ¥125', sourceId: G, grade: 'C' },
        { label: '汇编资料：破风 ¥57、御风 ¥127', sourceId: M, grade: 'D' },
      ],
      handling: '采用带日期的评测页价格；汇编资料只留作线索。',
    },
    {
      conflictId: 'breezenet-qingfeng-price',
      field: '清风（年付小包）价格',
      summary: '站长 2026-10-31 说明清风年付是 ¥99；第三方评测页 2026-10-20 写的是 ¥137。',
      variants: [
        { label: '站长说明（2026-10-31）：清风年付 ¥99，折合每月约 ¥8.25', sourceId: PRICING, grade: 'C' },
        { label: '第三方评测页（2026-10-20）：清风年付 ¥137', sourceId: G, grade: 'C' },
      ],
      handling: '采用日期更晚的站长说明 ¥99；评测页的 ¥137 只留在这里作对照，不用于计算。购买前请以官网结算页为准。',
    },
    {
      conflictId: 'breezenet-node-list',
      field: '节点数量与地区',
      summary: '站长清单 53 个节点、5 个地区；评测页写约 60 个，并包含德国。',
      variants: [
        { label: '站长清单（2026-10-28）：香港 14、日本 10 + 直连 4、新加坡 10、美国 10、台湾 5', sourceId: O, grade: 'C' },
        { label: '第三方评测页：约 60 个专线节点，覆盖香港、日本、美国、德国、新加坡', sourceId: G, grade: 'C' },
      ],
      handling: '地图和地区页按站长清单显示，德国不标记。',
    },
  ],
  editorialNotes: [
    '评测页 2026-10-20 记录的单次延迟：新加坡 03 约 10 ms；香港普通节点 25–28 ms（部分超时）；日本普通节点 45–52 ms（部分超时）；日本直连 58–61 ms；美国普通节点 93–102 ms；美国直连 130–132 ms；德国直连 91–92 ms（部分超时）。这些都是单次快照，不代表长期稳定性。',
    '评测页建议先买月付套餐，确认自己所在地区的网络能用，再考虑年付。本站也这样建议。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, G, O, S, PRICING],
});
