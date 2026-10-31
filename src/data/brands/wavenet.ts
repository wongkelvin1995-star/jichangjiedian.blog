import { claim, planFactory, region, seed } from '../helpers';

const T = 't04'; // 页面存档：JC 机场推荐指南 浪网测评（页面标注发布与最后核验 2026-09-19）
const M = 'm04';
const D = '2026-09-19';
const plan = planFactory({ brandId: 'wavenet', src: T, recorded: D });

export default seed({
  slug: 'wavenet',
  displayRank: 9,
  brandName: '浪网 WaveNet',
  shortName: '浪网',
  nameEn: 'WaveNet',
  aliases: ['浪网', 'langwang', 'wavenet', 'WaveNet', '浪网机场'],
  uploadFileNo: 4,
  summary:
    '浪网的页面存档（第三方评测站，2026-09-19）只列出三档套餐，且页首“起始价格 18 元、120GB”与表格“16 元、100GB”互相矛盾；页内测速表没有测试日期和原始截图。汇编资料库给出的是另一整套更大的套餐目录，两边无法对应，因此浪网整体按“资料冲突”处理。',
  identity: { status: 'name-confirmed', notes: [] },
  plans: [
    plan('light', '基础轻量版', 'monthly-tier', [
      {
        period: 'monthly',
        price: 16,
        monthlyGB: 100,
        reset: null,
        status: 'conflict',
        note: '页面表格写 16 元/月、100GB/月，付款周期“月付 / 年付”（未给年付价格）；页首摘要却写“起始价格 18 元/月、基础流量 120GB/月”，同页不一致。',
      },
    ]),
    plan('standard', '标准进阶版', 'monthly-tier', [
      { period: 'monthly', price: 32, monthlyGB: 280, reset: null, note: '页面写付款周期“月付 / 季付 / 年付”，但只给出 32 元/月，没有季付、年付价格。' },
    ]),
    plan('flagship', '旗舰大户版', 'monthly-tier', [{ period: 'monthly', price: 56, monthlyGB: 550, reset: null, note: '页面未写明付款周期，按表中“元/月”记录为月付。' }]),
  ],
  regions: [
    region('US', '美国', null, 'C', [T], { recordedAt: D, note: '页面导读：覆盖美、日、港、台、新、韩等热门地区' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D }),
    region('HK', '香港', null, 'C', [T], { recordedAt: D }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D }),
    region('KR', '韩国', null, 'C', [T], { recordedAt: D }),
  ],
  protocols: claim(['Shadowsocks', 'V2ray'], 'C', [T], { recordedAt: D, note: '仅见于页面测速表的“协议架构”列，页面其他位置没有专门说明。' }),
  routeTypes: claim(['iplc', 'iepl', 'relay'], 'C', [T], { recordedAt: D, note: '来自页面测速表节点标签（IPLC 专线 / IEPL 极速 / 中转），无独立证据。' }),
  clients: claim(['Clash Verge Rev', 'Sing-box', 'Shadowrocket', 'Surge'], 'C', [T], { recordedAt: D }),
  streaming: claim(null, 'D', [T], { note: '页面测速表写“8K 秒开”“4K 60fps”，没有日期与原始证据，不采用。' }),
  ai: claim(null, 'D', [T], { note: '页面测速表有“ChatGPT 解锁”列，没有日期与原始证据，不采用。' }),
  deviceLimit: claim(null, 'D', [T], { note: '页面只提醒“请勿公开分享订阅以免超出最大在线 IP 限制”，没有具体数量。' }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '页面内的“晚高峰实测测速图”（香港 852 Mbps 等）没有测试日期、原始截图或日志，且数值整齐偏高，本站标记为 D（待核验），不进入本站任何统计。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'wavenet-plan-catalog',
      field: '整套套餐目录',
      summary:
        '页面存档：基础轻量版 16 元/100GB、标准进阶版 32 元/280GB、旗舰大户版 56 元/550GB；汇编资料库：年付标准 ¥119（80GB/月）、入门 ¥30/150GB、进阶 ¥70/400GB、高端 ¥120/800GB、商业 ¥200/2TB，另有 180/450/900GB 买断包与 ¥680 定制线路包。',
      variants: [
        { label: '页面存档（本站采用，C）', sourceId: T, grade: 'C' },
        { label: '汇编资料库（未采用，D）', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档记录；整体不参与精确价格排序，等待服务商后台价格截图。',
    },
    {
      conflictId: 'wavenet-page-internal',
      field: '页面内部不一致',
      summary: '页首摘要“起始价格 18 元/月、120GB/月”与套餐表“16 元/月、100GB/月”不一致。',
      variants: [{ label: '同一页面存档', sourceId: T, grade: 'C' }],
      handling: '两个数值均不作为确定值。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
