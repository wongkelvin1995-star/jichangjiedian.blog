import { claim, planFactory, region, seed } from '../helpers';

const T = 't16'; // 页面存档：自称“宇宙云”品牌站（页脚 © 2026，页面未标注抓取日期）
const M = 'm16';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'yuzhouyun', src: T, recorded: null });
const RESET = '页面：每月流量，提前用完可付费重置（页面称“重置 9 折”）';
const MD_DIFF = (md: string) => `汇编资料库写 ${md}/月，页面存档写法不同；价格相同。`;
const CYCLE_DISCOUNT =
  '页面只在“行星基础版”下写：季付 95 折、半年付 9 折、年付 85 折、两年付 8 折、三年付 7 折；没有列出具体价格，本站不推算。';

export default seed({
  slug: 'yuzhouyun',
  displayRank: 23,
  brandName: '宇宙云 YuZhou',
  shortName: '宇宙云',
  nameEn: 'YuZhou',
  aliases: ['宇宙云', 'YuZhou', 'yuzhou', 'yuzhouyun', '宇宙云机场', '宇宙云官网'],
  uploadFileNo: 16,
  summary:
    '宇宙云的品牌站存档没有标注日期，列出一个年付小包和四档月付套餐（¥25–¥200/月），自述 VLESS + 企业级 IEPL 专线 + 全中转，60+ 节点。页面把现有地区（香港、台湾、日本、新加坡、马来西亚、美国）和“持续增加”的地区分开写；本站只把现有地区算作覆盖。三档月付套餐的流量与汇编资料库不一致。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“宇宙云”与站长给定名称一致；页面自述官方域名为 yuzhouyun.top，本站未独立核验域名归属。'],
  },
  plans: [
    plan('xiaobao', '星云年付小包', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: '页面：年付专属，每月 60GB 流量' },
    ]),
    plan('planet', '行星基础版', 'monthly-tier', [{ period: 'monthly', price: 25, monthlyGB: 120, reset: RESET, note: CYCLE_DISCOUNT }], {
      deviceLimit: claim('不限制设备数量（页面标注）', 'C', [T]),
    }),
    plan('star', '恒星标准版', 'monthly-tier', [
      { period: 'monthly', price: 50, monthlyGB: 240, reset: RESET, status: 'conflict', note: MD_DIFF('300GB') },
    ]),
    plan('galaxy', '星系专业版', 'monthly-tier', [
      { period: 'monthly', price: 100, monthlyGB: 500, reset: RESET, status: 'conflict', note: MD_DIFF('700GB') },
    ]),
    plan('universe', '寰宇旗舰版', 'monthly-tier', [
      { period: 'monthly', price: 200, monthlyGB: 1000, reset: RESET, status: 'conflict', note: `页面写“每月 1TB”，按 1000GB 记录。${MD_DIFF('1.5TB')}` },
    ]),
  ],
  // 只把页面“当前支持”的地区记为覆盖；“持续增加”的地区不算
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“当前支持香港、台湾、日本、新加坡、马来西亚、美国”，是服务商宣称，未附节点名单。' }),
    region('TW', '台湾', null, 'C', [T], { note: '同上' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
    region('OTHER', '马来西亚', null, 'C', [T], { note: '页面写“当前支持…马来西亚”；该国家不在本站地图点位内。' }),
  ],
  nodeCount: claim(60, 'C', [T], { note: '页面写“60+ 全球节点”，是“不少于 60”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(['VLESS'], 'C', [T], { note: '页面写“结合 VLESS 协议”。' }),
  routeTypes: claim(['iepl', 'relay'], 'C', [T], {
    note: '页面写“高速全中转专线连接”和“企业级 IEPL 专线”，没有说明各节点属于哪一类；为服务商宣称，本站未核验。',
  }),
  clients: claim(
    ['自研客户端：iOS、Android、Windows、macOS、Linux', '兼容 Shadowrocket、Clash、v2rayN、v2rayNG、Surge、Quantumult X、Stash'],
    'C',
    [T],
  ),
  streaming: claim(['Netflix', 'Disney', 'HBO', 'YouTube', 'Hulu', 'BBC iPlayer', 'Amazon Prime Video'], 'C', [T], {
    note: '页面写“覆盖…等平台，4K 内容快速打开”，没有附检测截图；本站未实测。',
  }),
  ai: claim(['ChatGPT', 'Gemini', 'TikTok（页面与 AI 并列）'], 'C', [T], { note: '页面写“支持 OpenAI ChatGPT、Google Bard、Gemini、TikTok 等”，没有检测截图；本站未实测。' }),
  deviceLimit: claim(null, 'D', [T, M], { note: '只有“行星基础版”写明不限制设备数量，其余套餐没有写；汇编资料库把全部套餐写成不限制。' }),
  multiplier: claim(null, 'D', [T], { note: '页面存档没有写节点倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期。页面仍使用“Google Bard”这一已更名的产品名，说明部分文字可能沿用旧模板；“基于 6,286 条使用反馈”和用户好评文字无法核验，本站不采用。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面“持续增加”的地区（韩国、泰国、印尼、菲律宾、越南、英国、德国、法国、土耳其、巴西、阿根廷等）是计划而非现状，本站不在地图上标为覆盖。页面末尾出现“好鸭相关搜索用户”字样，疑为搜索词堆砌，本站不据此推断任何关系。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'yuzhouyun-traffic',
      field: '恒星/星系/寰宇月流量',
      summary: '页面存档与汇编资料库的月流量不同，价格相同。',
      variants: [
        { label: '页面存档：恒星标准版 240GB、星系专业版 500GB、寰宇旗舰版 1TB', sourceId: T, grade: 'C' },
        { label: '汇编资料库：恒星标准版 300GB、星系专业版 700GB、寰宇旗舰版 1.5TB', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档为准录入，三档均标为冲突，不参与精确每 GB 成本排序；待取得带日期的价格页后核验。',
    },
  ],
  editorialNotes: [
    '“星云年付小包 / 行星基础版 / 恒星标准版 / 星系专业版 / 寰宇旗舰版”这套命名同样出现在汇编资料库的灵动云条目里，但灵动云自己的页面存档使用的是另一套名称与价格（见灵动云条目）。本站据此把汇编资料库中的套餐表降级为待核验，不把一家的套餐套用到另一家。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
