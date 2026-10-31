import { claim, planFactory, region, seed } from '../helpers';

const T = 't10'; // 页面存档：自称“唯兔云 OnlyRabbit”品牌站（页脚 © 2025–2026，页面未标注抓取日期）
const M = 'm10';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'weituyun', src: T, recorded: null });
const OUTAGE =
  '页面服务公告称唯兔云“近期遭受攻击，节点全部暂时无法使用”，公告没有日期，当前是否恢复未知；因此该价格本站标为冲突，不参与排序。';
const ALT =
  '页面公告称套餐区展示的是“临时推荐的替代机场”的套餐，而不是唯兔云自己的套餐；汇编资料库把它们当作唯兔云的套餐。本站按冲突处理，不参与排序。';

export default seed({
  slug: 'weituyun',
  displayRank: 12,
  brandName: '唯兔云',
  shortName: '唯兔云',
  nameEn: 'OnlyRabbit',
  aliases: ['唯兔云', 'V2云', 'OnlyRabbit', 'Only Rabbit', '唯兔云机场', 'weituyun', 'weitucloud'],
  uploadFileNo: 10,
  summary:
    '唯兔云的品牌站存档没有标注日期，而且自相矛盾：首屏写“正常运营中”“节点可用率 85%”，服务公告却写“近期遭受攻击，节点全部暂时无法使用”，并称套餐区展示的是“临时推荐的替代机场”的套餐。本站把全部价格标为冲突，在取得带日期的恢复说明前不建议把它当作可用的购买参考。',
  identity: {
    status: 'owner-confirmed',
    notes: [
      '资料页面名称为“唯兔云 OnlyRabbit”，汇编资料库写作“OnlyRabbit (V2云)”。站长于 2026-10-28 确认统一使用“唯兔云”；“V2云”“OnlyRabbit”作为别名保留，方便搜索。',
    ],
  },
  plans: [
    plan('annual', '年付套餐（IPLC 专线）', 'annual-small', [
      {
        period: 'annual',
        price: 79,
        monthlyGB: 45,
        reset: '页面：¥6.6/月 · 45GB（年付）',
        status: 'conflict',
        note: `页面只写“年付低至 6.6 元/月”，年费总额 ¥79 来自汇编资料库（6.6×12≈79）。${OUTAGE}`,
      },
    ]),
    plan('monthly-100', '月付 100GB', 'monthly-tier', [
      {
        period: 'monthly',
        price: 14.9,
        monthlyGB: 100,
        reset: '页面：月付 100GB',
        status: 'conflict',
        note: `页面特色文字写“月付 100GB 仅 14.9 元”，没有对应的套餐卡片。${OUTAGE}`,
      },
    ]),
    plan('alt-entry', '入门加速（页面称“替代机场”套餐）', 'monthly-tier', [
      {
        period: 'monthly',
        price: 9.9,
        monthlyGB: 100,
        reset: '页面：100GB 月流量，带宽上限 1000Mbps',
        status: 'conflict',
        note: `${ALT} 该套餐写明的节点为香港、日本、美国、德国。`,
      },
    ]),
    plan('alt-payg', '永久自由行（页面称“替代机场”套餐）', 'one-time-pack', [
      {
        period: 'one-time',
        price: 30,
        totalGB: 200,
        reset: '页面：200GB 一次性，永久有效，用完为止',
        status: 'conflict',
        note: ALT,
      },
    ]),
    plan('alt-business', '商务专业定制（页面称“替代机场”套餐）', 'custom', [
      {
        period: 'monthly',
        price: 188,
        reset: '页面：独立专属节点、私人定制；流量未写',
        status: 'conflict',
        note: ALT,
      },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“覆盖香港、台湾、日本、新加坡、美国、韩国、东南亚”，是服务商宣称的地区范围；同页公告称节点全部暂时无法使用。' }),
    region('TW', '台湾', null, 'C', [T], { note: '同上' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
    region('KR', '韩国', null, 'C', [T], { note: '同上' }),
    region('OTHER', '东南亚（页面未列国家）', null, 'C', [T], { note: '页面只写“东南亚”，不在地图上标记具体国家。' }),
  ],
  protocols: claim(['Trojan', 'Shadowsocks'], 'C', [T], { note: '页面写“全 IPLC 内网专线 + Trojan/SS 协议”；汇编资料库另加 Clash、Sing-box（这是客户端，不是协议）。' }),
  routeTypes: claim(['iplc'], 'C', [T], { note: '页面写“全 IPLC 内网专线”，为服务商宣称，本站未核验；同页公告称节点全部暂时无法使用。' }),
  clients: claim(['Clash', '小火箭（Shadowrocket）'], 'C', [T], { note: '页面常见问题提到重新导入 Clash / 小火箭；另称赠送小火箭账号、TG 代注册。' }),
  streaming: claim(['Netflix', 'Disney+', 'YouTube', 'TikTok'], 'C', [T], { note: '页面写“完美解锁”“4K/8K”，没有检测截图；用户评价文字不作为证据。' }),
  ai: claim(['ChatGPT', 'Gemini'], 'C', [T], { note: '页面写支持，没有检测截图；本站未实测。' }),
  deviceLimit: claim('不限设备数量（页面标注）', 'C', [T]),
  multiplier: claim('无倍率（页面标注）', 'C', [T], { note: '汇编资料库写“全节点 1x”，措辞不同但含义一致。' }),
  notices: [
    {
      type: 'service-notice',
      severity: 'high',
      text: '页面服务公告（出现两次，无日期）：“由于唯兔云近期遭受攻击，节点全部暂时无法使用。以下为临时推荐的替代机场——价格更便宜、速度更快更稳……欢迎放心选购。”这意味着套餐区展示的可能不是唯兔云自己的套餐，而且本站无法确认服务是否已经恢复。',
      sourceIds: [T],
    },
    {
      type: 'operational-risk',
      severity: 'high',
      text: '同一页面首屏写“正常运营中”“节点可用率 85%”，与服务公告“节点全部暂时无法使用”直接矛盾；两处都没有日期和统计方法，本站不采用“节点可用率 85%”。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面的“用户这样说”评价文字、“Netflix 4K”“香港节点延迟 20ms 左右”等描述没有测试截图和日期，本站不采用。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'weituyun-outage-vs-running',
      field: '服务状态',
      summary: '页面首屏写“正常运营中”和“节点可用率 85%”，服务公告写“节点全部暂时无法使用”。',
      variants: [
        { label: '首屏：2025年上线 · 正常运营中 · 节点可用率 85%', sourceId: T, grade: 'C' },
        { label: '服务公告：近期遭受攻击，节点全部暂时无法使用', sourceId: T, grade: 'C' },
      ],
      handling: '两种说法并列展示并标为冲突；在取得带日期的恢复说明前，本站不写“可用”，也不把该品牌的价格放进精确排序。',
    },
    {
      conflictId: 'weituyun-alt-plans',
      field: '套餐归属',
      summary: '套餐区展示的 ¥9.9 / ¥30 / ¥188 套餐，页面公告称是“临时推荐的替代机场”的套餐；汇编资料库当作唯兔云自己的套餐。',
      variants: [
        { label: '页面公告：替代机场的临时推荐', sourceId: T, grade: 'C' },
        { label: '汇编资料库：唯兔云自己的套餐', sourceId: M, grade: 'D' },
      ],
      handling: '三个套餐保留在资料中但标为冲突，并注明归属待核验。',
    },
  ],
  editorialNotes: [
    '这家品牌的资料可以作为“如何识别风险信号”的案例：同一页面里的营销文字和服务公告互相矛盾，且全部没有日期。本站不对它的实际运营状态下结论。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
