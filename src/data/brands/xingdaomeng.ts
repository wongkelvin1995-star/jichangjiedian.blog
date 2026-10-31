import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't08'; // 页面存档：第三方评测页“星岛梦(StarDream)”（页面日期 2026-10-16）
const M = 'm08';
const D = '2026-10-16';
const plan = planFactory({ brandId: 'xingdaomeng', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';

const tier = (gb: number, m: number, q: number, y: number): OfferInput[] => [
  { period: 'monthly', price: m, monthlyGB: gb, reset: RESET },
  { period: 'quarterly', price: q, monthlyGB: gb, reset: RESET },
  { period: 'annual', price: y, monthlyGB: gb, reset: RESET },
];
const packNote = '页面：一次性流量包按固定总量计算，不按月重置，用完为止；有效期页面未写明。';

export default seed({
  slug: 'xingdaomeng',
  displayRank: 18,
  brandName: '星岛梦 StarDream',
  shortName: '星岛梦',
  nameEn: 'StarDream',
  aliases: ['星岛梦', 'StarDream', 'StarDream VPN', 'XDM', 'XDM VPN', 'XDM 梯子', '星岛梦机场'],
  uploadFileNo: 8,
  summary:
    '星岛梦的页面存档（第三方评测页，2026-10-16）列出年付小包、四档周期套餐和三档不限时流量包，自述提供直连与 IPLC，并收录一份 2026-06-17 傍晚的第三方历史测速摘录，以及一份 2026-06-27 的解锁图文字说明。后者的时间戳与结果同样出现在快狸的页面中，归属存疑，本站不把它当作星岛梦的证据。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面称星岛梦“也有人称 XDM”，并列出“StarDream VPN”“XDM VPN”“XDM 梯子”“星岛梦机场”等叫法；这些别称来自页面（C 级），本站仅作检索别名收录。'],
  },
  plans: [
    plan('xiaobao', '贴心小包', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: RESET, note: '页面：每月 60GB，需一次支付 ¥96 年费，折合约 ¥8/月；页面未展示月付、季付。' },
    ]),
    plan('over150', '超量150G', 'monthly-tier', tier(150, 25, 75, 240)),
    plan('adv300', '进阶300G', 'monthly-tier', tier(300, 50, 145, 480)),
    plan('flash500', '闪光500G', 'monthly-tier', tier(500, 70, 195, 699)),
    plan('flagship1t', '旗舰1T版', 'monthly-tier', tier(1000, 130, 370, 1249)),
    plan('pack-100', '永久不限时100G', 'one-time-pack', [{ period: 'one-time', price: 100, totalGB: 100, reset: packNote }]),
    plan('pack-300', '永久不限时300G', 'one-time-pack', [{ period: 'one-time', price: 300, totalGB: 300, reset: packNote }]),
    plan('pack-1t', '永久不限时1TB', 'one-time-pack', [
      { period: 'one-time', price: 600, totalGB: 1000, reset: packNote, note: '页面写 1TB，按 1TB=1000GB 记为 1000GB。' },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D, nodeNames: ['香港09'], note: '页面写“节点覆盖香港、台湾、日本、新加坡、美国、英国及其他页面所列地区”；节点名取自 2026-06-17 测速摘录。' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D, nodeNames: ['台湾03'] }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D, nodeNames: ['日本06', '日本01'] }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D, nodeNames: ['新加坡01'] }),
    region('US', '美国', null, 'C', [T], { recordedAt: D, nodeNames: ['美国02'] }),
    region('GB', '英国', null, 'C', [T], { recordedAt: D, note: '页面列出英国，但没有任何该地区的测速或节点名称。' }),
  ],
  protocols: claim(null, 'D', [T, M], { note: '页面存档没有写传输协议；汇编资料库写“VLESS / Shadowsocks / 通用订阅”，页面不支持。' }),
  routeTypes: claim(['direct', 'iplc'], 'C', [T], { recordedAt: D, note: '页面写“提供直连与 IPLC”，没有说明哪些节点属于哪一类；页面作者未独立验证。' }),
  clients: claim(['通用订阅（可导入兼容客户端）'], 'C', [T], { recordedAt: D, note: '页面指向客户端教程汇总，没有列出具体客户端。' }),
  streaming: claim(['Netflix', 'Disney+', 'HBO Max', 'YouTube', 'Spotify', 'Hulu', 'TikTok'], 'C', [T], {
    recordedAt: D,
    note: '页面称原生 IP 节点支持这些平台。页面另有一段 2026-06-27 15:11:12 的解锁图文字说明（日本01 的 Netflix 为 N/A、TikTok 失败；新加坡01 的 YouTube 显示“送中(CN)”），但相同的时间戳与相同的节点结果也出现在快狸的页面里，这张图的归属存疑，本站不把它当作星岛梦的证据，也不是本站测试。',
  }),
  ai: claim(['ChatGPT', 'Copilot', 'Gemini'], 'C', [T], { recordedAt: D, note: '页面称支持；解锁图仅显示日本01 的 OpenAI 解锁 JP。本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制在线设备数量”，页面存档没有此项。' }),
  multiplier: claim(null, 'D', [M], { note: '页面存档没有写节点倍率；汇编资料库的“晚高峰不限速，动态智能加速”不是倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“低延迟、晚高峰不限速和动态加速”是线路保障，属于服务商宣称。页面收录的 2026-06-17 18:32 历史测速里，美国02 的速度为 KB 级；这只是单次测试中的一个节点，不代表整体，但说明“晚高峰不限速”不能替代分时段实测。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面另列“年付 8 折、2 年付 7 折、3 年付 6 折”和一个优惠码，但没有列出两年付、三年付的具体价格；本站不推算填入；站长提供的优惠码见品牌页，实付以结算页为准。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'xingdaomeng-shared-unlock-image',
      field: '解锁图归属',
      summary: '2026-06-27 15:11:12 的解锁图文字说明（日本01、新加坡01 的结果）同时出现在星岛梦与快狸两个页面中，结果一致，无法确定它属于哪一家。',
      variants: [
        { label: '星岛梦页面：独立解锁图 2026-06-27 15:11:12（日本01、新加坡01）', sourceId: T, grade: 'C' },
        { label: '快狸页面：历史解锁图 2026-06-27 15:11:12（日本01、新加坡01 等五行）', sourceId: 't22', grade: 'C' },
      ],
      handling: '该解锁图不作为星岛梦或快狸任何一家的证据；两家的解锁字段都只保留服务商宣称，并注明归属存疑。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
