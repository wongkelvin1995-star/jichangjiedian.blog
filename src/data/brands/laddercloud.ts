import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't03'; // 页面存档：梯子云 LadderCloud 品牌站（laddercloud.cyou）
const M = 'm03';
const plan = planFactory({ brandId: 'laddercloud', src: T });
const RESET = '页面：月流量档，每个月刷新额定流量';

/** 梯子云页面为每档给出 月/季/半年/年/两年/三年 六种周期的总价 */
const tier = (gb: number, p: [number, number, number, number, number, number]): OfferInput[] => [
  { period: 'monthly', price: p[0], monthlyGB: gb, reset: RESET },
  { period: 'quarterly', price: p[1], monthlyGB: gb, reset: RESET },
  { period: 'semiannual', price: p[2], monthlyGB: gb, reset: RESET },
  { period: 'annual', price: p[3], monthlyGB: gb, reset: RESET },
  { period: 'biennial', price: p[4], monthlyGB: gb, reset: RESET },
  { period: 'triennial', price: p[5], monthlyGB: gb, reset: RESET },
];

export default seed({
  slug: 'laddercloud',
  displayRank: 7,
  brandName: '梯子云 LadderCloud',
  shortName: '梯子云',
  nameEn: 'LadderCloud',
  aliases: ['梯子', 'tizi', 'tiziyun', 'laddercloud', 'LadderCloud', '梯子云节点'],
  uploadFileNo: 3,
  summary:
    '梯子云的页面存档提供了四档月流量套餐的六种付费周期价格、60GB/年的保活年付包和三档一次性流量包。页面内置的“实时节点监控”和用户评价没有时间与来源，本站不当作测速数据。',
  identity: { status: 'name-confirmed', notes: [] },
  plans: [
    plan('basic', '初阶网络·基础视界（125GB/月）', 'monthly-tier', tier(125, [25, 71.25, 135, 255, 480, 675])),
    plan('mid', '中阶加速·极清多线（350GB/月）', 'monthly-tier', tier(350, [60, 171, 324, 612, 1152, 1620])),
    plan('high', '高阶专线·全球智联（750GB/月）', 'monthly-tier', tier(750, [110, 313.5, 594, 1122, 2112, 2970])),
    plan('top', '顶阶商业·全球骨干（1.6TB/月）', 'monthly-tier', tier(1600, [190, 541.5, 1026, 1938, 3648, 5130])),
    plan('annual-keep', '天梯随行·年度保活（60GB/年）', 'annual-small', [
      {
        period: 'annual',
        price: 89,
        totalGB: 60,
        reset: '页面写“60 GB / 年”，按全年总量记录',
        status: 'conflict',
        note: '汇编资料库写“70GB/年”，页面存档写 60GB/年，不一致；本站按页面存档记录，不参与每 GB 排序。',
      },
    ]),
    plan('pack-120', '云端买断·永不限时轻量包（120GB）', 'one-time-pack', [
      { period: 'one-time', price: 169, totalGB: 120, reset: '一次性，永久有效直到扣完', status: 'conflict', note: '汇编资料库写 160GB，页面存档写 120GB。' },
    ]),
    plan('pack-350', '云端买断·永不限时标准包（350GB）', 'one-time-pack', [
      { period: 'one-time', price: 449, totalGB: 350, reset: '一次性，永久有效直到扣完', status: 'conflict', note: '汇编资料库写 450GB，页面存档写 350GB。' },
    ]),
    plan('pack-700', '云端买断·永不限时精英包（700GB）', 'one-time-pack', [
      { period: 'one-time', price: 849, totalGB: 700, reset: '一次性，永久有效直到扣完', status: 'conflict', note: '汇编资料库写 900GB，页面存档写 700GB。' },
    ]),
    plan('custom-500', '云端独享·私人定制专线（500GB/月）', 'custom', [
      { period: 'monthly', price: 650, monthlyGB: 500, reset: RESET, note: '页面写“最高抗封锁定制协议（TUIC/Hysteria）”，为服务商宣称。' },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面“节点监控”小组件出现“香港 HONGKONG IPLC 01”' }),
    region('JP', '日本', null, 'C', [T], { note: '“日本 TOKYO BGP 03”' }),
    region('SG', '新加坡', null, 'C', [T], { note: '“新加坡 SINGAPORE BGP 02”' }),
    region('US', '美国', null, 'C', [T], { note: '“美国 SILICONVALLEY BGP 01”' }),
    region('TW', '台湾', null, 'C', [T], { note: '“台湾 TAIPEI IPLC 02”' }),
    region('KR', '韩国', null, 'C', [T], { note: '“韩国 SEOUL BGP 01”' }),
  ],
  nodeCount: claim(50, 'C', ['owner-2026-10-28'], { recordedAt: '2026-10-29', note: '站长 2026-10-29 确认梯子云有 50+ 个节点（不少于 50 个的下限说法），没有分地区数量。' }),
  protocols: claim(null, 'D', [T, M], { note: '页面没有逐一列出协议（仅提到 AES-256 加密，定制线路提到 TUIC/Hysteria）；汇编资料库写 Shadowsocks / VLESS / Trojan，未采用。' }),
  routeTypes: claim(['bgp', 'iplc'], 'C', [T], { note: '基础档写“高速优质 BGP 节点”，中阶以上写“全节点高速 IPLC 专线中转”，不同套餐线路不同。' }),
  clients: claim(['自有 Android / iOS 客户端', 'Clash', 'Clash Verge', 'Shadowrocket', 'Sing-box', 'Surge', 'v2rayN', 'Quantumult X'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+'], 'C', [T], { note: '页面套餐要点列出，本站未实测。' }),
  ai: claim(['ChatGPT（基础 AI 服务）'], 'C', [T], { note: '页面套餐要点列出，本站未实测。' }),
  deviceLimit: claim('不限制日常在线设备种类（页面标注，未写具体数量）', 'C', [T]),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有写，未采用。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面内的“全球核心节点监控”（延迟与下行速度）和用户评价没有时间、测试环境与来源，本站不作为测速数据或用户评价引用。',
      sourceIds: [T],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '页面称购买后 24 小时内且已用流量不超过 2GB，可无理由全额退款（服务商宣称，退款以实际条款为准）。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'laddercloud-plan-names-sizes',
      field: '套餐名称、保活包与买断包容量',
      summary:
        '页面存档：基础 125GB、保活 60GB/年、买断 120/350/700GB、顶阶 1.6TB、高阶 750GB；汇编资料库：基础 120GB、保活 70GB/年、买断 160/450/900GB、顶阶 1.5TB、高阶 700GB，且套餐名称不同（进阶冲浪、商务旗舰、尊享星云等）。',
      variants: [
        { label: '页面存档（本站采用，C）', sourceId: T, grade: 'C' },
        { label: '汇编资料库（未采用，D）', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档为准；涉及容量冲突的套餐不参与每 GB 排序。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
