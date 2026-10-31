import { claim, planFactory, region, seed } from '../helpers';

const T = 't14'; // 页面存档：自称“光年梯 LightYear”品牌站（页脚 © 2026，页面未标注抓取日期）
const M = 'm14';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'guangnianti', src: T, recorded: null });
const RESET = '页面：每月流量（页面未写明重置日规则）';
const MD_DIFF = (md: number) => `汇编资料库写 ${md}GB/月，页面存档写法不同；价格相同。`;

export default seed({
  slug: 'guangnianti',
  displayRank: 22,
  brandName: '光年梯',
  shortName: '光年梯',
  nameEn: 'LightYear',
  aliases: ['光年梯', 'LightYear', 'LightYear VPN', 'lightyear', 'guangnianti', '光年梯机场'],
  uploadFileNo: 14,
  summary:
    '光年梯的品牌站存档没有标注日期，列出四档月付套餐（¥18–¥130/月，110GB–900GB）和一个 ¥680/月 的 500GB 独享方案，自述企业级 IEPL 专线与全节点 x1 倍率。页面顶部有一条“线路恢复及客户端切换通知”，说明服务曾经中断后恢复，但公告没有日期。三档套餐的流量与汇编资料库不一致。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“光年梯 LightYear”与站长给定名称一致。'],
  },
  plans: [
    plan('entry', '入门版', 'monthly-tier', [{ period: 'monthly', price: 18, monthlyGB: 110, reset: RESET }]),
    plan('advanced', '晋级版', 'monthly-tier', [
      { period: 'monthly', price: 34, monthlyGB: 220, reset: RESET, status: 'conflict', note: MD_DIFF(260) },
    ]),
    plan('pro', '专业版', 'monthly-tier', [
      { period: 'monthly', price: 68, monthlyGB: 450, reset: RESET, status: 'conflict', note: MD_DIFF(520) },
    ]),
    plan('supreme', '至尊版', 'monthly-tier', [
      { period: 'monthly', price: 130, monthlyGB: 900, reset: RESET, status: 'conflict', note: MD_DIFF(1000) },
    ]),
    plan('dedicated', '独享方案', 'custom', [
      { period: 'monthly', price: 680, monthlyGB: 500, reset: RESET, note: '页面：500GB 独享流量，未写更多说明。' },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面首屏列出 🇭🇰 香港 🇯🇵 日本 🇸🇬 新加坡 🇺🇸 美国 🇹🇼 台湾，是服务商宣称的地区范围，未附节点名单。' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
    region('TW', '台湾', null, 'C', [T], { note: '同上' }),
  ],
  protocols: claim(null, 'D', [T, M], { note: '页面存档没有写传输协议；汇编资料库的“IEPL 原生专线协议”不是协议名称。' }),
  routeTypes: claim(['iepl'], 'C', [T], { note: '页面写“全线路接入企业级 IEPL 专线”，为服务商宣称，本站未核验；“2.5Gbps”是标称传输能力，不是实测速度。' }),
  clients: claim(['官方自研客户端：Windows、macOS（Intel 与 Apple Silicon）、iOS、Android、路由器'], 'C', [T], { note: '页面称购买后登录官网后台，按设备选择客户端一键导入订阅。' }),
  streaming: claim(['Netflix', 'Disney+', 'TikTok'], 'C', [T], { note: '页面写“轻松解锁…等”，没有附检测截图；用户评价文字不作为证据。' }),
  ai: claim(['ChatGPT'], 'C', [T], { note: '页面写支持，没有附检测截图；本站未实测。' }),
  deviceLimit: claim('不限客户端数量；一个账号可同时在多台设备上使用（页面标注）', 'C', [T]),
  multiplier: claim('全节点 x1 倍率（页面标注）', 'C', [T]),
  notices: [
    {
      type: 'service-notice',
      severity: 'warn',
      text: '页面顶部公告“光年梯线路恢复及客户端切换通知”：“全线服务已完成升级并全面恢复。为确保特殊时期连接稳定，请重新登录账号并使用官方自研客户端更新节点。”公告没有日期，也没有说明中断时间与原因；这是服务商自述的恢复，本站没有独立核验。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“晚高峰不限速”“基于 6,258 位真实用户评价”，均为服务商宣称，无来源、方法与日期；退款规则只写“以官网后台和客服说明为准”，没有具体条款。本站一律不采用评价与评分。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'guangnianti-traffic',
      field: '晋级版/专业版/至尊版月流量',
      summary: '页面存档与汇编资料库的月流量不同，价格相同。',
      variants: [
        { label: '页面存档：晋级版 220GB、专业版 450GB、至尊版 900GB', sourceId: T, grade: 'C' },
        { label: '汇编资料库：晋级版 260GB、专业版 520GB、至尊版 1000GB', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档为准录入，三档均标为冲突，不参与精确每 GB 成本排序；待取得带日期的价格页后核验。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
