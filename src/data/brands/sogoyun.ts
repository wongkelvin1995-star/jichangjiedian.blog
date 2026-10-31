import { claim, planFactory, region, seed } from '../helpers';

const T = 't15'; // 页面存档：自称“Sogo云”的推广落地页（页面未标注抓取日期）
const M = 'm15';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'sogoyun', src: T, recorded: null });
const RESET = '页面：每月流量；提前用完可在用户中心付费重置（页面称 9 折）';
const UNLIMITED = claim('不限制设备数量（页面标注）', 'C', [T]);

export default seed({
  slug: 'sogoyun',
  displayRank: 17,
  brandName: 'Sogo云',
  shortName: 'Sogo云',
  nameEn: 'SogoCloud',
  aliases: ['Sogo云', 'SOGO云', 'Sogo', 'SogoCloud', 'sogoyun'],
  uploadFileNo: 15,
  summary:
    'Sogo云的页面存档没有标注日期，列出一个年付小包、四档月流量套餐和四档不限时按量流量包。页面存档与汇编资料库对“顶配版/旗舰版”的月流量（1050GB 与 1000GB）以及两档按量包的流量（120/250GB 与 100/200GB）记录不同，这几项本站标为冲突，不参与精确排序。',
  identity: {
    status: 'name-confirmed',
    notes: [
      '页面名称“Sogo云”与站长给定名称一致。页面带有“机场推荐阅读”栏目和用户好评文字，更像推广落地页，不能当作服务商后台数据。',
    ],
  },
  plans: [
    plan(
      'xiaobao',
      '小包-年付版',
      'annual-small',
      [{ period: 'annual', price: 98, monthlyGB: 60, reset: '页面：每月 60GB 流量（限定年付专属）' }],
      { deviceLimit: claim(null, 'D', [T], { note: '页面 FAQ 写“除特殊说明的极简套餐外”主要套餐不限设备，小包年付版未写设备数。' }) },
    ),
    plan('basic', '基础版', 'monthly-tier', [{ period: 'monthly', price: 25, monthlyGB: 150, reset: RESET }], { deviceLimit: UNLIMITED }),
    plan('select', '优选版', 'monthly-tier', [{ period: 'monthly', price: 45, monthlyGB: 350, reset: RESET }], { deviceLimit: UNLIMITED }),
    plan('plus', '强化版', 'monthly-tier', [{ period: 'monthly', price: 80, monthlyGB: 550, reset: RESET }], { deviceLimit: UNLIMITED }),
    plan(
      'top',
      '顶配版（汇编资料库称“旗舰版”）',
      'monthly-tier',
      [
        {
          period: 'monthly',
          price: 150,
          monthlyGB: 1050,
          reset: RESET,
          status: 'conflict',
          note: '页面写“每月 1050GB 流量”，汇编资料库写“旗舰版 1000GB/月”；价格相同，流量不同，本站不确定哪一个是当前有效值。',
        },
      ],
      { deviceLimit: UNLIMITED },
    ),
    plan('pack-120', '按量付费 120GB（不限时）', 'one-time-pack', [
      {
        period: 'one-time',
        price: 120,
        totalGB: 120,
        reset: '页面：长期有效，用完为止',
        status: 'conflict',
        note: '页面写 120GB，汇编资料库写“轻度买断包 100GB”，价格相同（¥120）。',
      },
    ]),
    plan('pack-250', '按量付费 250GB（不限时）', 'one-time-pack', [
      {
        period: 'one-time',
        price: 220,
        totalGB: 250,
        reset: '页面：长期有效，用完为止',
        status: 'conflict',
        note: '页面写 250GB，汇编资料库写“常用买断包 200GB”，价格相同（¥220）。',
      },
    ]),
    plan('pack-500', '按量付费 500GB（不限时）', 'one-time-pack', [
      { period: 'one-time', price: 450, totalGB: 500, reset: '页面：长期有效，用完为止' },
    ]),
    plan('pack-1000', '按量付费 1000GB（不限时）', 'one-time-pack', [
      { period: 'one-time', price: 850, totalGB: 1000, reset: '页面：长期有效，用完为止' },
    ]),
  ],
  // 页面只在基础版条目里写“60+节点覆盖(港台新日美等)”，没有地区节点数
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“港台新日美等”，是服务商宣称的地区范围，未附节点名单。' }),
    region('TW', '台湾', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
  ],
  nodeCount: claim(60, 'C', [T], { note: '页面写“全球60+节点”，是“不少于 60”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(null, 'D', [T, M], {
    note: '页面存档没有写传输协议（只写“自研客户端”）；汇编资料库的“自研协议/Clash/Shadowrocket/Sing-box”不见于页面。',
  }),
  routeTypes: claim(null, 'D', [T, M], {
    note: '页面写“顶级加密专线”，没有写明 IPLC/IEPL；汇编资料库的“BGP 智能路由”不见于页面。',
  }),
  clients: claim(['自研客户端：Windows、macOS、Android、iOS'], 'C', [T], { note: '页面 FAQ 写明支持的平台；页面另有 Clash for Windows 配置教程的文章标题。' }),
  streaming: claim(['Netflix', 'Disney+', 'HBO Max', 'Hulu', 'YouTube Premium'], 'C', [T], {
    note: '页面写“完美解锁”，没有附检测截图；页面的用户好评文字不作为证据。',
  }),
  ai: claim(['ChatGPT', 'Claude', 'Midjourney'], 'C', [T], { note: '页面写“专线优化…访问网络”，没有附检测截图；本站未实测。' }),
  deviceLimit: claim('基础版及以上套餐不限制在线设备数量（页面标注）；小包年付版未写', 'C', [T]),
  multiplier: claim(null, 'D', [T], { note: '页面存档没有写节点流量倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '页面存档没有标注日期，且含“延迟极低”“4K秒开”等营销用语和用户好评文字；这些均无测试数据，本站不采用。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'sogoyun-top-tier-traffic',
      field: '顶配版/旗舰版月流量',
      summary: '页面存档写 1050GB/月，汇编资料库写 1000GB/月，价格同为 ¥150。',
      variants: [
        { label: '页面存档：顶配版 1050GB/月', sourceId: T, grade: 'C' },
        { label: '汇编资料库：旗舰版 1000GB/月', sourceId: M, grade: 'D' },
      ],
      handling: '标为冲突，不参与精确每 GB 成本排序；待取得带日期的价格页后核验。',
    },
    {
      conflictId: 'sogoyun-payg-traffic',
      field: '按量付费流量包的流量',
      summary: '页面存档为 120GB/250GB/500GB/1000GB，汇编资料库为 100GB/200GB/500GB/1000GB，价格一致（¥120/¥220/¥450/¥850）。',
      variants: [
        { label: '页面存档：120GB、250GB', sourceId: T, grade: 'C' },
        { label: '汇编资料库：100GB、200GB', sourceId: M, grade: 'D' },
      ],
      handling: '120GB/250GB 两档标为冲突；500GB 与 1000GB 两档两处一致，按页面记录。',
    },
  ],
  editorialNotes: [
    '站长在总指令中已指出“Sogo云公开价格存在不同记录”；本站把两处记录的差异逐项列出，而不是择一当作确定值。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
