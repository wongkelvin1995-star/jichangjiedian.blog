import { claim, planFactory, region, seed } from '../helpers';

const T = 't11'; // 页面存档：自称“U1s1有一说一”品牌站（页脚版权 2026-2029，页面未标注抓取日期）
const M = 'm11';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'u1s1', src: T, recorded: null });
const RESET = '页面：购买日起每自然月自动重置';

export default seed({
  slug: 'u1s1',
  displayRank: 20,
  brandName: 'U1S1 有一说一',
  shortName: 'U1S1',
  nameEn: 'U1s1',
  aliases: ['U1S1', 'U1s1', 'u1s1', '有一说一', 'U1S1有一说一', 'U1S1机场'],
  uploadFileNo: 11,
  summary:
    'U1S1 的品牌站存档没有标注日期，列出基础方案（¥96/年，60GB/月）和五个月付方案（¥20–¥180/月，120GB–1500GB）以及一个按需定制的独享专线（¥600/月），自述 BGP 三网优化 + IEPL 专线出口。汇编资料库的套餐表与页面存档完全不同，本站以页面存档为准并把差异记为冲突。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“U1s1有一说一”与站长给定名称一致。'],
  },
  plans: [
    plan('basic', '基础方案（入门体验包）', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: RESET, note: '页面：¥96/年，60GB/月；页面未展示该方案的月付、季付。' },
    ]),
    plan('advanced', '进阶方案（日常畅玩包）', 'monthly-tier', [{ period: 'monthly', price: 20, monthlyGB: 120, reset: RESET }]),
    plan('high', '高端方案（重度享受包）', 'monthly-tier', [{ period: 'monthly', price: 40, monthlyGB: 300, reset: RESET }]),
    plan('business', '商业方案（全能畅享包）', 'monthly-tier', [{ period: 'monthly', price: 100, monthlyGB: 700, reset: RESET }]),
    plan('team', '团队方案（团队协作包）', 'monthly-tier', [{ period: 'monthly', price: 180, monthlyGB: 1500, reset: RESET, note: '页面同时写 1.5TB 与 1500GB/月，本站按 1500GB 记录。' }]),
    plan('dedicated', '独享专线（专属定制包）', 'custom', [
      { period: 'monthly', price: 600, reset: '页面：月流量“按需定制”，未写具体数字', note: '页面定位跨境电商、TikTok 运营、海外直播；月流量未公开，不参与每 GB 计算。' },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“香港、日本、新加坡、美国、英国、德国、法国等多地”，是服务商宣称的地区范围，未附节点名单。' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
    region('GB', '英国', null, 'C', [T], { note: '同上' }),
    region('DE', '德国', null, 'C', [T], { note: '同上' }),
    region('FR', '法国', null, 'C', [T], { note: '同上' }),
    region('TW', '台湾', null, 'D', [M], { note: '仅见于汇编资料库“香港、日本、新加坡、美国、台湾等热门出口”；页面存档没有台湾。' }),
  ],
  protocols: claim(['V2Ray', 'Trojan'], 'C', [T], {
    conflict: true,
    note: '页面写“支持 Shadowrocket、Clash、V2Ray、Trojan 等协议”，客户端与协议混写；汇编资料库写 VLESS / Trojan / 通用订阅，两处不完全一致。',
  }),
  routeTypes: claim(['bgp', 'iepl'], 'C', [T], { note: '页面写“BGP 三网智能优化 + IEPL 专线出口”，没有说明各节点属于哪一类；为服务商宣称，本站未核验。' }),
  clients: claim(['Shadowrocket', 'Clash', '适配 iOS / Android / Windows / macOS / 路由器（页面标注）'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+', 'HBO', 'DAZN', 'TikTok'], 'C', [T], { note: '页面写“主流流媒体全解锁”，没有附检测截图；用户评价文字不作为证据。' }),
  ai: claim(['ChatGPT', 'Claude', 'Midjourney'], 'C', [T], { note: '页面写“完美支持”，没有附检测截图；本站未实测。' }),
  deviceLimit: claim('不受设备数量限制（页面 FAQ）', 'C', [T]),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期；页脚版权年份写作“2026-2029”（晚于当前年份，疑为模板写法），本站不据此判断上线时间。页面称“每两个月会额外增加带宽资源”和“2Gbps+ 带宽”，均为服务商宣称，没有测试数据。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面的用户评价与“4.9”评分没有来源和日期，本站不采用；页面提到的优惠与实付金额以结算页为准。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'u1s1-plan-catalog',
      field: '套餐表',
      summary: '汇编资料库的套餐表与页面存档不是同一套：流量档位、价格与名称均不同。',
      variants: [
        {
          label: '页面存档：基础 ¥96/年 60GB；进阶 ¥20 120GB；高端 ¥40 300GB；商业 ¥100 700GB；团队 ¥180 1500GB；独享专线 ¥600',
          sourceId: T,
          grade: 'C',
        },
        {
          label: '汇编资料库：基础 150GB ¥25；标准 300GB ¥45；进阶 600GB ¥80；尊享 1000GB ¥140；买断 100GB ¥108、300GB ¥298；年付尝鲜 ¥96',
          sourceId: M,
          grade: 'D',
        },
      ],
      handling: '以页面存档为准录入套餐；汇编资料库的另一套价格仅作为冲突线索保留，不进入价格表与排序。',
    },
  ],
  editorialNotes: [
    '页面写“购买日起每自然月自动重置”，本站按“每月重置”记录流量，并在价格表中说明该口径来自页面。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
