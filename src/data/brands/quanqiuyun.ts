import { claim, planFactory, region, seed } from '../helpers';

const T = 't13'; // 页面存档：自称“全球云 (Global Cloud)”品牌站（页面未标注抓取日期）
const M = 'm13';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'quanqiuyun', src: T, recorded: null });
const RESET = '页面 FAQ：所有套餐流量按月重置';

export default seed({
  slug: 'quanqiuyun',
  displayRank: 14,
  brandName: '全球云',
  shortName: '全球云',
  nameEn: 'Global Cloud',
  aliases: ['全球云', 'Global Cloud', 'GlobalCloud', 'quanqiuyun', '全球云机场'],
  uploadFileNo: 13,
  summary:
    '全球云的品牌站存档没有标注日期，只列出月付价格（五个方案：¥20 / ¥40 / ¥100 / ¥180 / ¥600），宣称 IPLC/IEPL 专线、60+ 节点和 1 倍率；但页面的每个套餐卡片又标着“BGP 智能优化”，线路类型自相矛盾，本站标为冲突。',
  identity: {
    status: 'name-confirmed',
    notes: ['“全球云”与站长清单中的“环球云”是两个不同名称，本站不合并。页面名称为“全球云 (Global Cloud)”。'],
  },
  plans: [
    plan('entry', '入门方案', 'monthly-tier', [{ period: 'monthly', price: 20, monthlyGB: 120, reset: RESET }]),
    plan('advanced', '进阶方案', 'monthly-tier', [{ period: 'monthly', price: 40, monthlyGB: 300, reset: RESET }]),
    plan('high', '高端方案', 'monthly-tier', [{ period: 'monthly', price: 100, monthlyGB: 700, reset: RESET }], {
      deviceLimit: claim('不限制设备数量（页面标注）', 'C', [T]),
    }),
    plan(
      'business',
      '商业方案',
      'monthly-tier',
      [{ period: 'monthly', price: 180, monthlyGB: 1500, reset: RESET, note: '页面写 1.5TB，按 1TB=1000GB 记为 1500GB。' }],
      { deviceLimit: claim('支持大量设备同时在线（页面标注，未写具体数字）', 'C', [T]) },
    ),
    plan(
      'dedicated',
      '独享私人专线',
      'custom',
      [{ period: 'monthly', price: 600, monthlyGB: 500, reset: RESET, note: '页面写“500GB 专线独享流量、独立公网 IP、专人技术维护”，定位 TikTok 直播/独立站场景。' }],
    ),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“覆盖香港、日本、新加坡、美国、英国等”，是服务商宣称的地区范围，未附节点名单。' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
    region('GB', '英国', null, 'C', [T], { note: '同上' }),
  ],
  nodeCount: claim(60, 'C', [T], { note: '页面写“60+ 节点”，是“不少于 60”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(['V2Ray', 'Trojan'], 'C', [T], {
    conflict: true,
    note: '页面把 Shadowrocket / Clash / V2Ray / Trojan 并列写在“多平台支持”下，客户端与协议混写；汇编资料库写 Shadowsocks / Trojan，两处不完全一致。',
  }),
  routeTypes: claim(['iplc', 'iepl', 'bgp'], 'C', [T], {
    conflict: true,
    note: '页面介绍写“企业级 IPLC / IEPL 专线”，各套餐卡片的标签却写“BGP 智能优化”，页面没有说明哪些节点属于哪一类；在核验前不当作确定数据。',
  }),
  clients: claim(['Shadowrocket', 'Clash', '适配 iOS / Android / Windows / macOS / 路由器（页面标注）'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+', 'TikTok'], 'C', [T], { note: '页面写“节点通常标示可解锁…”，没有附检测截图；本站未实测。' }),
  ai: claim(['ChatGPT', 'Claude'], 'C', [T], { note: '页面写支持，没有附检测截图；本站未实测。' }),
  deviceLimit: claim(null, 'D', [T, M], {
    note: '页面只有“高端方案”明确写“不限制设备数量”，其余方案没有具体数字；汇编资料库把全部套餐写成不限制连接数，页面存档不支持这一点。',
  }),
  multiplier: claim('节点统一 1x 倍率（使用 1GB 流量只扣 1GB 额度）', 'C', [T], { note: '来自页面 FAQ 的服务商声明。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期，并含“4.9/5 (1,258 用户好评)”和用户评价文字；这些无法核验，本站不采用。“带宽 2Gbps+”“4K/8K 秒开”同为服务商宣称。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'quanqiuyun-route-type',
      field: '线路类型',
      summary: '页面介绍写 IPLC / IEPL 专线，套餐卡片标签写“BGP 智能优化”。',
      variants: [
        { label: '页面介绍：企业级 IPLC / IEPL 专线', sourceId: T, grade: 'C' },
        { label: '页面套餐卡片：BGP 智能优化', sourceId: T, grade: 'C' },
      ],
      handling: '两种说法同时保留并标为冲突，不在线路筛选中算作已确认 IPLC/IEPL。',
    },
    {
      conflictId: 'quanqiuyun-protocol',
      field: '传输协议',
      summary: '页面写 V2Ray / Trojan，汇编资料库写 Shadowsocks / Trojan。',
      variants: [
        { label: '页面存档：V2Ray / Trojan', sourceId: T, grade: 'C' },
        { label: '汇编资料库：Shadowsocks / Trojan', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档为准并标注冲突；协议不参与筛选的“已确认”状态。',
    },
  ],
  editorialNotes: [
    '该页面的套餐价位与流量档位（¥20/120GB、¥40/300GB、¥100/700GB、¥180/1500GB、¥600/500GB）与暮光加速页面存档相同。这可能说明两者使用了相同的套餐模板，本站不据此判断两者的关系。',
    '页面底部有一个 Telegram 联系方式，本站不转载个人联系方式。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
