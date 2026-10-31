import { claim, planFactory, region, seed } from '../helpers';

const T = 't01'; // 页面存档：第三方评测页 暮光加速测评（页面标注最后核验日期 2026-09-19）
const M = 'm01';
// 节点总数：站长 2026-10-29 确认 55 个
const plan = planFactory({ brandId: 'muguangjiasu', src: T, recorded: '2026-09-19' });

export default seed({
  slug: 'muguangjiasu',
  displayRank: 2,
  brandName: '暮光加速',
  shortName: '暮光加速',
  nameEn: 'Twilight',
  aliases: ['暮光', 'muguang', 'twilight', 'Twilight', '暮光加速线路'],
  uploadFileNo: 1,
  summary:
    '暮光加速的资料来自一份第三方评测页存档（页面自述最后核验日期 2026-09-19）。页面写明年付轻量版为 70GB/年，汇编资料库误写成每月 70GB，本站以页面存档为准并标注冲突。',
  identity: { status: 'name-confirmed', notes: [] },
  plans: [
    plan('basic', '基础版', 'monthly-tier', [{ period: 'monthly', price: 20, monthlyGB: 120, reset: '页面提示：确认是自然月清零还是购买日周期重置' }]),
    plan('standard', '标准版', 'monthly-tier', [{ period: 'monthly', price: 40, monthlyGB: 300, reset: '同上' }]),
    plan('flagship', '旗舰版', 'monthly-tier', [{ period: 'monthly', price: 100, monthlyGB: 700, reset: '同上' }]),
    plan('supreme', '至尊版', 'monthly-tier', [{ period: 'monthly', price: 180, monthlyGB: 1500, reset: '同上（1.5TB 按 1500GB 记录）' }]),
    plan('annual-lite', '年付轻量版', 'annual-small', [
      {
        period: 'annual',
        price: 109,
        totalGB: 70,
        reset: '页面写“70GB/年”，按全年总量记录',
        status: 'conflict',
        note: '页面存档写“70GB/年”；汇编资料库写“70 GB / 月”。以页面存档为准，但因两份资料不一致，不参与每 GB 成本排序。',
      },
    ]),
    plan('pack-150', '一次性流量包 150GB', 'one-time-pack', [{ period: 'one-time', price: 219, totalGB: 150, reset: '不限时' }]),
    plan('pack-400', '一次性流量包 400GB', 'one-time-pack', [{ period: 'one-time', price: 529, totalGB: 400, reset: '不限时' }]),
    plan('pack-800', '一次性流量包 800GB', 'one-time-pack', [{ period: 'one-time', price: 959, totalGB: 800, reset: '不限时' }]),
    plan('custom', '私人定制', 'custom', [{ period: 'custom', price: 600, reset: null, note: '页面标注“600 元/月 · 独立专线”，流量未写明。' }]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: '2026-09-19', note: '节点数量未公布' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: '2026-09-19' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: '2026-09-19' }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: '2026-09-19' }),
    region('US', '美国', null, 'C', [T], { recordedAt: '2026-09-19' }),
  ],
  nodeCount: claim(55, 'C', ['owner-2026-10-28'], { recordedAt: '2026-10-29', note: '站长 2026-10-29 确认暮光加速共 55 个节点；没有分地区数量。' }),
  protocols: claim(['Shadowsocks', 'Trojan'], 'C', [T], { recordedAt: '2026-09-19' }),
  routeTypes: claim(null, 'D', [T, M], {
    conflict: true,
    note: '页面存档未标明线路类型；汇编资料库自相矛盾（资料卡写 IPLC，分类指南归入 BGP 多线中继），均未采用。',
  }),
  clients: claim(['Clash', 'Shadowrocket', '通用订阅导入', 'Windows', 'macOS', 'iOS', 'Android'], 'C', [T], { recordedAt: '2026-09-19' }),
  streaming: claim(['侧重晚高峰影音表现（页面描述，未列平台）'], 'C', [T], { note: '第三方页面描述，非本站实测。' }),
  ai: claim(['常用媒体和 AI 工具兼容（页面泛称）'], 'C', [T], { note: '未列具体 AI 平台，非本站实测。' }),
  deviceLimit: claim(null, 'D', [T, M], { note: '页面提示“遵守服务商设定的单账号并发连接 IP 数规则”但未写具体数量；汇编库称“周期套餐不限制”，未采用。' }),
  multiplier: claim(null, 'D', [M], { note: '仅汇编资料库写“全节点 1x”，页面存档未写，待核验。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档同时含对其他品牌的排名式推荐文字，本站未采用，也不转述这类排名。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'muguangjiasu-annual-70',
      field: '年付轻量版流量口径',
      summary: '页面存档：¥109/年，70GB/年；汇编资料库：70GB/月。',
      variants: [
        { label: '页面存档（本站采用）', sourceId: T, grade: 'C' },
        { label: '汇编资料库', sourceId: M, grade: 'D' },
      ],
      handling: '按全年总量 70GB 展示，不参与每 GB 排序，待服务商后台核验。',
    },
    {
      conflictId: 'muguangjiasu-route',
      field: '线路类型',
      summary: '汇编资料库资料卡写 IPLC，分类指南归入 BGP 多线中继；页面存档没有线路类型。',
      variants: [{ label: '汇编资料库（自相矛盾）', sourceId: M, grade: 'D' }],
      handling: '线路类型留空，不参与线路筛选。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
