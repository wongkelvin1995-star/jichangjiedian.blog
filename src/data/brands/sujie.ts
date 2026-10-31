import { claim, planFactory, region, seed } from '../helpers';

const T = 't21'; // 页面存档：自称“速界官网”品牌站（页脚 © 2026，页面未标注抓取日期）
const M = 'm21';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'sujie', src: T, recorded: null });
const RESET = '页面写“xxxGB 高速流量”与“/ 每月”，未单独写明流量是否每月重置；按月付套餐的额度记录。';

export default seed({
  slug: 'sujie',
  displayRank: 28,
  brandName: '速界 SuJie',
  shortName: '速界',
  nameEn: 'SuJie',
  aliases: ['速界', 'SuJie', 'sujie', '速界官网', '速界机场'],
  uploadFileNo: 21,
  summary:
    '速界的品牌站存档没有标注日期，页面内容很少：三个月付方案（¥15.8 / ¥28.8 / ¥38.8，150GB / 300GB / 1000GB，对应 1 / 3 / 10 台设备）、客户端平台和一条“全球网络节点已完成维护”的公告。页面没有写线路类型、协议、地区和流媒体信息；汇编资料库里的 IEPL、地区和解锁清单在页面存档中找不到依据，本站标为待核验。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“速界官网”与站长给定名称“速界 SuJie”一致。'],
  },
  plans: [
    plan(
      'light',
      '轻量套餐',
      'monthly-tier',
      [{ period: 'monthly', price: 15.8, monthlyGB: 150, reset: RESET }],
      { deviceLimit: claim('支持 1 个设备', 'C', [T]) },
    ),
    plan(
      'enjoy',
      '畅享套餐',
      'monthly-tier',
      [{ period: 'monthly', price: 28.8, monthlyGB: 300, reset: RESET, note: '页面标注“推荐选择”。' }],
      { deviceLimit: claim('支持 3 个设备', 'C', [T]) },
    ),
    plan(
      'pro',
      '专业套餐',
      'monthly-tier',
      [{ period: 'monthly', price: 38.8, monthlyGB: 1000, reset: RESET }],
      { deviceLimit: claim('支持 10 个设备', 'C', [T]) },
    ),
  ],
  // 页面没有地区名单：首屏动画只显示 SIN / LAX / FRA 三个机场代码，其余地区仅见于汇编资料库
  regions: [
    region('SG', '新加坡', null, 'D', [T, M], { note: '页面首屏动画出现 SIN 代码，汇编资料库解释为新加坡节点；页面没有地区列表。' }),
    region('US', '美国', null, 'D', [T, M], { note: '页面首屏动画出现 LAX 代码，汇编资料库解释为洛杉矶节点；页面没有地区列表。' }),
    region('DE', '德国', null, 'D', [T, M], { note: '页面首屏动画出现 FRA 代码，汇编资料库解释为法兰克福节点；页面没有地区列表。' }),
    region('HK', '香港', null, 'D', [M], { note: '仅见于汇编资料库；页面存档没有。' }),
    region('JP', '日本', null, 'D', [M], { note: '仅见于汇编资料库；页面存档没有。' }),
  ],
  nodeCount: claim(100, 'C', [T], { note: '页面写“100+ 全球优选节点”，是“不少于 100”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(null, 'D', [T, M], { note: '页面存档没有写传输协议；汇编资料库的“多协议融合/通用客户端导入”不是协议名称。' }),
  routeTypes: claim(['iepl'], 'D', [M, 't08'], {
    note: '速界自己的页面存档没有任何线路类型信息。汇编资料库写“端到端 IEPL 专线”；第三方评测页在星岛梦页面的“相关内容”里也有一句摘要“速界 SuJie 主打端到端 IEPL”，但对应文章本站没有取得。两处都不是速界自己的页面，因此保持待核验。',
  }),
  clients: claim(['Windows', 'macOS', 'Linux', 'iOS', 'Android'], 'C', [T], { note: '页面客户端下载区列出的平台；页面另有“配置教程”“使用指南”入口。' }),
  streaming: claim(null, 'D', [M], { note: '页面存档没有任何流媒体平台信息，只写“适用于影音娱乐、AI 工具、学习办公”；汇编资料库的 Netflix / Disney+ 不见于页面。' }),
  ai: claim(null, 'D', [M], { note: '页面只泛称“AI 工具”场景，没有列出具体服务；汇编资料库的 ChatGPT / Claude 不见于页面。' }),
  deviceLimit: claim('按套餐区分：1 / 3 / 10 个设备（页面标注）', 'C', [T]),
  multiplier: claim(null, 'D', [T], { note: '页面存档没有写节点倍率。' }),
  notices: [
    {
      type: 'service-notice',
      severity: 'info',
      text: '页面顶部公告：“全球网络节点已完成维护，欢迎选择适合您的套餐。”公告没有日期，也没有说明维护范围与原因。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'warn',
      text: '页面首屏的“实时延迟 18 ms”“99.9% 服务可用性”“LIVE”“SECURE CONNECTED”是写在页面里的展示文字，没有日期、测试环境和统计方法，本站不采用，也不在本站复制这类“实时”展示。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页脚“友情链接”列出多个其他机场与工具站的链接，只说明链接关系，不代表它们与速界属于同一运营方。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'sujie-compiled-claims',
      field: '线路、地区与解锁信息',
      summary: '汇编资料库写了端到端 IEPL、新加坡/洛杉矶/法兰克福/香港/日本、Netflix/Disney+/ChatGPT/Claude 等信息，页面存档里没有对应文字。',
      variants: [
        { label: '页面存档：只有套餐、设备数、客户端平台、100+ 节点、公告', sourceId: T, grade: 'C' },
        { label: '汇编资料库：IEPL、五个地区、流媒体与 AI 清单', sourceId: M, grade: 'D' },
      ],
      handling: '汇编资料库独有的信息全部标为待核验（D），不用于线路与地区筛选的“已确认”状态。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
