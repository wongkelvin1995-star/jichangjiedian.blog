import { claim, planFactory, region, seed } from '../helpers';
import type { OfferInput } from '../helpers';

const T = 't27'; // 页面存档：第三方评测页 飞为(Firefly)（页面日期 2026-10-16）
const M = 'm27';
const D = '2026-10-16';
const plan = planFactory({ brandId: 'firefly', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';

const tier = (gb: number, m: number, q: number, y: number): OfferInput[] => [
  { period: 'monthly', price: m, monthlyGB: gb, reset: RESET },
  { period: 'quarterly', price: q, monthlyGB: gb, reset: RESET },
  { period: 'annual', price: y, monthlyGB: gb, reset: RESET },
];

export default seed({
  slug: 'firefly',
  displayRank: 11,
  brandName: 'Firefly',
  shortName: 'Firefly',
  nameEn: 'Firefly',
  aliases: ['飞为', 'feiwei', 'firefly', 'Firefly', 'Firefly VPN', '飞为梯子', '飞为机场'],
  uploadFileNo: 27,
  summary:
    'Firefly（旧名“飞为”）的页面存档（第三方评测页，2026-10-16）给出年付版、四档月流量套餐和 100GB 一次性套餐的价格，并附一份 2026-07-16 凌晨的第三方历史测速摘录。注意 Firefly 与飞V 是不同品牌，本站不合并。',
  identity: { status: 'name-confirmed', notes: ['站长 2026-10-28 确认本站统一使用“Firefly”这个名字，“飞为”保留为别名。', 'Firefly 不等于飞V（FLYV），两者在本站是两条独立记录。'] },
  plans: [
    plan('annual', '年付版', 'annual-small', [{ period: 'annual', price: 96, monthlyGB: 60, reset: RESET, note: '页面：¥96 年付版不参与新用户 8 折码。' }]),
    plan('lite', 'Lite', 'monthly-tier', tier(150, 25, 67, 240)),
    plan('plus', 'Plus', 'monthly-tier', tier(300, 45, 121, 432)),
    plan('blaze', 'Blaze', 'monthly-tier', tier(600, 85, 229, 816)),
    plan('nova', 'Nova', 'monthly-tier', tier(1000, 150, 400, 1360)),
    plan('pack-100', '不限时套餐（一次性）', 'one-time-pack', [{ period: 'one-time', price: 100, totalGB: 100, reset: '页面：¥100 购买 100GB 总流量；有效期与其他规则以结算页为准' }]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: '2026-07-16', note: '页面没有官方地区列表；该地区出现在页面收录的 2026-07-16 测速截图摘录中' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: '2026-07-16', note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: '2026-07-16', note: '同上' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: '2026-07-16', note: '同上' }),
    region('US', '美国', null, 'C', [T], { recordedAt: '2026-07-16', note: '同上' }),
  ],
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: D }),
  routeTypes: claim(['iplc'], 'C', [T], { recordedAt: D, note: '页面写“据机场介绍/公开说明采用 IPLC”，页面作者未独立验证。' }),
  clients: claim(['通用订阅（页面指向客户端教程汇总）'], 'C', [T], { recordedAt: D }),
  streaming: claim(['YouTube', 'Netflix', 'Disney+', 'HBO'], 'C', [T], { recordedAt: D, note: '页面称节点提供原生 IP，并附解锁图；本站未实测。' }),
  ai: claim(['ChatGPT', 'Gemini', 'Meta AI'], 'C', [T], { recordedAt: D, note: '页面列出，本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制客户端在线数量”，页面存档没有此项。' }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面写“公开说明列有全节点不限速”“技术与运营团队有 8 年行业经验”，均为服务商宣称，本站未核验。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [
    '汇编资料库的地区写“欧洲”，页面存档没有欧洲节点信息，本站不据此在地图上标记欧洲国家。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
