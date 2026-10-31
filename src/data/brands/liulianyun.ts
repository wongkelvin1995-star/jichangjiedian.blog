import { claim, planFactory, region, seed } from '../helpers';

const T = 't29'; // 页面存档：机场云(JichangCloud)“榴莲云评测”（发布/更新于 2026-10-20）
const M = 'm29';
const D = '2026-10-20';
const plan = planFactory({ brandId: 'liulianyun', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';
const PANEL = '页面称价格来自官方面板（登录后可见），观察日期 2026-10-20；本站未取得面板截图。';

export default seed({
  slug: 'liulianyun',
  displayRank: 30,
  brandName: '榴莲云',
  shortName: '榴莲云',
  nameEn: null,
  aliases: ['榴莲云', 'liulianyun', '榴莲云机场'],
  uploadFileNo: 29,
  summary:
    '榴莲云的页面存档（机场云评测站，2026-10-20）称该服务于 2026 年 9 月上线（官网域名注册于 2026-09-05，官方客户端 2026-09-22 上线），列出四档月付套餐、一个年付小包和两档不限时流量包；价格来自评测站对官方面板的观察。页面写明本站“尚未实测”AI 与流媒体，并引用 2026-10-03 一次第三方美国节点测试：Netflix 被识别为代理。',
  identity: {
    status: 'name-confirmed',
    notes: [
      '页面声明：榴莲云与“榴莲加速器”及 liulianyun.com（东盟果链云）无关。本站不合并这些名称。',
      '页面的口号为“吃着榴莲翻着墙”；面板基于 V2Board（页面所述），iOS 使用 Nextin 客户端，有官方交流群。',
    ],
  },
  plans: [
    plan('light', '轻享包', 'monthly-tier', [{ period: 'monthly', price: 24, monthlyGB: 140, reset: RESET, note: PANEL }]),
    plan('enjoy', '畅享包', 'monthly-tier', [{ period: 'monthly', price: 40, monthlyGB: 260, reset: RESET, note: PANEL }]),
    plan('king', '猫山王', 'monthly-tier', [{ period: 'monthly', price: 60, monthlyGB: 420, reset: RESET, note: PANEL }]),
    plan('thorn', '大黑刺', 'monthly-tier', [{ period: 'monthly', price: 100, monthlyGB: 750, reset: RESET, note: PANEL }]),
    plan('annual', '金枕小包·年付特惠版', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: RESET, note: `折合约 ¥8/月。${PANEL}` },
    ]),
    plan('pack-100', '防腐小榴莲', 'one-time-pack', [
      { period: 'one-time', price: 99, totalGB: 100, reset: '页面：不限时，用完为止', note: PANEL },
    ]),
    plan('pack-500', '防腐大榴莲', 'one-time-pack', [
      { period: 'one-time', price: 498, totalGB: 500, reset: '页面：不限时，用完为止', note: PANEL },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D, note: '页面称服务商提供的截图显示 60 个 VLESS 节点，覆盖香港、台湾、日本、新加坡、美国；本站未取得该截图原图。' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D, note: '同上' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D, note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D, note: '同上' }),
    region('US', '美国', null, 'C', [T], { recordedAt: '2026-10-03', note: '页面引用 2026-10-03 一次第三方在美国节点的测试（出口为机房 IP）。' }),
  ],
  nodeCount: claim(60, 'C', [T], { recordedAt: D, note: '页面称服务商提供的截图显示 60 个 VLESS 节点（本站未取得原图）。' }),
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: D }),
  routeTypes: claim(['iepl', 'iplc'], 'C', [T], { recordedAt: D, note: '页面标注“IEPL / IPLC（推广站说法）”，即来自推广方的说法，页面作者未独立验证。' }),
  clients: claim(['官方客户端（Windows / macOS / Android）', 'Nextin（iOS）', '通用订阅（可联系客服获取）'], 'C', [T], { recordedAt: D }),
  streaming: claim(null, 'D', [T], {
    recordedAt: '2026-10-03',
    note: '页面流媒体一栏为“—”（未提供）。页面引用 2026-10-03 一次第三方美国节点测试：Netflix 被识别为代理；本站尚未实测。',
  }),
  ai: claim(['ChatGPT', 'Claude', 'Gemini'], 'C', [T], {
    recordedAt: '2026-10-03',
    note: '页面引用 2026-10-03 一次第三方美国节点测试：ChatGPT、Claude、Gemini 页面可打开，Gemini 出现地区提示，出口为机房 IP。页面标注“AI 适配：待实测”，不等于已确认可用或不可用。',
  }),
  deviceLimit: claim('全部套餐不限设备（页面标注）', 'C', [T], { recordedAt: D }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'operational-risk',
      severity: 'warn',
      text: '页面称这是 2026 年 9 月上线的新服务（官网域名注册于 2026-09-05，官方客户端 2026-09-22 上线），“长期稳定性还需观察”，并写明“未公开退款条款，建议先选月付”。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面写明：“资料整理不等于本站实测”，“页面更新日期不等于所有套餐、节点与平台功能都已重新验证”，并披露“通过推广链接订阅可能为本站带来佣金”。其中的折扣码本站不发布，实付以结算页为准。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [
    '页面对该品牌的来源标注较清楚（官方面板观察、第三方测试日期、域名注册与客户端上线日期），因此本站在“待实测”的字段上不补任何判断。',
    '交叉核对：另一个另一家第三方对比站（站长核对于 2026-09-22 的购买页截图）对榴莲云的价格与流量记录——轻享包 ¥24/140GB、¥40/260GB、¥60/420GB、¥100/750GB、年付小包 ¥96/每月 60GB——与本页一致。两个来源都是第三方，本站没有取得截图原图，所以证据等级仍为 C。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, 't33'],
});
