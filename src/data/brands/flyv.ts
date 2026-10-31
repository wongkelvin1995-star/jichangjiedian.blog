import { claim, planFactory, region, seed } from '../helpers';

const T = 't02'; // 页面存档：飞v官网（flyv.mom）
const M = 'm02';
const plan = planFactory({ brandId: 'flyv', src: T });
const RESET = '页面：每月高速流量额度';

export default seed({
  slug: 'flyv',
  displayRank: 8,
  brandName: '飞V（FLYV）',
  shortName: '飞V',
  nameEn: 'FLYV',
  aliases: ['飞v', '飞V', 'flyv', 'FLYV', 'fly v', 'feiv', '飞v官网'],
  uploadFileNo: 2,
  summary:
    '飞V（FLYV）的页面存档给出六档按月套餐的价格、月流量与在线设备数上限，并写明体验套餐不含 IPLC。页面里的“实时延迟”和用户评价没有时间与来源，不作为测速或评价引用。注意：飞V 与 Firefly 是不同品牌，本站不合并。',
  identity: { status: 'name-confirmed', notes: ['飞V 不等于 Firefly；两者在本站是两条独立记录。'] },
  plans: [
    plan('trial', '体验套餐', 'monthly-tier', [{ period: 'monthly', price: 9.9, monthlyGB: 15, reset: RESET, note: '页面：全球 BGP 中继节点，限制 1 个在线客户端，不提供内网 IPLC 专线。' }]),
    plan('basic', '基础套餐', 'monthly-tier', [{ period: 'monthly', price: 19.9, monthlyGB: 100, reset: RESET, note: '页面：限制 2 个在线客户端，最高 150Mbps 速率带宽。' }]),
    plan('standard', '标准套餐', 'monthly-tier', [
      {
        period: 'monthly',
        price: 29.9,
        monthlyGB: 250,
        reset: RESET,
        status: 'conflict',
        note: '页面写 250GB/月；汇编资料库写 260GB/月（D）。页面：IPLC 专线 + BGP 中继，限制 3 个在线客户端，最高 300Mbps。',
      },
    ]),
    plan('flagship', '旗舰套餐', 'monthly-tier', [{ period: 'monthly', price: 49.9, monthlyGB: 500, reset: RESET, note: '页面：全节点 IPLC 专线，限制 5 个在线客户端，最高 500Mbps。' }]),
    plan('premium', '尊享套餐', 'monthly-tier', [{ period: 'monthly', price: 89.9, monthlyGB: 1000, reset: RESET, note: '页面：高带宽专属服务器节点，限制 10 个在线客户端，最高 1Gbps。' }]),
    plan('custom', '独享定制套餐', 'custom', [
      {
        period: 'monthly',
        price: 199.9,
        reset: '页面：不限流量（合理使用原则）',
        note: '页面写“不限流量（合理使用原则）、不限制在线客户端数量”，没有给出具体 GB 数，因此流量字段留空。',
      },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面“实时延迟”小组件出现“香港 IPLC 极速专线”（无时间与来源）' }),
    region('SG', '新加坡', null, 'C', [T], { note: '“新加坡 IEPL 极速专线”' }),
    region('JP', '日本', null, 'C', [T], { note: '“东京 CN2 高级中继”' }),
    region('TW', '台湾', null, 'C', [T], { note: '“台湾 HiNet 直连节点”' }),
    region('US', '美国', null, 'C', [T], { note: '“洛杉矶 BGP 优质宽带”' }),
  ],
  nodeCount: claim(50, 'C', ['owner-2026-10-28'], { recordedAt: '2026-10-29', note: '站长 2026-10-29 确认飞V有 50+ 个节点（不少于 50 个的下限说法），没有分地区数量。' }),
  protocols: claim(['Shadowsocks'], 'C', [T], { note: '页面写“完美适配 Clash、Shadowsocks 客户端”和“新型混淆加密协议”；汇编库另写 Trojan，未采用。' }),
  routeTypes: claim(['bgp', 'iplc'], 'C', [T], { note: '体验/基础套餐为 BGP 中继，标准及以上含 IPLC；小组件还出现 IEPL、CN2 与 HiNet 直连等标签，页面未说明各套餐对应关系。' }),
  clients: claim(['官方 Android / iOS 客户端', 'Clash Verge', 'Clash Verge Rev', 'ClashParty', 'Shadowrocket', '路由器'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+'], 'C', [T], { note: '仅见于页面里的用户评价文字，本站不据此认定解锁情况。' }),
  ai: claim(null, 'D', [T], { note: '页面未写明 AI 平台支持；汇编库的“ChatGPT-4o / Claude”未采用。' }),
  deviceLimit: claim('按套餐分级：体验 1 台、基础 2 台、标准 3 台、旗舰 5 台、尊享 10 台、定制不限', 'C', [T]),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档的“全球节点实时延迟”和用户评价没有时间、测试环境与来源，本站不引用；页面写退款条件为购买后 24 小时内且已用流量不超过 5%。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'flyv-standard-traffic',
      field: '标准套餐月流量',
      summary: '页面存档 250GB；汇编资料库 260GB。',
      variants: [
        { label: '页面存档', sourceId: T, grade: 'C' },
        { label: '汇编资料库', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档记录并标记冲突，不参与每 GB 排序。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
