import { claim, planFactory, region, seed } from '../helpers';

const T = 't07'; // 页面存档：第三方评测页 飞猫云(FlyCat)（页面日期 2026-10-16）
const M = 'm07';
const D = '2026-10-16';
const plan = planFactory({ brandId: 'feimaoyun', src: T, recorded: D });
const RESET_30 = '页面：季付及以上自购买日起每 30 天自动刷新；月付周期未单独说明';

export default seed({
  slug: 'feimaoyun',
  displayRank: 4,
  brandName: '飞猫云',
  shortName: '飞猫云',
  nameEn: 'FlyCat',
  aliases: ['飞猫', 'feimao', 'flycat', 'FlyCat', 'FlyCat VPN', '飞猫云梯子'],
  uploadFileNo: 7,
  summary:
    '飞猫云的页面存档（2026-10-16）资料较完整：学生版年付、四档月流量套餐的月/季/半年/年付价格、1000GB 不限时流量包，以及两张带日期和测试环境的第三方历史测速记录。汇编资料库的套餐名称与部分价格与页面存档不一致。',
  identity: { status: 'name-confirmed', notes: [] },
  plans: [
    plan('student', '学生版', 'annual-small', [
      {
        period: 'annual',
        price: 84,
        monthlyGB: 50,
        reset: '页面：每月自动刷新',
        note: '页面明确：50GB 为每月额度，不是全年共用；¥7/月是年付 ¥84 的折算价，不能按 ¥7 单月购买。',
      },
    ]),
    plan('xingyao', '星耀版', 'monthly-tier', [
      { period: 'monthly', price: 25, monthlyGB: 150, reset: RESET_30 },
      { period: 'quarterly', price: 67, monthlyGB: 150, reset: RESET_30 },
      { period: 'semiannual', price: 127, monthlyGB: 150, reset: RESET_30 },
      { period: 'annual', price: 240, monthlyGB: 150, reset: RESET_30 },
    ]),
    plan('xinghuan', '星环版', 'monthly-tier', [
      { period: 'monthly', price: 45, monthlyGB: 300, reset: RESET_30 },
      { period: 'quarterly', price: 121, monthlyGB: 300, reset: RESET_30 },
      { period: 'semiannual', price: 229, monthlyGB: 300, reset: RESET_30 },
      { period: 'annual', price: 432, monthlyGB: 300, reset: RESET_30 },
    ]),
    plan('yinhe', '银河版', 'monthly-tier', [
      { period: 'monthly', price: 85, monthlyGB: 600, reset: RESET_30 },
      { period: 'quarterly', price: 229, monthlyGB: 600, reset: RESET_30 },
      { period: 'semiannual', price: 433, monthlyGB: 600, reset: RESET_30 },
      { period: 'annual', price: 816, monthlyGB: 600, reset: RESET_30 },
    ]),
    plan('yuzhou', '宇宙版', 'monthly-tier', [
      { period: 'monthly', price: 150, monthlyGB: 1000, reset: RESET_30 },
      { period: 'quarterly', price: 400, monthlyGB: 1000, reset: RESET_30 },
      { period: 'semiannual', price: 750, monthlyGB: 1000, reset: RESET_30 },
      { period: 'annual', price: 1360, monthlyGB: 1000, reset: RESET_30 },
    ]),
    plan('unlimited-1000', '不限时套餐', 'one-time-pack', [
      {
        period: 'one-time',
        price: 680,
        totalGB: 1000,
        reset: '不限时，用完为止；不自动重置',
        note: '1000GB 为固定总流量，不是每月额度；支持付费手动重置，费用为原价 90%（¥612）。',
      },
    ]),
    plan('custom-500', '定制套餐', 'custom', [
      {
        period: 'custom',
        price: 550,
        totalGB: 500,
        status: 'consult',
        reset: null,
        note: '页面写“500GB · ¥550 · 专属节点、独享原生 IP、独立带宽、一对一技术支持”，并注明部署与报价需联系客服确认，流量周期口径未说明。',
      },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D, note: '页面提示热门时段香港节点偶有排队' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D }),
    region('US', '美国', null, 'C', [T], { recordedAt: D }),
    region('KR', '韩国', null, 'C', [T], { recordedAt: D }),
  ],
  protocols: claim(['Shadowsocks', 'Trojan', 'VLESS'], 'C', [T], {
    recordedAt: D,
    note: '页面写：自研客户端，并支持通用订阅导入兼容 Shadowsocks、Trojan 或 VLESS 的客户端；第三方历史测速图中出现过 AnyTLS 与 VLESS 节点类型，历史记录与当前服务应分别核对。',
  }),
  nodeCount: claim(57, 'C', ['owner-2026-10-28'], { recordedAt: '2026-10-29', note: '站长 2026-10-29 确认飞猫云共 57 个节点。' }),
  routeTypes: claim(['iplc'], 'C', ['owner-2026-10-28'], { recordedAt: '2026-10-29', note: '站长 2026-10-29 提供的官网套餐截图：全部套餐写“全 IPLC 专线网络，最高 2.5Gbps”。旧页面存档写 IEPL，已按新截图更正。' }),
  clients: claim(['自研客户端', 'Clash Verge Rev', 'Shadowrocket', 'v2rayN', 'Stash', '通用订阅'], 'C', [T], { recordedAt: D }),
  streaming: claim(['Netflix', 'Disney+', 'TikTok'], 'C', [T], { recordedAt: D, note: '页面声称原生 IP；另附解锁截图，本站未实测。' }),
  ai: claim(['ChatGPT', 'Claude'], 'C', [T], { recordedAt: D, note: '页面列出支持，本站未实测。' }),
  deviceLimit: claim('不限制设备连接数量（页面标注）', 'C', [T], { recordedAt: D }),
  multiplier: claim('节点 ×1（常规套餐，页面标注）', 'C', [T], { recordedAt: D, note: '页面另标注最高 2.5Gbps 速率与高峰时段不降速，均为服务商宣称。' }),
  notices: [
    {
      type: 'operational-risk',
      severity: 'info',
      text: '页面自述：热门时段香港节点偶有排队，建议在常用时段测试目标地区节点。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'feimaoyun-plan-names-prices',
      field: '套餐名称与部分价格',
      summary:
        '页面存档的四档为星耀/星环/银河/宇宙（季付 ¥67/121/229/400，宇宙版月付 ¥150）；汇编资料库写作星耀/极速/尊享/旗舰（星耀季付 ¥72、旗舰月付 ¥140 等）。',
      variants: [
        { label: '页面存档（本站采用，C）', sourceId: T, grade: 'C' },
        { label: '汇编资料库（未采用，D）', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档为准，汇编库数值仅在此列出。',
    },
  ],
  editorialNotes: [
    '页面还列出年付 8 折、两年付 7 折、三年付 6 折的说法，但没有给出对应价格，本站不据此推算两年、三年价格。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
